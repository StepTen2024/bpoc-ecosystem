# COMPLETE FIX: Resume Pipeline Functionality

## Problem
Clicking "Resume" on an article starts from Stage 1 instead of continuing from the saved stage.

## Root Cause
The `content_pipeline/update` API only saves specific fields per stage, but doesn't save a comprehensive `stage_data` object that contains ALL the data needed to resume.

## Complete Solution (2 Files to Update)

---

## File 1: Update API to Save Stage Data

**File:** `src/app/api/admin/content-pipeline/update/route.ts`

**Add this code AFTER line 86 (after the switch statement):**

```typescript
    // IMPORTANT: Save all stage data for resume functionality
    // This allows the pipeline to resume from any stage with all previous data
    const { data: currentPipeline } = await supabase
      .from('content_pipelines')
      .select('stage_data')
      .eq('id', pipelineId)
      .single();

    const existingStageData = currentPipeline?.stage_data || {};
    const newStageData = { ...existingStageData, ...data };
    updateData.stage_data = newStageData;

    console.log(`📦 Saving stage data for stage ${stage}:`, Object.keys(newStageData));
```

**This saves all the data passed from the frontend into a `stage_data` JSON field.**

---

## File 2: Enhanced Resume Function

**File:** `src/app/(admin)/admin/insights/create/page.tsx`

**Replace the `resumePipeline` function (lines 114-197) with:**

```typescript
const resumePipeline = async (pipeline: any) => {
  console.log('🔄 Resuming pipeline:', pipeline.id);
  console.log('📊 Current stage:', pipeline.current_stage);
  
  const targetStage = pipeline.current_stage || 1;

  // Load article data from insights_posts
  let articleData: any = null;
  if (pipeline.insight_id) {
    try {
      const res = await fetch(`/api/admin/insights/pipeline/get-draft?id=${pipeline.insight_id}`);
      const result = await res.json();
      if (result.success && result.draft) {
        articleData = result.draft;
        console.log('📄 Article data loaded');
      }
    } catch (err) {
      console.error('Failed to load article data:', err);
    }
  }

  // Extract stage data (this is the key fix!)
  const stageData = pipeline.stage_data || {};
  console.log('📦 Stage data keys:', Object.keys(stageData));

  // Build comprehensive state from all sources
  const resumeState: any = {
    pipelineId: pipeline.id,
    insightId: pipeline.insight_id,
    transcript: pipeline.brief_transcript || stageData.briefTranscript || '',
    briefConfirmed: !!pipeline.brief_transcript,
    selectedSilo: pipeline.selected_silo || stageData.selectedSilo || articleData?.silo_topic || '',
    selectedIdea: pipeline.selected_idea || stageData.selectedIdea || (articleData ? { title: articleData.title } : null),
    researchData: stageData.researchData || articleData?.serper_research || {},
    plan: pipeline.article_plan || stageData.plan || articleData?.generation_metadata?.plan,
    planApproved: pipeline.plan_approved || stageData.planApproved || false,
    article: stageData.article || articleData?.content || '',
    wordCount: stageData.wordCount || (articleData?.content?.split(/\s+/).length || 0),
    humanizedArticle: stageData.humanizedArticle || articleData?.content || '',
    humanScore: stageData.humanScore || articleData?.humanization_score || 0,
    seoArticle: stageData.seoArticle || articleData?.content || '',
    seoStats: stageData.seoStats || {},
    meta: stageData.metaData || pipeline.meta_data || (articleData ? {
      metaTitle: articleData.title,
      metaDescription: articleData.meta_description,
      canonicalSlug: articleData.slug,
    } : null),
    contentSections: stageData.contentSections || [
      articleData?.content_part1,
      articleData?.content_part2,
      articleData?.content_part3
    ].filter(Boolean),
    heroType: articleData?.hero_type || pipeline.hero_type || stageData.heroType || 'image',
  };

  // Update state
  update(resumeState);

  // Restore UI state
  const hType = resumeState.heroType;
  if (hType) setHeroType(hType as 'image' | 'video');
  if (pipeline.hero_source || stageData.heroSource) setHeroSource(pipeline.hero_source || stageData.heroSource);
  if (pipeline.section_source || stageData.sectionSource) setSectionSource(pipeline.section_source || stageData.sectionSource);

  // Restore uploaded media
  const restoredUploads: any = {};
  if (articleData?.hero_type === 'video' && articleData?.video_url) {
    restoredUploads.hero = articleData.video_url;
  } else if (articleData?.hero_url) {
    restoredUploads.hero = articleData.hero_url;
  }
  if (articleData?.content_image0) restoredUploads.section1 = articleData.content_image0;
  if (articleData?.content_image1) restoredUploads.section2 = articleData.content_image1;
  if (articleData?.content_image2) restoredUploads.section3 = articleData.content_image2;
  
  if (Object.keys(restoredUploads).length > 0) {
    setUploadedImages(restoredUploads);
  }

  // Build images array
  const imagesArray: any[] = [];
  if (restoredUploads.hero && hType !== 'video') {
    imagesArray.push({ url: restoredUploads.hero, position: 'hero', alt: 'Hero' });
  }
  if (restoredUploads.section1) imagesArray.push({ url: restoredUploads.section1, position: 'section1', alt: 'Section 1' });
  if (restoredUploads.section2) imagesArray.push({ url: restoredUploads.section2, position: 'section2', alt: 'Section 2' });
  if (restoredUploads.section3) imagesArray.push({ url: restoredUploads.section3, position: 'section3', alt: 'Section 3' });
  
  if (imagesArray.length > 0) {
    update({ images: imagesArray });
  }

  if (restoredUploads.hero) setHeroComplete(true);

  // Set the stage
  setStage(targetStage);
  console.log(`✅ Resumed at Stage ${targetStage}`);

  toast({
    title: 'Pipeline loaded!',
    description: `Resuming from Stage ${targetStage}`
  });
};
```

