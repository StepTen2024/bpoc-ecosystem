# 🗄️ DATABASE CLEANUP AUDIT - AI Content Pipeline

**Date**: January 23, 2026  
**Status**: Migration Applied ✅  
**Purpose**: Identify redundant tables and clean up schema

---

## 📊 MIGRATION STATUS

### **Applied Migration**: `20260123_create_seo_tables.sql`
✅ **Extensions Enabled**:
- `vector` (pgvector for embeddings)
- `pg_trgm` (trigram matching for text search)

✅ **Tables Created** (4 new tables):
1. `article_embeddings` - Vector embeddings (1536 dims) for semantic search
2. `article_links` - Internal linking (parent/child/sibling/cross-silo)
3. `targeted_keywords` - Keyword cannibalization prevention
4. `humanization_patterns` - AI detection pattern learning

✅ **Functions Created** (4 new functions):
1. `search_similar_articles()` - Semantic search using vector similarity
2. `detect_orphan_articles()` - Find articles with no incoming links
3. `check_keyword_cannibalization()` - Detect keyword conflicts
4. `get_article_link_stats()` - Link analytics

---

## 🆚 OLD vs NEW TABLE COMPARISON

### **EMBEDDINGS**

| Old Table | New Table | Status | Action |
|-----------|-----------|--------|--------|
| `insight_embeddings` | `article_embeddings` | ⚠️ DUPLICATE | **MIGRATE & DROP** |

**Old Schema**:
```sql
insight_embeddings (
  id uuid,
  insight_id uuid,
  embedding vector(1536),
  content text,
  created_at timestamptz
)
```

**New Schema**:
```sql
article_embeddings (
  id uuid,
  article_id uuid,              -- FK to insights_posts
  chunk_index int4,             -- NEW: supports chunking
  content text,
  embedding vector(1536),
  created_at timestamptz
)
```

**Key Differences**:
- ✅ New table supports **chunked embeddings** (500-word segments)
- ✅ Indexed with IVFFlat for fast similarity search
- ✅ Proper foreign key to `insights_posts`

**Used In**:
- ❌ OLD: `/api/admin/insights/publish/route.ts` (line 92)
- ❌ OLD: `/api/admin/insights/pipeline/scan-links/route.ts` (line 199)
- ✅ NEW: `/api/admin/insights/pipeline/seo-optimize/route.ts`
- ✅ NEW: `/api/admin/insights/pipeline/finalize/route.ts`

**Action Required**:
1. ✅ **Migrate data**: Run migration script (see below)
2. ✅ **Update routes**: Change `insight_embeddings` → `article_embeddings`
3. ✅ **Drop old table**: After migration complete

---

### **INTERNAL LINKS**

| Old Table | New Table | Status | Action |
|-----------|-----------|--------|--------|
| `internal_links` | `article_links` | ⚠️ DUPLICATE | **MIGRATE & DROP** |

**Old Schema**:
```sql
internal_links (
  id uuid,
  source_post_id uuid,
  target_post_id uuid,
  anchor_text text,
  created_at timestamptz
)
```

**New Schema**:
```sql
article_links (
  id uuid,
  from_article_id uuid,         -- FK to insights_posts
  to_article_id uuid,           -- FK to insights_posts
  anchor_text text,
  link_type text,               -- NEW: parent/child/sibling/cross-silo
  context text,                 -- NEW: surrounding paragraph
  created_at timestamptz,
  updated_at timestamptz        -- NEW: track changes
)
```

**Key Differences**:
- ✅ New table has **link_type categorization** (4-way linking)
- ✅ Stores **context** (where link appears in article)
- ✅ Tracks **updates** (when links change)
- ✅ Unique constraint on (from, to, anchor) combo

**Used In**:
- ❌ OLD: `/api/admin/insights/publish/route.ts` (line 80)
- ❌ OLD: `/api/admin/insights/links/route.ts` (lines 36, 39, 53, 56)
- ✅ NEW: `/api/admin/insights/pipeline/seo-optimize/route.ts`
- ✅ NEW: `/api/admin/insights/pipeline/finalize/route.ts`

