# 🗑️ DATABASE CLEANUP - Drop Game Tables

**FOR: IDE with MCP Supabase Access**  
**TASK: Drop all game-related database tables and their dependencies**  
**CRITICAL: This is destructive - data will be permanently deleted**

---

## 🎯 EXECUTE THIS SQL

Run the following SQL script in your Supabase SQL Editor or via MCP:

```sql
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
WHERE tablename LIKE '%typing%' 
   OR tablename LIKE '%disc%' 
   OR tablename LIKE '%cultural%' 
   OR tablename LIKE '%ultimate%'
   AND schemaname = 'public';

-- Should return empty result

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

-- Should return empty result

-- ============================================
-- CLEANUP COMPLETE
-- ============================================
```

---

## 🎯 WHAT THIS SCRIPT DOES

### Step-by-Step Breakdown:

1. **Drops Foreign Keys** - Removes any FK constraints from `candidates` or other tables pointing to game tables
2. **Drops Indexes** - Removes all indexes on game tables
3. **Drops Views** - Removes any views that query game tables (like `candidate_truth`)
4. **Drops RLS Policies** - Removes Row Level Security policies
5. **Drops Tables** - Permanently deletes the actual game tables
6. **Drops Archived Schema** - Removes `archived_games` schema if it exists
7. **Drops Functions** - Removes any database functions that reference game tables
8. **Drops Triggers** - Removes any triggers on game tables
9. **Verification** - Confirms everything is deleted

---

## 🗑️ TABLES BEING DROPPED

```
candidate_typing_assessments
candidate_disc_assessments
candidate_disc_responses
candidate_cultural_assessments
candidate_ultimate_assessments
```

---

## ⚠️ SAFETY CHECKS

Before running, verify:

1. **Backup Exists** (if you want to keep data)
   ```bash
   pg_dump $DATABASE_URL > backups/game_tables_$(date +%Y%m%d).sql
   ```

2. **No Active References**
   ```sql
   -- Check for any remaining code references
   SELECT * FROM candidate_typing_assessments LIMIT 1;
   SELECT * FROM candidate_disc_assessments LIMIT 1;
   ```

3. **Test Environment First**
   - Run on staging/dev database first
   - Verify no errors
   - Then run on production

---

## 🚀 EXECUTION INSTRUCTIONS

### Option 1: Via MCP (Recommended)
```
Execute the SQL script in DROP_GAME_TABLES_PROMPT.md against the Supabase database
```

### Option 2: Supabase SQL Editor
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire SQL script above
3. Click "Run"
4. Verify with the verification queries

### Option 3: Command Line
```bash
psql $DATABASE_URL -f drop_game_tables.sql
```

---

## ✅ EXPECTED RESULTS

After running:

```sql
-- This should return 0 rows
SELECT tablename FROM pg_tables 
WHERE tablename LIKE '%typing%' OR tablename LIKE '%disc%';

-- Success message
COMMIT
```

---

## 🔄 ROLLBACK (If Needed)

If you backed up the data:
```bash
psql $DATABASE_URL < backups/game_tables_YYYYMMDD.sql
```

---

## 📝 POST-CLEANUP TASKS

After dropping tables:

1. ✅ Update `candidate_truth` view (if it exists)
2. ✅ Remove game columns from any remaining queries
3. ✅ Deploy updated codebase (already done)
4. ✅ Monitor for errors in logs

---

## 💬 CONFIRMATION MESSAGE

After successful execution, you should see:
```
NOTICE: Dropped constraint: [name] from [table]
NOTICE: Dropped policy: [name] on [table]
NOTICE: Dropped function: [name]
NOTICE: Dropped trigger: [name] on [table]
COMMIT
```

---

**Status**: Ready to execute  
**Risk Level**: Medium (destructive but safe - no dependencies remain)  
**Estimated Time**: ~30 seconds  

**Run this and games are GONE from the database! 🔥**
