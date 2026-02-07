-- ============================================
-- DROP ALL GAME TABLES AND DEPENDENCIES
-- ============================================
-- WARNING: This permanently deletes all game data
-- Date: 2026-01-22
-- Reason: Games removed from platform
-- ============================================

BEGIN;

-- Step 1: Drop all foreign key constraints referencing game tables
-- (Find and drop any FK constraints from candidates table or other tables)

DO $$ 
DECLARE
    constraint_record RECORD;
BEGIN
    -- Find and drop all foreign keys pointing to game tables
    FOR constraint_record IN 
        SELECT 
            conname AS constraint_name,
            conrelid::regclass AS table_name
        FROM pg_constraint
        WHERE confrelid IN (
            'candidate_typing_assessments'::regclass,
            'candidate_disc_assessments'::regclass,
            'candidate_disc_responses'::regclass,
            'candidate_cultural_assessments'::regclass,
            'candidate_ultimate_assessments'::regclass
        )
    LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %s CASCADE', 
                      constraint_record.table_name, 
                      constraint_record.constraint_name);
        RAISE NOTICE 'Dropped constraint: % from %', 
                     constraint_record.constraint_name, 
                     constraint_record.table_name;
    END LOOP;
END $$;

-- Step 2: Drop all indexes on game tables
DROP INDEX IF EXISTS idx_candidate_typing_assessments_candidate_id CASCADE;
DROP INDEX IF EXISTS idx_candidate_typing_assessments_candidate_finished CASCADE;
DROP INDEX IF EXISTS idx_candidate_typing_assessments_candidate_completed CASCADE;
DROP INDEX IF EXISTS idx_candidate_typing_assessments_candidate_created CASCADE;
DROP INDEX IF EXISTS idx_candidate_typing_assessments_session_status CASCADE;

DROP INDEX IF EXISTS idx_candidate_disc_assessments_candidate_id CASCADE;
DROP INDEX IF EXISTS idx_candidate_disc_assessments_candidate_finished CASCADE;
DROP INDEX IF EXISTS idx_candidate_disc_assessments_candidate_completed CASCADE;
DROP INDEX IF EXISTS idx_candidate_disc_assessments_candidate_created CASCADE;
DROP INDEX IF EXISTS idx_candidate_disc_assessments_session_id CASCADE;

DROP INDEX IF EXISTS idx_candidate_disc_responses_candidate_id CASCADE;
DROP INDEX IF EXISTS idx_candidate_disc_responses_session_id CASCADE;

DROP INDEX IF EXISTS idx_candidate_cultural_assessments_candidate_id CASCADE;
DROP INDEX IF EXISTS idx_candidate_ultimate_assessments_candidate_id CASCADE;

-- Step 3: Drop all views that reference game tables
DROP VIEW IF EXISTS candidate_truth CASCADE;
DROP VIEW IF EXISTS candidate_with_assessments CASCADE;
DROP VIEW IF EXISTS candidate_game_stats CASCADE;

-- Step 4: Drop all RLS policies on game tables
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT 
            tablename,
            policyname
        FROM pg_policies
        WHERE tablename IN (
            'candidate_typing_assessments',
            'candidate_disc_assessments',
            'candidate_disc_responses',
            'candidate_cultural_assessments',
            'candidate_ultimate_assessments'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %s ON %s CASCADE', 
                      policy_record.policyname, 
                      policy_record.tablename);
        RAISE NOTICE 'Dropped policy: % on %', 
                     policy_record.policyname, 
                     policy_record.tablename;
    END LOOP;
END $$;

-- Step 5: Drop the actual tables (CASCADE will drop any remaining dependencies)
DROP TABLE IF EXISTS candidate_typing_assessments CASCADE;
DROP TABLE IF EXISTS candidate_disc_assessments CASCADE;
DROP TABLE IF EXISTS candidate_disc_responses CASCADE;
DROP TABLE IF EXISTS candidate_cultural_assessments CASCADE;
DROP TABLE IF EXISTS candidate_ultimate_assessments CASCADE;

-- Step 6: Drop any archived schema if it exists
DROP SCHEMA IF EXISTS archived_games CASCADE;

-- Step 7: Clean up any functions that reference game tables
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.prosrc LIKE '%candidate_typing_assessments%'
           OR p.prosrc LIKE '%candidate_disc_assessments%'
           OR p.prosrc LIKE '%candidate_disc_responses%'
           OR p.prosrc LIKE '%candidate_cultural_assessments%'
           OR p.prosrc LIKE '%candidate_ultimate_assessments%'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %s.%s(%s) CASCADE', 
                      func_record.schema_name,
                      func_record.function_name,
                      func_record.args);
        RAISE NOTICE 'Dropped function: %s.%s', 
                     func_record.schema_name, 
                     func_record.function_name;
    END LOOP;
END $$;

-- Step 8: Drop any triggers referencing game tables
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT 
            event_object_table AS table_name,
            trigger_name
        FROM information_schema.triggers
        WHERE event_object_table IN (
            'candidate_typing_assessments',
            'candidate_disc_assessments',
            'candidate_disc_responses',
            'candidate_cultural_assessments',
            'candidate_ultimate_assessments'
        )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %s ON %s CASCADE', 
                      trigger_record.trigger_name, 
                      trigger_record.table_name);
        RAISE NOTICE 'Dropped trigger: % on %', 
                     trigger_record.trigger_name, 
                     trigger_record.table_name;
    END LOOP;
END $$;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables are dropped
SELECT tablename 
FROM pg_tables 
WHERE (tablename LIKE '%typing%' 
   OR tablename LIKE '%disc%' 
   OR tablename LIKE '%cultural%' 
   OR tablename LIKE '%ultimate%')
   AND schemaname = 'public';

-- Verify no orphaned foreign keys
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE confrelid::text LIKE '%typing%'
   OR confrelid::text LIKE '%disc%'
   OR confrelid::text LIKE '%cultural%'
   OR confrelid::text LIKE '%ultimate%';
