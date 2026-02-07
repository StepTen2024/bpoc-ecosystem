import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateJobToken, logClientAccess } from '@/lib/client-tokens';

/**
 * GET /api/client/jobs/[token]/candidates/[id]
 *
 * Get candidate profile details (via job token)
 *
 * Returns:
 * - Full candidate profile
 * - Resume
 * - Work experience
 * - Education
 * - Skills
 * - Application timeline
 * - Upcoming interview (if any)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string; id: string } }
) {
  try {
    const { token, id: applicationId } = params;

    // Validate job token
    const tokenData = await validateJobToken(token);
    if (!tokenData || !tokenData.isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired access link' },
        { status: 403 }
      );
    }

    if (!tokenData.canViewReleasedCandidates) {
      return NextResponse.json(
        { error: 'You do not have permission to view candidates' },
        { status: 403 }
      );
    }

    // Get client IP and user agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const userAgent = request.headers.get('user-agent') || '';

    // Fetch application and verify it's released to client
    const { data: application, error: appError } = await supabaseAdmin
      .from('job_applications')
      .select(`
        id,
        job_id,
        candidate_id,
        status,
        applied_at,
        released_to_client,
        released_at,
        candidate:candidates!inner(
          id,
          slug,
          first_name,
          last_name,
          headline,
          email,
          phone,
          avatar_url,
          bio,
          location,
          work_status,
          expected_salary_min,
          expected_salary_max,
          preferred_shift,
          years_experience
        )
      `)
      .eq('id', applicationId)
      .eq('job_id', tokenData.jobId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Verify candidate is released to client
    if (!application.released_to_client) {
      return NextResponse.json(
        { error: 'This candidate has not been released to you yet' },
        { status: 403 }
      );
    }

    // Fetch resume
    const { data: resume } = await supabaseAdmin
      .from('candidate_resumes')
      .select('*')
      .eq('candidate_id', application.candidate_id)
      .eq('is_primary', true)
      .single();

    // Fetch skills
    const { data: skills } = await supabaseAdmin
      .from('candidate_skills')
      .select('*')
      .eq('candidate_id', application.candidate_id)
      .order('proficiency_level', { ascending: false });

    // Fetch work experience
    const { data: experience } = await supabaseAdmin
      .from('candidate_work_experience')
      .select('*')
      .eq('candidate_id', application.candidate_id)
      .order('start_date', { ascending: false });

    // Fetch education
    const { data: education } = await supabaseAdmin
      .from('candidate_education')
      .select('*')
      .eq('candidate_id', application.candidate_id)
      .order('start_date', { ascending: false });

    // Fetch upcoming interview
    const { data: upcomingInterview } = await supabaseAdmin
      .from('job_interviews')
      .select('*')
      .eq('application_id', applicationId)
      .in('status', ['scheduled', 'confirmed'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single();

    // Fetch pre-screen notes (if shared with client)
    const { data: preScreenRooms } = await supabaseAdmin
      .from('video_call_rooms')
      .select(`
        id,
        call_title,
        call_type,
        created_at,
        ended_at,
        duration_seconds,
        recording_url,
        recording_duration,
        transcription_text,
        transcription_summary,
        ai_notes,
        share_with_client,
        share_with_candidate
      `)
      .eq('application_id', applicationId)
      .eq('share_with_client', true)
      .order('created_at', { ascending: false });

    // Build application timeline (simplified)
    const timeline = [
      {
        action: 'applied',
        at: application.applied_at,
        description: 'Candidate applied to this position',
      },
      application.released_at ? {
        action: 'released_to_client',
        at: application.released_at,
        description: 'Candidate released for your review',
      } : null,
      upcomingInterview ? {
        action: 'interview_scheduled',
        at: upcomingInterview.created_at,
        description: `Interview scheduled for ${new Date(upcomingInterview.scheduled_at).toLocaleDateString()}`,
      } : null,
    ].filter(Boolean);

    // Log access
    await logClientAccess({
      jobTokenId: tokenData.tokenId,
      action: 'viewed_candidate',
      metadata: {
        application_id: applicationId,
        candidate_id: application.candidate_id,
        candidate_name: `${application.candidate.first_name} ${application.candidate.last_name}`,
      },
      ipAddress,
      userAgent,
    });

    // Format response
    const response = {
      candidate: {
        id: application.candidate.id,
        slug: application.candidate.slug,
        fullName: `${application.candidate.first_name} ${application.candidate.last_name}`,
        firstName: application.candidate.first_name,
        lastName: application.candidate.last_name,
        headline: application.candidate.headline,
        avatar: application.candidate.avatar_url,
        bio: application.candidate.bio,
        location: application.candidate.location,
      },
      profile: {
        workStatus: application.candidate.work_status,
        expectedSalary: {
          min: application.candidate.expected_salary_min,
          max: application.candidate.expected_salary_max,
        },
        preferredShift: application.candidate.preferred_shift,
        yearsExperience: application.candidate.years_experience,
        skills: (skills || []).map((skill: any) => ({
          name: skill.name,
          proficiency: skill.proficiency_level,
          yearsExperience: skill.years_experience,
        })),
        experience: (experience || []).map((exp: any) => ({
          company: exp.company_name,
          title: exp.job_title,
          startDate: exp.start_date,
          endDate: exp.end_date,
          isCurrent: exp.is_current,
          description: exp.description,
        })),
        education: (education || []).map((edu: any) => ({
          institution: edu.institution_name,
          degree: edu.degree,
          fieldOfStudy: edu.field_of_study,
          startDate: edu.start_date,
          endDate: edu.end_date,
        })),
      },
      resume: resume ? {
        url: resume.file_url,
        filename: resume.filename,
        atsScore: resume.ats_score,
        contentScore: resume.content_score,
      } : null,
      application: {
        id: application.id,
        status: application.status,
        appliedAt: application.applied_at,
        releasedAt: application.released_at,
        timeline,
      },
      upcomingInterview: upcomingInterview ? {
        id: upcomingInterview.id,
        scheduledAt: upcomingInterview.scheduled_at,
        duration: upcomingInterview.duration,
        timezone: upcomingInterview.timezone || 'Asia/Manila',
        status: upcomingInterview.status,
      } : null,
      preScreens: (preScreenRooms || []).map((room: any) => ({
        id: room.id,
        title: room.call_title,
        type: room.call_type,
        date: room.created_at,
        endedAt: room.ended_at,
        durationSeconds: room.duration_seconds,
        recordingUrl: room.recording_url,
        recordingDuration: room.recording_duration,
        transcription: room.transcription_text,
        summary: room.transcription_summary,
        notes: room.ai_notes,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidate profile' },
      { status: 500 }
    );
  }
}