---

## How It Works

### Before (Broken):
1. User stops at Stage 5
2. `savePipelineProgress()` calls update API
3. Update API only saves `current_stage: 5`
4. Resume tries to load `pipeline.humanized_article` (doesn't exist)
5. Falls back to Stage 1

### After (Fixed):
1. User stops at Stage 5
2. `savePipelineProgress()` calls update API with data: `{ humanizedArticle: "...", humanScore: 87 }`
3. Update API saves `current_stage: 5` AND `stage_data: { humanizedArticle: "...", humanScore: 87, ... }`
4. Resume loads from `stageData.humanizedArticle`
5. Successfully resumes at Stage 5 with all data

---

## Database Schema Check

Make sure your `content_pipelines` table has a `stage_data` column:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content_pipelines' 
AND column_name = 'stage_data';

-- If it doesn't exist, add it:
ALTER TABLE content_pipelines 
ADD COLUMN IF NOT EXISTS stage_data JSONB DEFAULT '{}'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_content_pipelines_stage_data 
ON content_pipelines USING gin(stage_data);
```

---

## Testing Steps

1. **Create a new article** and stop at Stage 3 (Plan)
2. **Check the database:**
   ```sql
   SELECT current_stage, stage_data 
   FROM content_pipelines 
   WHERE id = 'YOUR_PIPELINE_ID';
   ```
   Should show: `current_stage: 3` and `stage_data` with plan data

3. **Go back to insights page** and click "Resume"
4. **Check console logs:**
   - Should see "🔄 Resuming pipeline"
   - Should see "📦 Stage data keys: [...]"
   - Should see "✅ Resumed at Stage 3"

5. **Verify:** Should be at Stage 3 with your plan visible

---

## Quick Debug

If it still doesn't work, open browser console and check:

```javascript
// Should show the stage data
console.log('Stage data:', pipeline.stage_data);

// Should show target stage
console.log('Target stage:', pipeline.current_stage);
```

If `stage_data` is empty or `{}`, the update API isn't saving it correctly.
If `current_stage` is 1 but you stopped at 3, the `savePipelineProgress` isn't being called.

---

## Status

✅ Solution provided
⏳ Manual implementation needed (2 files)
🎯 Estimated time: 5-10 minutes
