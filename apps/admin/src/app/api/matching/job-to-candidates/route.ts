import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { matchJobToCandidates, CandidateData, JobData } from '@/lib/matching/engine';

/**
 * POST /api/matching/job-to-candidates
 * Find matching candidates for a job
 * Called from recruiter app
 */
export async function POST(request: NextRequest) {
  try {
    const { jobId, limit = 100 } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 });
    }

    console.log(`🎯 Matching candidates for job: ${jobId}`);

    // Get job with skills
    const { data: jobRaw, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('*, job_skills(skill_name)')
      .eq('id', jobId)
      .single();

    if (jobError || !jobRaw) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Get active candidates from candidate_truth
    const { data: candidatesRaw, error: candError } = await supabaseAdmin
      .from('candidate_truth')
      .select('*')
      .eq('is_active', true)
      .limit(limit);

    if (candError || !candidatesRaw?.length) {
      return NextResponse.json({
        success: true,
        matches: [],
        message: 'No active candidates found',
      });
    }

    // Transform to engine format
    const job: JobData = {
      id: jobRaw.id,
      title: jobRaw.title,
      skills: jobRaw.job_skills?.map((s: any) => s.skill_name) || [],
      salary_min: jobRaw.salary_min,
      salary_max: jobRaw.salary_max,
      work_arrangement: jobRaw.work_arrangement,
      shift: jobRaw.shift,
      location_city: jobRaw.location_city,
    };

    const candidates: CandidateData[] = candidatesRaw.map((c: any) => ({
      id: c.id,
      skills: Array.isArray(c.skills)
        ? c.skills.map((s: any) => typeof s === 'string' ? s : s.name)
        : [],
      experience_years: c.experience_years || 0,
      expected_salary_min: c.expected_salary_min,
      expected_salary_max: c.expected_salary_max,
      preferred_work_setup: c.preferred_work_setup,
      preferred_shift: c.preferred_shift,
      location_city: c.location_city,
      work_status: c.work_status,
    }));

    // Run matching
    const matches = matchJobToCandidates(job, candidates);

    // Save matches to database
    const matchRecords = matches.slice(0, 20).map(m => ({
      job_id: jobId,
      candidate_id: m.candidate.id,
      overall_score: m.overall_score,
      breakdown: m.breakdown,
      matching_skills: m.matching_skills,
      missing_skills: m.missing_skills,
      generated_at: new Date().toISOString(),
    }));

    if (matchRecords.length > 0) {
      await supabaseAdmin
        .from('job_candidate_matches')
        .upsert(matchRecords, {
          onConflict: 'job_id,candidate_id',
          ignoreDuplicates: false,
        });
    }

    console.log(`✅ Found ${matches.length} candidate matches for job ${jobId}`);

    // Return with candidate details
    const candidateMap = new Map(candidatesRaw.map((c: any) => [c.id, c]));
    const enrichedMatches = matches.slice(0, 20).map(m => {
      const candidateFull = candidateMap.get(m.candidate.id);
      return {
        candidate_id: m.candidate.id,
        overall_score: m.overall_score,
        breakdown: m.breakdown,
        matching_skills: m.matching_skills,
        missing_skills: m.missing_skills,
        candidate: {
          id: m.candidate.id,
          first_name: candidateFull?.first_name,
          last_name: candidateFull?.last_name,
          avatar_url: candidateFull?.avatar_url,
          headline: candidateFull?.headline || candidateFull?.current_position,
          location_city: candidateFull?.location_city,
          experience_years: candidateFull?.experience_years,
          skills: candidateFull?.skills?.slice(0, 8),
          work_status: candidateFull?.work_status,
          ai_analysis: candidateFull?.ai_analysis,
        },
      };
    });

    return NextResponse.json({
      success: true,
      job_id: jobId,
      job_title: jobRaw.title,
      matches: enrichedMatches,
      total: matches.length,
      generated_at: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error matching job to candidates:', error);
    return NextResponse.json(
      { error: 'Failed to generate matches', details: error.message },
      { status: 500 }
    );
  }
}
