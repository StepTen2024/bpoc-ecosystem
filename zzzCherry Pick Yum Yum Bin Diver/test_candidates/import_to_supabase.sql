-- ============================================================================
-- Supabase Test Candidates Import Script
-- ============================================================================
-- This script creates 10 test candidate accounts with complete profile data
-- 
-- IMPORTANT: Run this AFTER creating the user accounts in Supabase Auth
-- You'll need to replace the UUID placeholders with actual auth.users IDs
-- ============================================================================

-- Note: These are example UUIDs - replace with actual UUIDs from auth.users after account creation
-- Account creation should be done via Supabase Auth API or dashboard

-- Example of how to create accounts (use Supabase Auth API):
-- POST /auth/v1/signup
-- {
--   "email": "maria.garcia@testbpo.com",
--   "password": "TestBPO2024!",
--   "data": { "first_name": "Maria", "last_name": "Garcia" }
-- }

-- ============================================================================
-- STEP 1: Create candidate records
-- ============================================================================
-- After creating auth accounts, insert into candidates table with actual UUIDs

-- Example structure (replace UUIDs with actual ones):
/*
INSERT INTO candidates (id, email, first_name, last_name, username, slug, is_active, email_verified)
VALUES 
  ('AUTH_UUID_1', 'maria.garcia@testbpo.com', 'Maria', 'Garcia', 'mariagarcia', 'maria-garcia', true, true),
  ('AUTH_UUID_2', 'john.smith@testbpo.com', 'John', 'Smith', 'johnsmith', 'john-smith', true, true),
  ('AUTH_UUID_3', 'sarah.chen@testbpo.com', 'Sarah', 'Chen', 'sarahchen', 'sarah-chen', true, true),
  ('AUTH_UUID_4', 'miguel.rodriguez@testbpo.com', 'Miguel', 'Rodriguez', 'miguelrodriguez', 'miguel-rodriguez', true, true),
  ('AUTH_UUID_5', 'jennifer.tuason@testbpo.com', 'Jennifer', 'Tuason', 'jennifertuason', 'jennifer-tuason', true, true),
  ('AUTH_UUID_6', 'david.williams@testbpo.com', 'David', 'Williams', 'davidwilliams', 'david-williams', true, true),
  ('AUTH_UUID_7', 'angela.santos@testbpo.com', 'Angela', 'Santos', 'angelasantos', 'angela-santos', true, true),
  ('AUTH_UUID_8', 'robert.johnson@testbpo.com', 'Robert', 'Johnson', 'robertjohnson', 'robert-johnson', true, true),
  ('AUTH_UUID_9', 'michelle.reyes@testbpo.com', 'Michelle', 'Reyes', 'michellereyes', 'michelle-reyes', true, true),
  ('AUTH_UUID_10', 'carlos.fernandez@testbpo.com', 'Carlos', 'Fernandez', 'carlosfernandez', 'carlos-fernandez', true, true);
*/

-- ============================================================================
-- INSTRUCTIONS FOR USE:
-- ============================================================================
-- 
-- 1. Create Auth Accounts First:
--    - Use Supabase Dashboard or Auth API to create accounts
--    - Email: [see candidate_data.json]
--    - Password: TestBPO2024!
--    - Note the UUID for each created user
--
-- 2. Update This Script:
--    - Replace AUTH_UUID_1, AUTH_UUID_2, etc. with actual UUIDs
--    - Run the candidate inserts
--
-- 3. Run Profile Data:
--    - Execute the candidate_profiles inserts below
--    - Execute work experience, education, and skills inserts
--
-- 4. Upload Files via Supabase Storage:
--    - Upload images to 'candidate-avatars' and 'candidate-covers' buckets
--    - Upload resume PDFs to 'candidate-resumes' bucket
--
-- ============================================================================

-- Template for candidate_profiles (replace candidate_id with actual UUIDs)
-- Use data from candidate_data.json for values

/*
-- Maria Garcia Profile
INSERT INTO candidate_profiles (
  candidate_id,
  bio,
  position,
  birthday,
  gender,
  phone,
  location,
  location_city,
  location_province,
  location_country,
  location_region,
  work_status,
  expected_salary_min,
  expected_salary_max,
  currency,
  preferred_shift,
  preferred_work_setup,
  headline,
  linkedin,
  profile_completed
) VALUES (
  'AUTH_UUID_1', -- Maria Garcia
  'Highly motivated customer service professional with 5+ years of experience in delivering exceptional support to diverse clientele...',
  'Customer Service Representative',
  '1995-03-15',
  'female',
  '+639171234567',
  'Quezon City, Metro Manila',
  'Quezon City',
  'Metro Manila',
  'Philippines',
  'NCR',
  'actively_looking',
  25000,
  35000,
  'PHP',
  'graveyard',
  'remote',
  'Dedicated Customer Service Professional | 5+ Years Experience | High CSAT Scores',
  'https://linkedin.com/in/mariagarcia-bpo',
  true
);
*/

-- ============================================================================
-- Alternative: Use the automated upload script instead
-- ============================================================================
-- For easier setup, use the Node.js automation script:
-- 
-- npm install
-- node test_candidates/upload_candidates.js
--
-- This will automatically:
-- - Create auth accounts
-- - Insert all profile data
-- - Upload all images and resumes
-- ============================================================================

-- ============================================================================
-- SEMI-AUTOMATED APPROACH
-- ============================================================================
-- Use this function to help generate insert statements from JSON data

CREATE OR REPLACE FUNCTION import_test_candidate(
  p_auth_uuid UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_profile_data JSONB
) RETURNS void AS $$
BEGIN
  -- Insert candidate profile
  INSERT INTO candidate_profiles (
    candidate_id,
    bio,
    position,
    birthday,
    gender,
    phone,
    location,
    location_city,
    location_province,
    location_country,
    location_region,
    work_status,
    expected_salary_min,
    expected_salary_max,
    currency,
    preferred_shift,
    preferred_work_setup,
    headline,
    linkedin,
    profile_completed
  ) VALUES (
    p_auth_uuid,
    p_profile_data->>'bio',
    p_profile_data->>'position',
    (p_profile_data->>'birthday')::DATE,
    (p_profile_data->>'gender')::gender_type,
    p_profile_data->>'phone',
    p_profile_data->>'location',
    p_profile_data->>'location_city',
    p_profile_data->>'location_province',
    p_profile_data->>'location_country',
    p_profile_data->>'location_region',
    (p_profile_data->>'work_status')::work_status_type,
    (p_profile_data->>'expected_salary_min')::NUMERIC,
    (p_profile_data->>'expected_salary_max')::NUMERIC,
    p_profile_data->>'currency',
    (p_profile_data->>'preferred_shift')::shift_preference_type,
    (p_profile_data->>'preferred_work_setup')::work_setup_type,
    p_profile_data->>'headline',
    p_profile_data->>'linkedin',
    true
  );
  
  RAISE NOTICE 'Imported profile for % %', p_first_name, p_last_name;
END;
$$ LANGUAGE plpgsql;

-- Usage example (after creating auth account):
-- SELECT import_test_candidate(
--   'actual-uuid-here',
--   'maria.garcia@testbpo.com',
--   'Maria',
--   'Garcia',
--   '{"bio": "...", "position": "Customer Service Representative", ...}'::jsonb
-- );

-- ============================================================================
-- RECOMMENDED: Use the automation scripts provided
-- ============================================================================
-- See: upload_candidates.js for automated import
-- See: README.md for complete instructions
-- ============================================================================
