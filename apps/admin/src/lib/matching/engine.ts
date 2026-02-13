/**
 * Unified Matching Engine
 * Used for both directions:
 * - Candidate → Jobs (what jobs suit this candidate?)
 * - Job → Candidates (what candidates suit this job?)
 * 
 * Same algorithm, just different perspective.
 */

export interface MatchScoreBreakdown {
  skills_score: number;
  salary_score: number;
  experience_score: number;
  arrangement_score: number;
  shift_score: number;
  location_score: number;
}

export interface CandidateData {
  id: string;
  skills: string[];
  experience_years: number;
  expected_salary_min?: number;
  expected_salary_max?: number;
  preferred_work_setup?: string;
  preferred_shift?: string;
  location_city?: string;
  work_status?: string;
}

export interface JobData {
  id: string;
  title: string;
  skills: string[];
  salary_min?: number;
  salary_max?: number;
  work_arrangement?: string;
  shift?: string;
  location_city?: string;
}

export interface MatchResult {
  overall_score: number;
  breakdown: MatchScoreBreakdown;
  matching_skills: string[];
  missing_skills: string[];
}

/**
 * Calculate match between a candidate and a job
 * Works in both directions - same score regardless of perspective
 */
export function calculateMatch(candidate: CandidateData, job: JobData): MatchResult {
  const candidateSkills = candidate.skills.map(s => s.toLowerCase());
  const jobSkills = job.skills.map(s => s.toLowerCase());

  const breakdown = {
    skills_score: calculateSkillsScore(candidateSkills, jobSkills),
    salary_score: calculateSalaryScore(candidate, job),
    experience_score: calculateExperienceScore(candidate.experience_years, job.title),
    arrangement_score: calculateArrangementScore(candidate.preferred_work_setup, job.work_arrangement),
    shift_score: calculateShiftScore(candidate.preferred_shift, job.shift),
    location_score: calculateLocationScore(candidate.location_city, job.location_city, job.work_arrangement),
  };

  const overall_score = calculateOverallScore(breakdown);
  const matching_skills = candidateSkills.filter(s => jobSkills.includes(s));
  const missing_skills = jobSkills.filter(s => !candidateSkills.includes(s));

  return {
    overall_score,
    breakdown,
    matching_skills,
    missing_skills,
  };
}

function calculateOverallScore(breakdown: MatchScoreBreakdown): number {
  const weights = {
    skills: 0.40,
    salary: 0.25,
    experience: 0.15,
    arrangement: 0.10,
    shift: 0.05,
    location: 0.05,
  };

  return Math.round(
    breakdown.skills_score * weights.skills +
    breakdown.salary_score * weights.salary +
    breakdown.experience_score * weights.experience +
    breakdown.arrangement_score * weights.arrangement +
    breakdown.shift_score * weights.shift +
    breakdown.location_score * weights.location
  );
}

function calculateSkillsScore(candidateSkills: string[], jobSkills: string[]): number {
  if (!jobSkills.length) return 100;
  const matches = candidateSkills.filter(s => jobSkills.includes(s)).length;
  return Math.round((matches / jobSkills.length) * 100);
}

function calculateSalaryScore(candidate: CandidateData, job: JobData): number {
  if (!candidate.expected_salary_min && !candidate.expected_salary_max) return 85;
  if (!job.salary_min && !job.salary_max) return 85;

  const candMin = candidate.expected_salary_min || 0;
  const candMax = candidate.expected_salary_max || candMin * 1.3;
  const jobMin = job.salary_min || 0;
  const jobMax = job.salary_max || jobMin * 1.3;

  // Deal breaker: candidate wants more than job pays
  if (candMin > jobMax && jobMax > 0) return 15;
  
  // Candidate undervaluing themselves
  if (candMax < jobMin) return 70;

  // Good overlap
  const overlapMin = Math.max(candMin, jobMin);
  const overlapMax = Math.min(candMax, jobMax);
  if (overlapMax >= overlapMin) return 95;

  return 60;
}

function calculateExperienceScore(years: number, jobTitle: string): number {
  const titleLower = jobTitle.toLowerCase();
  let required = 3;

  if (titleLower.includes('junior') || titleLower.includes('entry')) required = 1;
  else if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) required = 5;
  else if (titleLower.includes('manager') || titleLower.includes('director')) required = 7;

  const diff = Math.abs(years - required);
  if (diff <= 1) return 100;
  if (diff <= 2) return 85;
  if (diff <= 3) return 70;
  if (diff <= 5) return 50;
  return 35;
}

function calculateArrangementScore(candPref?: string, jobArrangement?: string): number {
  if (!candPref || !jobArrangement) return 80;
  
  const cand = candPref.toLowerCase();
  const job = jobArrangement.toLowerCase();
  
  if (cand === job) return 100;
  if (cand === 'hybrid' || job === 'hybrid') return 85;
  if (cand === 'flexible') return 95;
  if (cand === 'remote' && job === 'onsite') return 25;
  if (cand === 'onsite' && job === 'remote') return 70;
  return 60;
}

function calculateShiftScore(candShift?: string, jobShift?: string): number {
  if (!candShift || !jobShift) return 80;
  
  const cand = candShift.toLowerCase();
  const job = jobShift.toLowerCase();
  
  if (cand === job) return 100;
  if (cand === 'flexible' || job === 'flexible') return 95;
  if (cand === 'day' && (job === 'night' || job === 'graveyard')) return 25;
  if ((cand === 'night' || cand === 'graveyard') && job === 'day') return 45;
  return 60;
}

function calculateLocationScore(candCity?: string, jobCity?: string, arrangement?: string): number {
  if (arrangement === 'remote') return 95;
  if (!candCity || !jobCity) return 70;
  if (candCity.toLowerCase() === jobCity.toLowerCase()) return 100;
  if (arrangement === 'hybrid') return 65;
  return 35;
}

/**
 * Batch calculate matches for a candidate against multiple jobs
 */
export function matchCandidateToJobs(
  candidate: CandidateData,
  jobs: JobData[],
  minScore = 40
): Array<{ job: JobData } & MatchResult> {
  return jobs
    .map(job => ({
      job,
      ...calculateMatch(candidate, job),
    }))
    .filter(m => m.overall_score >= minScore)
    .sort((a, b) => b.overall_score - a.overall_score);
}

/**
 * Batch calculate matches for a job against multiple candidates
 */
export function matchJobToCandidates(
  job: JobData,
  candidates: CandidateData[],
  minScore = 40
): Array<{ candidate: CandidateData } & MatchResult> {
  return candidates
    .map(candidate => ({
      candidate,
      ...calculateMatch(candidate, job),
    }))
    .filter(m => m.overall_score >= minScore)
    .sort((a, b) => b.overall_score - a.overall_score);
}
