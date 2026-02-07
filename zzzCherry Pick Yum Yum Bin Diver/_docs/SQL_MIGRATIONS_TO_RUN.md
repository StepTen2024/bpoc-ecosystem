# SQL Migrations to Run

**Date:** January 5, 2026

---

## 🔍 Overview

Here are ALL the SQL migrations you need to run for the new features (Candidate, Recruiter, Admin):

---

## 1️⃣ Critical Tables (Counter Offers & Onboarding)

**Migration:** `20260105_add_critical_tables.sql` (Applied in Supabase)

**What it creates:**
- ✅ `counter_offers` table - For salary negotiations
- ✅ `onboarding_tasks` table - For post-hire onboarding
- ✅ Enum types: `OnboardingTaskType` and `OnboardingStatus`

**Required for:**
- Candidate counter offer functionality
- Recruiter counter offer management
- Recruiter onboarding task management
- Candidate onboarding task completion

**Status:** ✅ Already applied in Supabase

---

## 2️⃣ Admin Tables (Audit Log & Notes)

**Migration:** `20260105_add_admin_audit_and_notes.sql` (Applied in Supabase)

**What it creates:**
- ✅ `admin_audit_log` table - Track all admin actions (compliance)
- ✅ `admin_notes` table - Internal admin notes on entities
- ✅ `admin_users` table - Who has admin access
- ✅ Adds suspension fields to `agencies` table
- ✅ Adds suspension fields to `candidates` table
- ✅ Adds `tier` field to `agencies` table
- ✅ RLS policies for all admin tables

**Required for:**
- Admin audit logging (compliance requirement)
- Admin notes on agencies, candidates, jobs, applications
- Suspend/reactivate users functionality
- Suspend/reactivate agencies functionality

**Status:** ✅ Already applied in Supabase

---

## ✅ After Running SQL Migrations

### Step 1: Verify Migration Applied
✅ Migrations already applied - no Prisma client generation needed.
Database abstraction layer at `/src/lib/db/` handles all queries.

### Step 2: Verify Tables Exist
```sql
-- Run in Supabase SQL Editor to verify

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'counter_offers',
  'onboarding_tasks',
  'admin_audit_log',
  'admin_notes',
  'admin_users'
);

-- Should return 5 rows
```

### Step 3: Check New Columns
```sql
-- Verify agencies got new fields
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'agencies'
AND column_name IN ('suspended', 'suspended_at', 'suspended_by', 'suspended_reason', 'tier');

-- Verify candidates got new fields
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'candidates'
AND column_name IN ('suspended', 'suspended_at', 'suspended_by', 'suspended_reason');
```

---

## 📋 Complete Migration Checklist

### Migration Status
- [x] Migration 1: Critical Tables ✅ APPLIED
- [x] Migration 2: Admin Tables ✅ APPLIED
- [x] All tables verified in Supabase ✅ COMPLETE
- [x] Database abstraction layer working ✅ COMPLETE

---

## 🔐 Create Your First Admin User

After running migrations, create an admin user:

```sql
-- Insert your user ID as an admin
INSERT INTO admin_users (user_id, role, created_at)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with your actual user ID from candidates table
  'super_admin',
  NOW()
);

-- Verify it was created
SELECT au.*, c.email, c.first_name, c.last_name
FROM admin_users au
JOIN candidates c ON c.id = au.user_id;
```

To get your user ID:
```sql
-- Find your user ID
SELECT id, email, first_name, last_name
FROM candidates
WHERE email = 'your.email@example.com';
```

---

## 🚨 Important Notes

1. **Run migrations in ORDER:**
   - First: `20260105_add_critical_tables.sql`
   - Second: `20260105_add_admin_audit_and_notes.sql`

2. **RLS Policies:**
   - All new tables have Row Level Security enabled
   - Admin APIs use service role key to bypass RLS
   - Frontend queries should use user's auth token

3. **Indexes:**
   - All tables have proper indexes for performance
   - No additional indexing needed

4. **Enum Types:**
   - `OnboardingTaskType`: document_upload, form_fill, e_sign, acknowledgment, training, information
   - `OnboardingStatus`: pending, submitted, approved, rejected, overdue

---

## 🐛 Troubleshooting

### Error: "relation already exists"
This means the table was already created. Safe to ignore, or drop and recreate:
```sql
DROP TABLE IF EXISTS counter_offers CASCADE;
DROP TABLE IF EXISTS onboarding_tasks CASCADE;
-- Then re-run the migration
```

### Error: "type already exists"
The enum types were already created. Safe to ignore.

### Error: "column already exists"
The column was already added. Safe to ignore, or check which columns exist:
```sql
\d agencies;  -- Shows all columns in agencies table
\d candidates;  -- Shows all columns in candidates table
```

### Database Issues
Verify schema using Supabase SQL Editor.
Use TypeScript types in `/src/lib/db/[module]/types.ts`.

---

## 📊 What Each Migration Enables

### Migration 1 Enables:
- ✅ Candidate submit counter offers
- ✅ Recruiter accept/reject/counter back
- ✅ Recruiter create onboarding tasks
- ✅ Candidate complete onboarding tasks
- ✅ Recruiter review task submissions
- ✅ Admin view all counter offers
- ✅ Admin view all onboarding tasks

### Migration 2 Enables:
- ✅ Admin suspend/reactivate agencies
- ✅ Admin suspend/reactivate candidates
- ✅ Admin add notes to any entity
- ✅ Audit log all admin actions
- ✅ Admin tier management (standard vs enterprise)
- ✅ Track who suspended whom and why
- ✅ Compliance and accountability

---

## ✅ Status After Migrations

Once both migrations are run:
- **Database:** 100% ready for all features ✅
- **Backend APIs:** All functional ✅
- **Frontend UI:** All integrated ✅
- **Admin Features:** All operational ✅

**Next step:** Deploy to production! 🚀

---

**Last Updated:** January 5, 2026
**Total Migrations:** 2 files
**Total Tables Added:** 5 tables
**Total Columns Added:** 9+ new columns