**Action Required**:
1. ✅ **Migrate data**: Run migration script (see below)
2. ✅ **Update routes**: Change `internal_links` → `article_links`
3. ✅ **Add link_type**: Categorize existing links
4. ✅ **Drop old table**: After migration complete

---

### **LINK SUGGESTIONS**

| Table | Status | Action |
|-------|--------|--------|
| `link_suggestions` | ⚠️ REDUNDANT | **DROP** |

**Why Redundant**:
- Old system used `link_suggestions` as a staging table
- New system generates links directly in Stage 6 (SEO optimization)
- Links are now stored directly in `article_links`
- AI categorizes links in real-time (no manual approval needed)

**Used In**:
- ❌ `/api/admin/insights/publish/route.ts` (line 86)
- ❌ `/api/admin/insights/pipeline/scan-links/route.ts` (line 123)
- ❌ `/api/admin/insights/approve-link/route.ts` (line 59)

**Migration Path**:
1. ✅ Copy any approved suggestions to `article_links`
2. ✅ Update routes to use `article_links` directly
3. ✅ Drop `link_suggestions` table
4. ✅ Remove approval workflow (automated now)

---

### **ARTICLES NEEDING LINKS**

| Table | Status | Action |
|-------|--------|--------|
| `articles_needing_links` | 🗑️ **DROPPED** | ✅ **DONE** |

**Replacement**: `detect_orphan_articles()` function

**Why Dropped**:
- Was a VIEW or materialized table showing orphans
- New function `detect_orphan_articles()` does this dynamically
- No need to maintain stale data

**Used In**:
- ❌ `/api/admin/insights/link-health/route.ts` - **BROKEN**

**Action Required**:
1. ✅ Update `link-health/route.ts` to use `detect_orphan_articles()`
2. ✅ Test orphan detection
3. ✅ Verify no other dependencies

---

### **ALL LINKS OVERVIEW**

| Table | Status | Action |
|-------|--------|--------|
| `all_links_overview` | 🗑️ **DROPPED** | ✅ **DONE** |

**Replacement**: `get_article_link_stats()` function

**Why Dropped**:
- Was a VIEW showing aggregate link stats
- New function `get_article_link_stats()` provides better metrics
- Includes link type breakdown (parent/child/sibling/cross-silo)

**Used In**:
- ❌ None found (safe to drop)

**Action Required**:
- ✅ None - already dropped and not used

---

### **SEO METADATA**

| Table | Status | Action |
|-------|--------|--------|
| `seo_metadata` | ✅ **KEEP** | **Enhance** |

**Current Schema**:
```sql
seo_metadata (
  id uuid,
  post_id uuid,              -- FK to insights_posts
  schema_markup jsonb,
  focus_keyword text,
  secondary_keywords text[],
  created_at timestamptz
)
```

**Used In**:
- ✅ `/api/admin/insights/publish/route.ts` (line 74)
- ✅ `/api/admin/insights/update/route.ts` (line 73)
- ✅ `/api/admin/insights/pipeline/publish/route.ts` (line 431)
- ✅ `/api/admin/insights/pipeline/finalize/route.ts` (line 364)
- ✅ `/api/admin/insights/ideas/route.ts` (line 137)

**Why Keep**:
- Stores schema.org markup (Article, FAQ, HowTo, Breadcrumb)
- Stores meta tags (title, description, OG tags)
- Different purpose than `targeted_keywords` (which tracks cannibalization)

**Recommended Enhancements**:
```sql
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS og_title text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS og_description text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS twitter_title text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS twitter_description text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS canonical_url text;
ALTER TABLE seo_metadata ADD COLUMN IF NOT EXISTS robots text;
```

**Action Required**:
- ✅ Keep table as-is
- ✅ Consider adding meta tag columns (optional)

