# Quick Diagnostic - Run This in Browser Console

## Step 1: Get Your Pipeline ID

When you're on the insights page and see your article, right-click "Resume" button and copy the link. It should look like:
```
/admin/insights/create?resume=abc-123-def-456
```

The `abc-123-def-456` part is your pipeline ID.

## Step 2: Run This in Console

Open browser console (F12) and run:

```javascript
// Replace with your actual pipeline ID
const pipelineId = 'YOUR_PIPELINE_ID_HERE';

// Fetch the pipeline data
fetch(`/api/admin/content-pipeline/get?id=${pipelineId}`)
  .then(res => res.json())
  .then(result => {
    console.log('=== PIPELINE DATA ===');
    console.log('Success:', result.success);
    console.log('Pipeline:', result.pipeline);
    console.log('\n=== KEY FIELDS ===');
    console.log('Current Stage:', result.pipeline?.current_stage);
    console.log('Insight ID:', result.pipeline?.insight_id);
    console.log('Brief:', result.pipeline?.brief_transcript?.slice(0, 50) + '...');
    console.log('Selected Idea:', result.pipeline?.selected_idea);
    console.log('Plan:', result.pipeline?.article_plan ? 'EXISTS' : 'MISSING');
    console.log('Stage Data:', result.pipeline?.stage_data);
    console.log('\n=== DIAGNOSIS ===');
    
    if (!result.pipeline?.current_stage || result.pipeline.current_stage === 1) {
      console.error('❌ PROBLEM: current_stage is 1 or missing');
      console.log('This means the pipeline isn\'t saving the stage number');
      console.log('Check if savePipelineProgress() is being called');
    } else {
      console.log('✅ current_stage is set:', result.pipeline.current_stage);
    }
    
    if (!result.pipeline?.stage_data || Object.keys(result.pipeline.stage_data).length === 0) {
      console.error('❌ PROBLEM: stage_data is empty');
      console.log('This means the update API isn\'t saving stage data');
      console.log('Need to implement the stage_data fix');
    } else {
      console.log('✅ stage_data exists with keys:', Object.keys(result.pipeline.stage_data));
    }
    
    if (!result.pipeline?.insight_id) {
      console.error('❌ PROBLEM: No insight_id');
      console.log('Article data can\'t be loaded');
    } else {
      console.log('✅ insight_id exists');
      
      // Also fetch the article data
      return fetch(`/api/admin/insights/pipeline/get-draft?id=${result.pipeline.insight_id}`)
        .then(res => res.json())
        .then(articleResult => {
          console.log('\n=== ARTICLE DATA ===');
          console.log('Success:', articleResult.success);
          console.log('Title:', articleResult.draft?.title);
          console.log('Has Content:', !!articleResult.draft?.content);
          console.log('Content Length:', articleResult.draft?.content?.length || 0);
          console.log('Pipeline Stage:', articleResult.draft?.pipeline_stage);
        });
    }
  })
  .catch(err => {
    console.error('❌ ERROR:', err);
  });
```

## Step 3: Interpret Results

### If you see:
```
❌ PROBLEM: current_stage is 1 or missing
```
**Fix:** The `savePipelineProgress()` function isn't being called or isn't working.
**Check:** Look at the stage components - are they calling `savePipelineProgress()`?

### If you see:
```
❌ PROBLEM: stage_data is empty
```
**Fix:** The update API needs to save stage_data.
**Action:** Implement the fix in `content-pipeline/update/route.ts`

### If you see:
```
❌ PROBLEM: No insight_id
```
**Fix:** The article record wasn't created or linked.
**Check:** The `selectIdeaAndCreateDraft` function

### If all checks pass but still doesn't resume:
**Fix:** The `resumePipeline` function isn't loading the data correctly.
**Action:** Replace with the enhanced version in `RESUME_FUNCTION_WITH_LOGGING.md`

## Step 4: Share Results

Copy the console output and share it so we can see exactly what's in the database.
