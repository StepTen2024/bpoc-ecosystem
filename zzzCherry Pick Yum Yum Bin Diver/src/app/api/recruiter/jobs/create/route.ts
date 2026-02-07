import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyAuthToken } from '@/lib/auth/verify-token';
import { generateJobToken } from '@/lib/client-tokens';
import { sendClientJobCreatedEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthToken(request);
    const userId = auth.userId;
    if (!userId) {
      return NextResponse.json({ error: auth.error || 'Not authenticated' }, { status: 401 });
    }

    // Verify recruiter and get their info
    const { data: recruiter, error: recruiterError } = await supabaseAdmin
      .from('agency_recruiters')
      .select('id, agency_id, role')
      .eq('user_id', userId)
      .single();

    if (recruiterError || !recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 403 });
    }

    const body = await request.json();
    const {
      agency_client_id,
      clientId, // Also accept clientId for compatibility
      title,
      description,
      briefDescription,
      requirements,
      responsibilities,
      benefits,
      skills,
      salaryMin,
      salaryMax,
      currency,
      workType,
      workArrangement,
      shift,
      experienceLevel,
    } = body;

    // Use agency_client_id or clientId
    const selectedClientId = agency_client_id || clientId;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!selectedClientId) {
      return NextResponse.json({ error: 'Client is required' }, { status: 400 });
    }

    // Verify the client belongs to this recruiter's agency
    const { data: client, error: clientError } = await supabaseAdmin
      .from('agency_clients')
      .select('id, agency_id')
      .eq('id', selectedClientId)
      .eq('agency_id', recruiter.agency_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found or does not belong to your agency' }, { status: 400 });
    }

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 10);

    // Map form values to database enum values
    const expLevelMap: Record<string, string> = {
      'entry': 'entry_level',
      'mid': 'mid_level',
      'senior': 'senior_level',
      'lead': 'senior_level',
      'entry_level': 'entry_level',
      'mid_level': 'mid_level',
      'senior_level': 'senior_level',
    };
    const mappedExperienceLevel = expLevelMap[experienceLevel] || 'mid_level';

    // Map shift values (form might send 'flexible' but db expects 'both')
    const shiftMap: Record<string, string> = {
      'day': 'day',
      'night': 'night',
      'flexible': 'both',
      'both': 'both',
    };
    const mappedShift = shiftMap[shift] || 'day';

    // Determine approval status based on recruiter role
    // Admins and managers can auto-approve their own jobs
    // Regular recruiters need approval
    const isAdmin = recruiter.role === 'admin' || recruiter.role === 'manager';
    const approvalStatus = isAdmin ? 'approved' : 'pending_approval';
    const jobStatus = isAdmin ? 'active' : 'draft';

    // Create job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        agency_client_id: selectedClientId,
        posted_by: recruiter.id,
        title,
        slug,
        description: description || briefDescription || '',
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        benefits: benefits || [],
        salary_min: salaryMin ? parseFloat(salaryMin) : null,
        salary_max: salaryMax ? parseFloat(salaryMax) : null,
        currency: currency || 'PHP',
        work_type: workType || 'full_time',
        work_arrangement: workArrangement || 'remote',
        shift: mappedShift,
        experience_level: mappedExperienceLevel,
        status: jobStatus,
        approval_status: approvalStatus,
        approved_by: isAdmin ? recruiter.id : null,
        approved_at: isAdmin ? new Date().toISOString() : null,
        requires_approval: !isAdmin,
        source: 'manual',
      })
      .select()
      .single();

    if (jobError) {
      console.error('Job creation error:', jobError);
      return NextResponse.json({ error: 'Failed to create job', details: jobError.message }, { status: 500 });
    }

    // Add skills
    if (skills && skills.length > 0) {
      const skillInserts = skills.map((skill: string) => ({
        job_id: job.id,
        name: skill,
        is_required: true,
      }));

      await supabaseAdmin
        .from('job_skills')
        .insert(skillInserts);
    }

    // Generate client job access token (standard platform)
    let jobToken = null;
    try {
      const tokenData = await generateJobToken(
        job.id,
        selectedClientId,
        userId,
        null // No expiration - permanent until job closes
      );
      jobToken = tokenData;

      // Send email to client with job dashboard link
      try {
        // Get client contact information
        const { data: clientContact } = await supabaseAdmin
          .from('agency_clients')
          .select('contact_name, contact_email')
          .eq('id', selectedClientId)
          .single();

        // Get recruiter information
        const { data: recruiterUser } = await supabaseAdmin
          .from('users')
          .select('first_name, last_name')
          .eq('id', userId)
          .single();

        if (clientContact?.contact_email && recruiterUser) {
          const recruiterName = `${recruiterUser.first_name} ${recruiterUser.last_name}`;
          await sendClientJobCreatedEmail(
            clientContact.contact_email,
            clientContact.contact_name || 'Client',
            title,
            recruiterName,
            tokenData.dashboardUrl
          );
          console.log('Job created email sent to client:', clientContact.contact_email);
        }
      } catch (emailError) {
        console.error('Failed to send job created email:', emailError);
        // Don't fail the request if email fails
      }
    } catch (tokenError) {
      console.error('Failed to generate job token:', tokenError);
      // Continue anyway - token generation failure shouldn't block job creation
    }

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      job,
      clientJobToken: jobToken, // Include token data in response
    });

  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