---

### **TARGETED KEYWORDS**

| Table | Status | Action |
|-------|--------|--------|
| `targeted_keywords` | ✅ **NEW** | **Keep** |

**Purpose**: Prevent keyword cannibalization

**Schema**:
```sql
targeted_keywords (
  id uuid,
  keyword text UNIQUE,        -- Enforces uniqueness
  article_id uuid,            -- FK to insights_posts
  silo text,                  -- Content category
  search_volume int4,
  difficulty int4,
  is_primary bool,            -- Main target keyword
  created_at timestamptz
)
```

**Why Separate from `seo_metadata`**:
- `seo_metadata` = Output (what gets published)
- `targeted_keywords` = Tracking (prevent conflicts)
- UNIQUE constraint on keyword prevents duplicates across ALL articles

**Used In**:
- ✅ `/api/admin/insights/pipeline/seo-optimize/route.ts`
- ✅ `/api/admin/insights/pipeline/generate-meta/route.ts`
- ✅ `/api/admin/insights/pipeline/finalize/route.ts`

**Action Required**:
- ✅ Keep table
- ✅ Ensure routes use it for cannibalization checks

---

## 🗑️ CSV IMPORT SYSTEM

### **CSV Import Batches**

| Table | Status | Action |
|-------|--------|--------|
| `csv_import_batches` | ⚠️ **LEGACY** | **Conditional Drop** |

**Purpose**: Logs CSV imports for OLD outbound system

**Used In**:
- ❌ `/api/admin/outbound/contacts/import/route.ts`

**Related Tables**:
- `outbound_contacts` (OLD system)
- `carpet_bomb_leads` (NEW system)

**Decision Required**:

**Option 1: Keep OLD System**
- Keep `csv_import_batches`
- Keep `outbound_contacts`
- Keep `/api/admin/outbound/contacts/import` route

**Option 2: Drop OLD System** (Recommended)
- Drop `csv_import_batches`
- Drop `outbound_contacts`
- Drop `/api/admin/outbound/contacts/import` route
- Use Carpet Bomb System exclusively

**My Recommendation**: **Option 2 - Drop OLD System**

**Carpet Bomb System is superior**:
- Better tracking (campaigns, link clicks, UTM parameters)
- Better data model (leads + campaigns + clicks)
- Better UI (/admin/carpet-bomb)

**Action Required**:
1. ✅ Verify no active campaigns use `outbound_contacts`
2. ✅ Export any data you need from `csv_import_batches`
3. ✅ Drop tables:
   ```sql
   DROP TABLE csv_import_batches CASCADE;
   DROP TABLE outbound_contacts CASCADE;
   DROP TABLE email_campaigns CASCADE;
   DROP TABLE campaign_recipients CASCADE;
   DROP TABLE email_activity_log CASCADE;
   ```
4. ✅ Delete route: `/api/admin/outbound/contacts/import/route.ts`
5. ✅ Update any UI references

---

## 👤 VISITOR TRACKING

### **Anonymous Sessions**

| Table | Status | Action |
|-------|--------|--------|
| `anonymous_sessions` | ✅ **KEEP** | **No Change** |

**Purpose**: Track visitors before signup/login

**Schema**:
```sql
anonymous_sessions (
  id uuid,
  session_token text,
  created_at timestamptz,
  last_activity timestamptz,
  user_agent text,
  ip_address text,
  page_views int4
)
```

**Used In**:
- ✅ `/api/anon/*` routes

**Relationship to User Sessions**:
- Supabase Auth handles `auth.users` (logged-in users)
- `anonymous_sessions` handles unknown visitors
- Can link sessions after signup via `user_id` column

**Why Keep**:
- Tracks visitor behavior before conversion
- Provides attribution data
- No conflict with auth system

**Recommended Enhancement**:
```sql
ALTER TABLE anonymous_sessions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
```
This links anonymous sessions to users after they sign up.

