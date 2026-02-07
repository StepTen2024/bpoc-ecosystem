# Quick Database Test

## Run this SQL in Supabase SQL Editor to test:

```sql
-- Test 1: Check if pipeline exists
SELECT id, current_stage, status, insight_id
FROM content_pipelines
WHERE id = 'ae4617eb-440f-4e5a-befa-34d1e13f1cc0';

-- Test 2: Check recent pipelines
SELECT id, current_stage, status, created_at
FROM content_pipelines
ORDER BY created_at DESC
LIMIT 5;

-- Test 3: Check if stage_data column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content_pipelines' 
AND column_name = 'stage_data';
```

## If stage_data doesn't exist, add it:

```sql
ALTER TABLE content_pipelines 
ADD COLUMN IF NOT EXISTS stage_data JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_content_pipelines_stage_data 
ON content_pipelines USING gin(stage_data);
```

## Check RLS (Row Level Security) Policies:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'content_pipelines';

-- If RLS is enabled, check policies
SELECT * FROM pg_policies 
WHERE tablename = 'content_pipelines';
```

## If RLS is blocking access, add this policy:

```sql
-- Allow service role to read all pipelines
CREATE POLICY IF NOT EXISTS "Service role can read pipelines"
ON content_pipelines
FOR SELECT
TO service_role
USING (true);

-- Allow service role to update pipelines
CREATE POLICY IF NOT EXISTS "Service role can update pipelines"
ON content_pipelines
FOR UPDATE
TO service_role
USING (true);
```

## Test the API directly:

Open browser console and run:

```javascript
fetch('/api/admin/content-pipeline/get?id=ae4617eb-440f-4e5a-befa-34d1e13f1cc0')
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', data);
    if (!data.success) {
      console.error('Error:', data.error);
    }
  });
```

Then check the terminal running `npm run dev` for server-side logs.
