import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { matchCandidateToJobs, CandidateData, JobData } from '@/lib/matching/engine';

/**
 * POST /api/matching/candidate-to-jobs
 * Find matching jobs for a candidate
 * Called from candidate app
 */
export async function POST(request: NextRequest) {
  try {
    const { candidateId, limit = 50 } = await request.json();

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId required' }, { status: 400 });
    }

    console.log(`🎯 Matching jobs for candidate: ${candidateId}`);

    // Get candidate from candidate_truth view
    const { data: candidateRaw, error: candError } = await supabaseAdmin
      .from('candidate_truth')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (candError || !candidateRaw) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Get active jobs with skills
    const { data: jobsRaw, error: jobsError } = await supabaseAdmin
      .from('jobs')
      .select('*, job_skills(skill_name)')
      .eq('status', 'active')
      .limit(limit);

    if (jobsError || !jobsRaw?.length) {
      return NextResponse.json({
        success: true,
        matches: [],
        message: 'No active jobs found',
      });
    }

    // Transform to engine format
    const candidate: CandidateData = {
      id: candidateRaw.id,
      skills: Array.isArray(candidateRaw.skills)
        ? candidateRaw.skills.map((s: any) => typeof s === 'string' ? s : s.name)
        : [],
      experience_years: candidateRaw.experience_years || 0,
      expected_salary_min: candidateRaw.expected_salary_min,
      expected_salary_max: candidateRaw.expected_salary_max,
      preferred_work_setup: candidateRaw.preferred_work_setup,
      preferred_shift: candidateRaw.preferred_shift,
      location_city: candidateRaw.location_city,
      work_status: candidateRaw.work_status,
    };

    const jobs: JobData[] = jobsRaw.map((j: any) => ({
      id: j.id,
      title: j.title,
      skills: j.job_skills?.map((s: any) => s.skill_name) || [],
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      work_arrangement: j.work_arrangement,
      shift: j.shift,
      location_city: j.location_city,
    }));

    // Run matching
    const matches = matchCandidateToJobs(candidate, jobs);

    // Save matches to database
    const matchRecords = matches.slice(0, 20).map(m => ({
      candidate_id: candidateId,
      job_id: m.job.id,
      overall_score: m.overall_score,
      breakdown: m.breakdown,
      match_reasons: m.matching_skills,
      missing_skills: m.missing_skills,
      is_stale: false,
      analyzed_at: new Date().toISOString(),
      status: 'pending',
    }));

    if (matchRecords.length > 0) {
      await supabaseAdmin
        .from('job_matches')
        .upsert(matchRecords, {
          onConflict: 'candidate_id,job_id',
          ignoreDuplicates: false,
        });
    }

    console.log(`✅ Found ${matches.length} job matches for candidate ${candidateId}`);

    // Return with job details
    const jobMap = new Map(jobsRaw.map((j: any) => [j.id, j]));
    const enrichedMatches = matches.slice(0, 20).map(m => ({
      ...m,
      job: {
        id: m.job.id,
        title: m.job.title,
        ...jobMap.get(m.job.id),
      },
    }));

    return NextResponse.json({
      success: true,
      candidate_id: candidateId,
      matches: enrichedMatches,
      total: matches.length,
      generated_at: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Error matching candidate to jobs:', error);
    return NextResponse.json(
      { error: 'Failed to generate matches', details: error.message },
      { status: 500 }
    );
  }
}