**Action Required**:
- ✅ Keep table as-is
- ✅ Consider adding `user_id` FK (optional)

---

## 📊 FINAL CLEANUP CHECKLIST

### **MUST DROP** (Redundant/Broken):

- [ ] `articles_needing_links` - ✅ Already dropped
- [ ] `all_links_overview` - ✅ Already dropped

### **MUST MIGRATE THEN DROP**:

- [ ] `insight_embeddings` → `article_embeddings`
  - Migrate existing embeddings
  - Update 2 routes
  - Drop old table

- [ ] `internal_links` → `article_links`
  - Migrate existing links
  - Add link_type categorization
  - Update 2 routes
  - Drop old table

- [ ] `link_suggestions` → (delete entirely)
  - Copy approved links to `article_links`
  - Update 3 routes
  - Drop table
  - Remove approval workflow

### **CONDITIONALLY DROP** (Decision Required):

- [ ] **OLD Outbound System** (Recommend: DROP)
  - `csv_import_batches`
  - `outbound_contacts`
  - `email_campaigns`
  - `campaign_recipients`
  - `email_activity_log`
  - Route: `/api/admin/outbound/contacts/import/route.ts`

### **KEEP** (Active/Necessary):

- ✅ `article_embeddings` (NEW)
- ✅ `article_links` (NEW)
- ✅ `targeted_keywords` (NEW)
- ✅ `humanization_patterns` (NEW)
- ✅ `seo_metadata` (EXISTING - enhanced by new tables)
- ✅ `anonymous_sessions` (EXISTING - visitor tracking)
- ✅ `insights_posts` (EXISTING - main articles table)

### **VIEWS** (Keep):

- ✅ `silo_structure` - Aggregates silo metrics
- ✅ `silo_hierarchy` - Recursive breadcrumbs

---

## 🔧 MIGRATION SCRIPTS NEEDED

### **1. Migrate Embeddings**

**File**: `supabase/migrations/20260124_migrate_embeddings.sql`

```sql
-- Migrate insight_embeddings to article_embeddings
-- New table supports chunking, so we'll insert as chunk_index 0

INSERT INTO article_embeddings (article_id, chunk_index, content, embedding, created_at)
SELECT 
  insight_id as article_id,
  0 as chunk_index,  -- Old system didn't have chunking
  content,
  embedding,
  created_at
FROM insight_embeddings
WHERE insight_id IN (SELECT id FROM insights_posts)  -- Only migrate valid articles
ON CONFLICT (article_id, chunk_index) DO NOTHING;

-- Verify migration
SELECT 
  'insight_embeddings' as source_table,
  COUNT(*) as count
FROM insight_embeddings
UNION ALL
SELECT 
  'article_embeddings' as source_table,
  COUNT(*) as count
FROM article_embeddings;

-- If counts match (or new > old due to new embeddings), drop old table
-- DROP TABLE insight_embeddings CASCADE;
```

---

### **2. Migrate Internal Links**

**File**: `supabase/migrations/20260124_migrate_links.sql`

```sql
-- Migrate internal_links to article_links
-- We need to categorize link types based on content

INSERT INTO article_links (
  from_article_id, 
  to_article_id, 
  anchor_text, 
  link_type,
  context,
  created_at
)
SELECT 
  source_post_id as from_article_id,
  target_post_id as to_article_id,
  anchor_text,
  'sibling' as link_type,  -- Default to sibling (most common)
  NULL as context,         -- Old system didn't store context
  created_at
FROM internal_links
WHERE source_post_id IN (SELECT id FROM insights_posts)
  AND target_post_id IN (SELECT id FROM insights_posts)
ON CONFLICT (from_article_id, to_article_id, anchor_text) DO NOTHING;

-- Verify migration
SELECT 
  'internal_links' as source_table,
  COUNT(*) as count
FROM internal_links
UNION ALL
SELECT 
  'article_links' as source_table,
  COUNT(*) as count
FROM article_links;

-- If counts match, drop old table
-- DROP TABLE internal_links CASCADE;
```

