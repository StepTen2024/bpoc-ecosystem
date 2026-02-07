import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateJobToken } from '@/lib/client-tokens';

/**
 * POST /api/client/interviews/request
 *
 * Client requests an interview with a candidate
 *
 * Body:
 * - token: Job token
 * - applicationId: Application ID
 * - proposedTimes: Array of ISO datetime strings
 * - message: Optional message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, applicationId, proposedTimes, message } = body;

    // Validate required fields
    if (!token || !applicationId || !proposedTimes || !Array.isArray(proposedTimes) || proposedTimes.length < 2) {
      return NextResponse.json(
        { error: 'Token, applicationId, and at least 2 proposed times are required' },
        { status: 400 }
      );
    }

    // Validate job token
    const tokenData = await validateJobToken(token);
    if (!tokenData || !tokenData.isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired access link' },
        { status: 403 }
      );
    }

    // Verify application belongs to this job
    const { data: application, error: appError } = await supabaseAdmin
      .from('job_applications')
      .select(`
        id,
        job_id,
        candidate_id,
        released_to_client,
        candidate:candidates!inner(
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', applicationId)
      .eq('job_id', tokenData.jobId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (!application.released_to_client) {
      return NextResponse.json(
        { error: 'This candidate has not been released to you yet' },
        { status: 403 }
      );
    }

    // Get job and agency details for notifications
    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        agency_client_id,
        agency_clients!inner(
          id,
          agency_id,
          client_name,
          agencies!inner(
            id,
            name
          )
        )
      `)
      .eq('id', tokenData.jobId)
      .single();

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Create interview record with pending status
    const { data: interview, error: interviewError } = await supabaseAdmin
      .from('job_interviews')
      .insert({
        application_id: applicationId,
        interview_type: 'client_round_1',
        status: 'pending_scheduling',
        notes: message || 'Client-requested interview',
        requested_by_client: true,
        metadata: {
          client_request: true,
          requested_via: 'client_portal',
          job_token_id: tokenData.tokenId,
        },
      })
      .select()
      .single();

    if (interviewError || !interview) {
      console.error('Failed to create interview:', interviewError);
      return NextResponse.json(
        { error: 'Failed to create interview request' },
        { status: 500 }
      );
    }

    // Store proposed times
    const { error: proposalError } = await supabaseAdmin
      .from('interview_time_proposals')
      .insert({
        interview_id: interview.id,
        proposed_times: proposedTimes.map((time: string) => ({
          datetime: time,
          timezone: 'Asia/Manila', // Default timezone, can be made configurable
        })),
        status: 'pending',
        proposed_by: tokenData.clientUserId || null, // If client has user account
        metadata: {
          proposed_via: 'client_portal',
          message: message || null,
        },
      });

    if (proposalError) {
      console.error('Failed to store time proposals:', proposalError);
      // Continue anyway, interview is created
    }

    // Get all recruiters from the agency to notify
    const { data: recruiters } = await supabaseAdmin
      .from('agency_recruiters')
      .select('user_id, users!inner(email, first_name, last_name)')
      .eq('agency_id', job.agency_clients.agency_id)
      .eq('status', 'active');

    // Create notifications for recruiters
    if (recruiters && recruiters.length > 0) {
      const notifications = recruiters.map((recruiter: any) => ({
        user_id: recruiter.user_id,
        type: 'interview_request',
        title: 'Client Interview Request',
        message: `${job.agency_clients.client_name} has requested an interview with ${application.candidate.first_name} ${application.candidate.last_name} for ${job.title}`,
        link: `/recruiter/applications/${applicationId}`,
        metadata: {
          application_id: applicationId,
          interview_id: interview.id,
          job_id: job.id,
          proposed_times: proposedTimes,
          client_message: message,
        },
      }));

      await supabaseAdmin.from('notifications').insert(notifications);
    }

    // TODO: Send email notification to recruiters
    // This would integrate with your email service (Resend, SendGrid, etc.)

    return NextResponse.json({
      success: true,
      interviewId: interview.id,
      message: 'Interview request submitted successfully',
    });
  } catch (error) {
    console.error('Error creating interview request:', error);
    return NextResponse.json(
      { error: 'Failed to create interview request' },
      { status: 500 }
    );
  }
}
