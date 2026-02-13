-- Job Candidate Matches table
-- Stores AI-generated candidate matches for jobs (reverse of job_matches)
-- Used by recruiters to find best candidates for their open positions

CREATE TABLE IF NOT EXISTS job_candidate_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  breakdown JSONB NOT NULL DEFAULT '{}',
  matching_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  reasoning TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  CONSTRAINT job_candidate_matches_unique UNIQUE (job_id, candidate_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_job_candidate_matches_job ON job_candidate_matches(job_id);
CREATE INDEX IF NOT EXISTS idx_job_candidate_matches_candidate ON job_candidate_matches(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_candidate_matches_score ON job_candidate_matches(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_candidate_matches_generated ON job_candidate_matches(generated_at DESC);

-- RLS policies
ALTER TABLE job_candidate_matches ENABLE ROW LEVEL SECURITY;

-- Allow recruiters to see matches for jobs in their agency
CREATE POLICY "Recruiters can view job matches"
  ON job_candidate_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN recruiter_clients rc ON rc.company_id = j.company_id
      JOIN agency_recruiters ar ON ar.agency_id = rc.agency_id
      WHERE j.id = job_candidate_matches.job_id
      AND ar.user_id = auth.uid()
    )
  );

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON job_candidate_matches FOR ALL
  USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE job_candidate_matches IS 'AI-generated candidate matches for job positions';
COMMENT ON COLUMN job_candidate_matches.overall_score IS 'Match score 0-100 based on skills, salary, experience, etc.';
COMMENT ON COLUMN job_candidate_matches.breakdown IS 'Individual score components (skills, salary, experience, etc.)';
COMMENT ON COLUMN job_candidate_matches.matching_skills IS 'Skills that match between candidate and job';
COMMENT ON COLUMN job_candidate_matches.missing_skills IS 'Required job skills the candidate lacks';