---

### **3. Migrate Link Suggestions**

**File**: `supabase/migrations/20260124_migrate_link_suggestions.sql`

```sql
-- Copy approved link suggestions to article_links
-- Only copy if they were approved/accepted

INSERT INTO article_links (
  from_article_id,
  to_article_id,
  anchor_text,
  link_type,
  context,
  created_at
)
SELECT 
  source_post_id as from_article_id,
  target_post_id as to_article_id,
  suggested_anchor as anchor_text,
  'sibling' as link_type,  -- Default categorization
  reasoning as context,     -- Use reasoning as context
  created_at
FROM link_suggestions
WHERE status = 'approved'  -- Only approved suggestions
  AND source_post_id IN (SELECT id FROM insights_posts)
  AND target_post_id IN (SELECT id FROM insights_posts)
ON CONFLICT (from_article_id, to_article_id, anchor_text) DO NOTHING;

-- Verify migration
SELECT COUNT(*) as approved_suggestions_migrated
FROM link_suggestions
WHERE status = 'approved';

-- Drop the table (after verifying migration)
-- DROP TABLE link_suggestions CASCADE;
```

---

### **4. Drop OLD Outbound System** (Optional)

**File**: `supabase/migrations/20260124_drop_old_outbound.sql`

```sql
-- ONLY RUN THIS IF YOU'VE CONFIRMED YOU'RE USING CARPET BOMB EXCLUSIVELY

-- Export data first (if needed)
-- pg_dump --table=csv_import_batches --table=outbound_contacts bpoc > old_outbound_backup.sql

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS email_activity_log CASCADE;
DROP TABLE IF EXISTS campaign_recipients CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP TABLE IF EXISTS csv_import_batches CASCADE;
DROP TABLE IF EXISTS outbound_contacts CASCADE;

-- Verify tables dropped
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'email_activity_log',
    'campaign_recipients',
    'email_campaigns',
    'csv_import_batches',
    'outbound_contacts'
  );
-- Should return 0 rows
```

---

## 📝 ROUTES NEEDING UPDATES

### **Routes Using OLD Tables**:

1. **`/api/admin/insights/publish/route.ts`** (line 74-92)
   - Change: `seo_metadata` ✅ (keep)
   - Change: `internal_links` → `article_links`
   - Change: `link_suggestions` → (remove)
   - Change: `insight_embeddings` → `article_embeddings`

2. **`/api/admin/insights/pipeline/scan-links/route.ts`** (line 123, 199)
   - Change: `link_suggestions` → `article_links`
   - Change: `insight_embeddings` → `article_embeddings`

3. **`/api/admin/insights/links/route.ts`** (lines 36-56)
   - Change: `internal_links` → `article_links`
   - Add: `link_type` parameter

4. **`/api/admin/insights/approve-link/route.ts`** (line 59)
   - Change: Remove this route (automated linking now)
   - OR: Update to use `article_links`

5. **`/api/admin/insights/link-health/route.ts`** (BROKEN)
   - Change: Use `detect_orphan_articles()` function
   - Remove: `articles_needing_links` reference

6. **`/api/admin/outbound/contacts/import/route.ts`** (OPTIONAL)
   - Decision: Keep OR delete entire route

---

## 🎯 QUICK START: RUN THESE MIGRATIONS

### **Step 1: Create Migration Files**

I'll create 3 migration SQL files for you:

1. `20260124_migrate_embeddings.sql` - Migrate embeddings
2. `20260124_migrate_links.sql` - Migrate internal links
3. `20260124_migrate_link_suggestions.sql` - Migrate link suggestions

### **Step 2: Apply Migrations**

```bash
# In Supabase SQL Editor, run in order:
1. 20260124_migrate_embeddings.sql
2. 20260124_migrate_links.sql
3. 20260124_migrate_link_suggestions.sql
```

