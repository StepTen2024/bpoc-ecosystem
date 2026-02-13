import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyRecruiterAuth } from '@/lib/auth-helpers';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3003';

/**
 * GET /api/recruiter/jobs/[id]/matches
 * Get matching candidates for a job
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyRecruiterAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jobId } = await context.params;

    // Get cached matches from database
    const { data: matches, error } = await supabaseAdmin
      .from('job_candidate_matches')
      .select('*')
      .eq('job_id', jobId)
      .order('overall_score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching matches:', error);
    }

    // Enrich with candidate data
    const enrichedMatches = [];
    if (matches && matches.length > 0) {
      const candidateIds = matches.map(m => m.candidate_id);
      
      const { data: candidates } = await supabaseAdmin
        .from('candidate_truth')
        .select('id, first_name, last_name, avatar_url, headline, current_position, location_city, experience_years, skills, work_status, ai_analysis')
        .in('id', candidateIds);

      const candidateMap = new Map(candidates?.map(c => [c.id, c]) || []);

      for (const match of matches) {
        const candidate = candidateMap.get(match.candidate_id);
        if (candidate) {
          enrichedMatches.push({
            ...match,
            candidate,
          });
        }
      }
    }

    return NextResponse.json({
      job_id: jobId,
      matches: enrichedMatches,
      generated_at: matches?.[0]?.generated_at || null,
      count: enrichedMatches.length,
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/recruiter/jobs/[id]/matches
 * Generate new matches (calls admin API)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyRecruiterAuth(request);
    if (!auth.isValid || !auth.recruiterId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: jobId } = await context.params;

    // Check rate limit based on plan
    const { data: recruiter } = await supabaseAdmin
      .from('agency_recruiters')
      .select('agency_id')
      .eq('id', auth.recruiterId)
      .single();

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    const { data: agency } = await supabaseAdmin
      .from('agencies')
      .select('subscription_tier')
      .eq('id', recruiter.agency_id)
      .single();

    const tier = agency?.subscription_tier || 'free';

    // Check last generation time
    const { data: lastMatch } = await supabaseAdmin
      .from('job_candidate_matches')
      .select('generated_at')
      .eq('job_id', jobId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastMatch?.generated_at) {
      const lastGen = new Date(lastMatch.generated_at);
      const now = new Date();
      const hoursSince = (now.getTime() - lastGen.getTime()) / (1000 * 60 * 60);

      // Rate limits by tier
      const limits: Record<string, number> = {
        free: 168,       // 1 week
        standard: 24,    // 1 day
        enterprise: 1,   // 1 hour
      };

      const limitHours = limits[tier] || 168;

      if (hoursSince < limitHours) {
        const nextRefresh = new Date(lastGen.getTime() + limitHours * 60 * 60 * 1000);
        return NextResponse.json({
          error: 'Rate limit exceeded',
          next_refresh_at: nextRefresh.toISOString(),
          tier,
          limit_hours: limitHours,
        }, { status: 429 });
      }
    }

    // Call admin matching API
    const adminResponse = await fetch(`${ADMIN_API_URL}/api/matching/job-to-candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, limit: 100 }),
    });

    if (!adminResponse.ok) {
      const error = await adminResponse.json();
      return NextResponse.json({ error: error.error || 'Failed to generate' }, { status: 500 });
    }

    const result = await adminResponse.json();

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error: any) {
    console.error('Error generating matches:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
