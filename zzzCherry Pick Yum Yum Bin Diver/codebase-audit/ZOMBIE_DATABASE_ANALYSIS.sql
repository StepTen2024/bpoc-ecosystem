-- ZOMBIE DATABASE ANALYSIS
-- Run this in Supabase SQL Editor to find tables that might be safe to delete.

-- 1. List all tables and their size
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

-- 2. Suspected Zombies (based on Codebase Audit)
-- These tables were found in dead code references but NOT in active code.
-- Check if they are empty.

SELECT count(*) as interview_requests_count FROM interview_requests; -- From shoreagents-db.ts
SELECT count(*) as job_acceptances_count FROM job_acceptances; -- From shoreagents-db.ts

-- 3. Check for Tables not in 'database.types.ts' (Potentially untyped/legacy)
-- If a table exists in DB but not in types, it might be forgotten.
-- (Visual check required against the result of Query 1)
