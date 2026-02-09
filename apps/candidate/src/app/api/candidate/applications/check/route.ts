import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET /api/candidate/applications/check?jobId=xxx
 * Check if candidate has already applied to a job
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ hasApplied: false });
    }

    const jobId = request.nextUrl.searchParams.get('jobId');
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    const { data: application } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('candidate_id', session.user.id)
      .eq('job_id', jobId)
      .single();

    return NextResponse.json({ 
      hasApplied: !!application,
      applicationId: application?.id || null,
    });

  } catch (error: any) {
    console.error('Error checking application:', error);
    return NextResponse.json({ hasApplied: false });
  }
}
