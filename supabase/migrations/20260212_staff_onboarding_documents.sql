-- Staff Onboarding Documents
-- AI-powered document upload and verification system
-- Tracks all 29 document types with points-based verification

-- Main onboarding session table
CREATE TABLE IF NOT EXISTS staff_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  application_id UUID REFERENCES job_applications(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  -- Points tracking
  total_points INTEGER NOT NULL DEFAULT 0,
  identity_points INTEGER NOT NULL DEFAULT 0,
  tax_points INTEGER NOT NULL DEFAULT 0,
  sss_points INTEGER NOT NULL DEFAULT 0,
  philhealth_points INTEGER NOT NULL DEFAULT 0,
  pagibig_points INTEGER NOT NULL DEFAULT 0,
  photo_points INTEGER NOT NULL DEFAULT 0,
  
  -- Extracted data (merged from all docs)
  extracted_data JSONB DEFAULT '{}',
  
  -- Cross-validation results
  validation_results JSONB DEFAULT '{}',
  validation_warnings TEXT[],
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_candidate_onboarding UNIQUE (candidate_id, application_id)
);

-- Individual document uploads
CREATE TABLE IF NOT EXISTS staff_onboarding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID NOT NULL REFERENCES staff_onboarding(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  
  -- Document info
  document_type TEXT NOT NULL, -- matches keys in DOCUMENT_TYPES
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  -- AI Classification
  ai_detected_type TEXT, -- What AI thought it was
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Extracted data
  extracted_data JSONB DEFAULT '{}',
  extraction_confidence JSONB DEFAULT '{}', -- Per-field confidence
  
  -- Points
  points_awarded INTEGER NOT NULL DEFAULT 0,
  
  -- Verification status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'rejected', 'needs_review')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Auto-verification
  auto_verified BOOLEAN DEFAULT FALSE,
  auto_verify_reason TEXT,
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_candidate ON staff_onboarding(candidate_id);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_status ON staff_onboarding(status);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_docs_onboarding ON staff_onboarding_documents(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_docs_candidate ON staff_onboarding_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_docs_type ON staff_onboarding_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_staff_onboarding_docs_status ON staff_onboarding_documents(status);

-- RLS
ALTER TABLE staff_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_onboarding_documents ENABLE ROW LEVEL SECURITY;

-- Candidates can see their own onboarding
CREATE POLICY "Candidates see own onboarding"
  ON staff_onboarding FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "Candidates see own documents"
  ON staff_onboarding_documents FOR SELECT
  USING (candidate_id = auth.uid());

-- Candidates can insert their own documents
CREATE POLICY "Candidates upload documents"
  ON staff_onboarding_documents FOR INSERT
  WITH CHECK (candidate_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role full access onboarding"
  ON staff_onboarding FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access documents"
  ON staff_onboarding_documents FOR ALL
  USING (auth.role() = 'service_role');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_staff_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_onboarding_updated_at
  BEFORE UPDATE ON staff_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_staff_onboarding_updated_at();

CREATE TRIGGER staff_onboarding_documents_updated_at
  BEFORE UPDATE ON staff_onboarding_documents
  FOR EACH ROW EXECUTE FUNCTION update_staff_onboarding_updated_at();

-- Comments
COMMENT ON TABLE staff_onboarding IS 'Staff onboarding sessions with document verification';
COMMENT ON TABLE staff_onboarding_documents IS 'Individual documents uploaded during onboarding';
COMMENT ON COLUMN staff_onboarding.total_points IS 'Sum of all verified document points. Min 155 to complete.';
COMMENT ON COLUMN staff_onboarding_documents.ai_detected_type IS 'Document type detected by AI classification';
COMMENT ON COLUMN staff_onboarding_documents.rejection_reason IS 'Reason shown to candidate if document rejected';
