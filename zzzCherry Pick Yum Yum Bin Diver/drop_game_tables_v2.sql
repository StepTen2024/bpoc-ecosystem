-- ============================================
-- DROP EXISTING GAME TABLES
-- ============================================
-- Only dropping tables that actually exist
-- Date: 2026-01-22
-- ============================================

-- First, let's check what tables exist
\echo '🔍 Checking existing game tables...'
SELECT tablename FROM pg_tables 
WHERE (tablename LIKE '%typing%' 
   OR tablename LIKE '%disc%')
   AND schemaname = 'public';

\echo ''
\echo '🗑️  Starting cleanup...'

-- Drop views that might reference these tables
DROP VIEW IF EXISTS candidate_truth CASCADE;
DROP VIEW IF EXISTS candidate_with_assessments CASCADE;
DROP VIEW IF EXISTS candidate_game_stats CASCADE;

\echo '✅ Dropped views'

-- Drop indexes
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

\echo '✅ Dropped indexes'

-- Drop the actual tables (ORDER MATTERS - drop child tables first)
DROP TABLE IF EXISTS candidate_disc_responses CASCADE;
\echo '✅ Dropped candidate_disc_responses'

DROP TABLE IF EXISTS candidate_disc_assessments CASCADE;
\echo '✅ Dropped candidate_disc_assessments'

DROP TABLE IF EXISTS candidate_typing_assessments CASCADE;
\echo '✅ Dropped candidate_typing_assessments'

-- Drop archived schema if it exists
DROP SCHEMA IF EXISTS archived_games CASCADE;
\echo '✅ Dropped archived_games schema'

\echo ''
\echo '✅ CLEANUP COMPLETE!'
\echo ''
\echo '🔍 Verifying...'

-- Verify tables are dropped
SELECT COALESCE(
  (SELECT string_agg(tablename, ', ')
   FROM pg_tables 
   WHERE (tablename LIKE '%typing%' OR tablename LIKE '%disc%')
   AND schemaname = 'public'),
  'No game tables found - SUCCESS! ✅'
) as remaining_tables;
