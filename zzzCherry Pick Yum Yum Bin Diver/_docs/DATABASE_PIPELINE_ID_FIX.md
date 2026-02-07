# Database Fix: Add pipeline_id Column

## Problem
The insights page was failing because we tried to query `pipeline_id` from `insights_posts` table, but that column doesn't exist.

## Solution Applied
✅ **Temporary Fix:** Removed `pipeline_id` from the query
✅ **Resume Button:** Now fetches pipeline_id dynamically from `content_pipelines` table using `insight_id`

## Optional: Add pipeline_id Column (Recommended)

If you want to optimize the Resume button (avoid extra query), add the column:

### SQL Migration

```sql
-- Add pipeline_id column to insights_posts
ALTER TABLE insights_posts 
ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES content_pipelines(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_insights_posts_pipeline_id 
ON insights_posts(pipeline_id);

-- Backfill existing data (optional)
UPDATE insights_posts ip
SET pipeline_id = cp.id
FROM content_pipelines cp
WHERE cp.insight_id = ip.id
AND ip.pipeline_id IS NULL;
```

### After Adding Column

Update `insights/page.tsx` line 32 to include `pipeline_id`:

```typescript
pipeline_stage, pipeline_id,
```

And update the Resume button (line 340-365) back to the simpler version:

```typescript
{!post.is_published && post.pipeline_stage && post.pipeline_stage !== 'draft' && post.pipeline_id && (
  <Link href={`/admin/insights/create?resume=${post.pipeline_id}`}>
    <Button size="sm" variant="ghost" className="h-8 px-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10" title="Resume in AI Pipeline">
      <Zap className="w-4 h-4 mr-1" /> Resume
    </Button>
  </Link>
)}
```

## Current Status

✅ **Working:** Resume button now works by querying `content_pipelines` table
✅ **No errors:** Insights page loads successfully
⚠️ **Performance:** Resume button makes an extra database query (negligible impact)

## Benefits of Adding Column

- ✅ Faster Resume button (no extra query)
- ✅ Direct relationship between insights and pipelines
- ✅ Easier to track which pipeline created which insight

**Status:** Optional optimization, current solution works fine!
