# CRITICAL FIX: Resume Not Working

## Problem Found

Line 342 in `page.tsx` is using the wrong ID:

```typescript
<Link href={`/admin/insights/create?resume=${post.id}`}>
```

This passes the **insight ID** but the resume endpoint expects a **pipeline ID**.

## The Fix

We need to either:

### Option 1: Query Pipeline ID (Recommended)

Update the fetch query to include pipeline_id:

**Line 27-34** - Add `pipeline_id` to the select:

```typescript
const { data, error } = await supabase
  .from('insights_posts')
  .select(`
    id, slug, title, description, category, is_published, created_at, read_time,
    hero_url, video_url, hero_type,
    content_part1, content_part2, content_part3,
    content_image0, content_image1, content_image2,
    pipeline_stage, pipeline_id,
    seo:seo_metadata(meta_title, keywords)
  `)
  .order('created_at', { ascending: false });
```

**Line 342** - Use pipeline_id instead of post.id:

```typescript
{!post.is_published && post.pipeline_stage && post.pipeline_stage !== 'draft' && post.pipeline_id && (
  <Link href={`/admin/insights/create?resume=${post.pipeline_id}`}>
    <Button size="sm" variant="ghost" className="h-8 px-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10" title="Resume in AI Pipeline">
      <Zap className="w-4 h-4 mr-1" /> Resume
    </Button>
  </Link>
)}
```

### Option 2: Update API to Accept Insight ID

Modify `/api/admin/content-pipeline/get/route.ts` to:
1. Check if ID is a pipeline ID or insight ID
2. If insight ID, query pipeline by insight_id
3. Return the pipeline

## Database Check

Make sure `insights_posts` table has `pipeline_id` column:

```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'insights_posts' 
AND column_name = 'pipeline_id';

-- If missing, add it
ALTER TABLE insights_posts 
ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES content_pipelines(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_insights_posts_pipeline_id 
ON insights_posts(pipeline_id);
```

## Why This Happened

The resume button was passing `post.id` (insight ID: `d1541dd0-04f6-4856-b67f-4cf0fea007d5`) but the API expects a pipeline ID.

The error message confirms this:
```
📂 Fetching pipeline d1541dd0-04f6-4856-b67f-4cf0fea007d5
Database error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' }
```

It's looking for a pipeline with that ID, but that's an insight ID, so it finds 0 rows.

## Quick Test

After applying Option 1, the resume link will be:
```
/admin/insights/create?resume=57ea9a44-3a48-4d9a-bdad-cbba4e59a8cc
```
(the actual pipeline ID)

Instead of:
```
/admin/insights/create?resume=d1541dd0-04f6-4856-b67f-4cf0fea007d5
```
(the insight ID)
