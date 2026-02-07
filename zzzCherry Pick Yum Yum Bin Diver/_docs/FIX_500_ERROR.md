# URGENT FIX: 500 Error on Resume

## Problem
```
GET http://localhost:3000/api/admin/content-pipeline/get?id=ae4617eb-440f-4e5a-befa-34d1e13f1cc0 500 (Internal Server Error)
```

The resume API is crashing with a 500 error.

## Most Likely Causes

### 1. Supabase Credentials Missing/Invalid
Check `.env` file has:
```
NEXT_PUBLIC_SUPABASE_URL=https://ayrdnsiaylomcemfdisr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Table Doesn't Exist
The `content_pipelines` table might not exist in Supabase.

**Check in Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor"
4. Look for `content_pipelines` table

**If it doesn't exist, create it:**
```sql
CREATE TABLE IF NOT EXISTS content_pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'in_progress',
  current_stage INTEGER DEFAULT 1,
  brief_type TEXT,
  brief_transcript TEXT,
  selected_silo TEXT,
  selected_idea JSONB,
  generated_ideas JSONB,
  article_plan JSONB,
  plan_approved BOOLEAN DEFAULT FALSE,
  insight_id UUID,
  hero_type TEXT,
  hero_source TEXT,
  section_source TEXT,
  video_url TEXT,
  meta_data JSONB,
  stage_data JSONB DEFAULT '{}'::jsonb,
  ai_logs JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_content_pipelines_status ON content_pipelines(status);
CREATE INDEX IF NOT EXISTS idx_content_pipelines_insight_id ON content_pipelines(insight_id);
```

### 3. Permission Issue
The service role key might not have permission to read the table.

**Fix in Supabase:**
1. Go to "Authentication" → "Policies"
2. Find `content_pipelines` table
3. Make sure there's a policy allowing service role to SELECT

Or add this policy:
```sql
CREATE POLICY "Service role can read all pipelines"
ON content_pipelines
FOR SELECT
TO service_role
USING (true);
```

## Quick Test

Run this in browser console to see the actual error:

```javascript
fetch('/api/admin/content-pipeline/get?id=ae4617eb-440f-4e5a-befa-34d1e13f1cc0')
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));
```

Then check the terminal running `npm run dev` to see the server-side error logs.

## Temporary Workaround

If you need to test resume functionality while fixing this, you can temporarily bypass the pipeline fetch and load directly from `insights_posts`:

1. Go to insights page
2. Click on the article (not Resume)
3. Manually navigate to: `/admin/insights/create?insightId=YOUR_INSIGHT_ID`

This will at least load the article content, though not the full pipeline state.

## Next Steps

1. Check if `content_pipelines` table exists in Supabase
2. If not, create it with the SQL above
3. Check Supabase credentials in `.env`
4. Check terminal logs for the actual error message
5. Try the resume button again

The resume flow itself is correct - we just need to fix this API error!