### **Step 3: Update Routes**

Update these 6 routes (I can do this for you):
1. `publish/route.ts`
2. `pipeline/scan-links/route.ts`
3. `links/route.ts`
4. `approve-link/route.ts`
5. `link-health/route.ts`
6. `outbound/contacts/import/route.ts` (decision: keep or delete?)

### **Step 4: Drop OLD Tables**

After verifying migrations work:
```sql
DROP TABLE insight_embeddings CASCADE;
DROP TABLE internal_links CASCADE;
DROP TABLE link_suggestions CASCADE;
```

---

## 🔍 KEYWORD EMBEDDINGS STRATEGY

### **Your Question**: Should we have keyword embeddings?

**Answer**: Not as a separate table. Here's why:

**Current Strategy** (Correct):
- `article_embeddings` = Vector embeddings of **content** (chunked)
- `targeted_keywords` = **Tracking** of keywords (cannibalization prevention)

**Why Not Keyword Embeddings**:
1. Keywords are short (1-5 words) - not enough content to embed meaningfully
2. Keyword relationships are captured by:
   - **Cluster keywords** (stored in plan metadata)
   - **Semantic keywords** (stored in plan metadata)
   - **Article embeddings** (keywords appear in content, so they're already embedded)

**Keyword Clustering** (Already Built):
- Stage 3 (Plan Generation) creates keyword clusters
- Stored in `insights_posts.generation_metadata.keywords`
- Structure:
  ```json
  {
    "main": ["primary keyword", "secondary 1", "secondary 2"],
    "cluster": ["related 1", "related 2", "related 3"],
    "semantic": ["synonym 1", "LSI term 1", "variation 1"]
  }
  ```

**If You Want Keyword Search**:
- Use `targeted_keywords` table with full-text search:
  ```sql
  SELECT * FROM targeted_keywords 
  WHERE keyword ILIKE '%bpo%' 
  OR keyword % 'bpo';  -- trigram similarity
  ```

**Recommendation**: No keyword embeddings table needed. Current strategy is optimal.

---

## ✅ SUMMARY

### **New Tables (Keep)**:
- ✅ `article_embeddings` (replaces `insight_embeddings`)
- ✅ `article_links` (replaces `internal_links`)
- ✅ `targeted_keywords` (new feature)
- ✅ `humanization_patterns` (new feature)

### **OLD Tables (Drop After Migration)**:
- 🗑️ `insight_embeddings` → migrate to `article_embeddings`
- 🗑️ `internal_links` → migrate to `article_links`
- 🗑️ `link_suggestions` → migrate approved to `article_links`
- 🗑️ `articles_needing_links` → already dropped
- 🗑️ `all_links_overview` → already dropped

### **OLD System (Decision: Keep or Drop)**:
- ⚠️ `csv_import_batches`
- ⚠️ `outbound_contacts`
- ⚠️ `email_campaigns`
- ⚠️ `campaign_recipients`
- ⚠️ `email_activity_log`

**Recommendation**: Drop OLD outbound system, use Carpet Bomb exclusively.

### **Existing Tables (Keep)**:
- ✅ `seo_metadata` (different purpose than `targeted_keywords`)
- ✅ `anonymous_sessions` (visitor tracking)
- ✅ `insights_posts` (main articles table)

---

## 🚀 NEXT ACTIONS

**What I need from you**:

1. **Outbound System Decision**:
   - [ ] Keep OLD system (`outbound_contacts`, etc.)
   - [ ] Drop OLD system (use Carpet Bomb exclusively)

2. **Route Updates**:
   - [ ] I'll update all 6 routes that use OLD tables
   - [ ] Do you want me to do this now?

3. **Migration Execution**:
   - [ ] I'll create the 3 migration SQL files
   - [ ] You run them in Supabase SQL Editor
   - [ ] I'll verify migrations worked

**Say "GO" and I'll create the migration files and update the routes.** 🚀
