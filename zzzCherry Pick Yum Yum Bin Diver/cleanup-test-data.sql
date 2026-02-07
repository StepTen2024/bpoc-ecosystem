-- DANGER: Review carefully before running
-- Delete test users and all their related data

BEGIN;

-- 1. Identify Test Users in auth.users
CREATE TEMP TABLE test_user_ids AS
SELECT id FROM auth.users 
WHERE email ILIKE '%test%' 
   OR email ILIKE '%demo%' 
   OR email ILIKE '%example%'
   OR email ILIKE '%testing%'
   OR email ILIKE '%@testing.local%'
   OR email ILIKE '%@test.com%'
   OR raw_user_meta_data->>'is_test' = 'true'
   OR raw_user_meta_data->>'is_test_user' = 'true';

-- 2. Delete from Public Tables (referencing auth.users.id or email)

-- Candidates & Profiles
DELETE FROM public.candidate_profiles WHERE candidate_id IN (SELECT id FROM test_user_ids);
DELETE FROM public.candidates WHERE id IN (SELECT id FROM test_user_ids);

-- Recruiters & Agencies (Commented out as table names are uncertain/unverified)
-- DELETE FROM public.recruiters WHERE id IN (SELECT id FROM test_user_ids);
-- DELETE FROM public.agencies ...

-- 3. Delete from auth.users
DELETE FROM auth.users WHERE id IN (SELECT id FROM test_user_ids);

DROP TABLE test_user_ids;

COMMIT;
