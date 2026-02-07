# Fix Resume Pipeline Functionality

## Problem
When clicking "Resume" on an article, it starts from Stage 1 instead of continuing from where it left off. The pipeline data exists but isn't being properly loaded into the state.

## Root Cause
The `resumePipeline` function (line 114-197 in page.tsx) loads data from `content_pipelines` table, but some fields might be missing or not properly mapped.

## Solution

### Update the `resumePipeline` function in `page.tsx` (line 114-197)

Replace the existing function with this enhanced version:

```typescript
const resumePipeline = async (pipeline: any) => {
  console.log('🔄 Resuming pipeline:', pipeline.id);
  console.log('📊 Pipeline data:', pipeline);
  
  const targetStage = pipeline.current_stage || 1;
  console.log(`🎯 Target stage: ${targetStage}`);

  // Load article data from insights_posts
  let articleData: any = null;
  if (pipeline.insight_id) {
    try {
      const res = await fetch(`/api/admin/insights/pipeline/get-draft?id=${pipeline.insight_id}`);
      const result = await res.json();
      if (result.success && result.draft) {
        articleData = result.draft;
        console.log('📄 Article data loaded:', articleData.title);
      }
    } catch (err) {
      console.error('Failed to load article data:', err);
    }
  }

  // Extract stage data from pipeline
  const stageData = pipeline.stage_data || {};
  console.log('📦 Stage data:', stageData);

  // Build state object with all available data
  const resumeState: any = {
    pipelineId: pipeline.id,
    insightId: pipeline.insight_id,
  };

  // Stage 1: Brief
  if (pipeline.brief_transcript || pipeline.brief_type) {
    resumeState.transcript = pipeline.brief_transcript || '';
    resumeState.briefConfirmed = true;
    resumeState.selectedSilo = pipeline.selected_silo || articleData?.silo_topic || '';
    console.log('✅ Stage 1 data loaded');
  }

  // Stage 2: Ideas & Research
  if (pipeline.selected_idea || articleData?.title) {
    resumeState.selectedIdea = pipeline.selected_idea || {
      title: articleData?.title,
      keywords: articleData?.keywords || []
    };
    
    // Load research data
    if (stageData.researchData || articleData?.serper_research) {
      resumeState.researchData = stageData.researchData || articleData?.serper_research || {
        serperResults: pipeline.serper_results,
        laborArticles: pipeline.hr_kb_results,
        research: { synthesis: pipeline.research_synthesis }
      };
    }
    console.log('✅ Stage 2 data loaded');
  }

  // Stage 3: Plan
  if (pipeline.article_plan || stageData.plan || articleData?.generation_metadata?.plan) {
    resumeState.plan = pipeline.article_plan || stageData.plan || articleData?.generation_metadata?.plan;
    resumeState.planApproved = pipeline.plan_approved || stageData.planApproved || false;
    console.log('✅ Stage 3 data loaded');
  }

  // Stage 4: Article
  if (pipeline.raw_article || stageData.article || articleData?.content) {
    resumeState.article = pipeline.raw_article || stageData.article || articleData?.content || '';
    resumeState.wordCount = pipeline.word_count || resumeState.article.split(/\s+/).length || 0;
    console.log('✅ Stage 4 data loaded');
  }

  // Stage 5: Humanize
  if (pipeline.humanized_article || stageData.humanizedArticle) {
    resumeState.humanizedArticle = pipeline.humanized_article || stageData.humanizedArticle || resumeState.article;
    resumeState.humanScore = pipeline.human_score || stageData.humanScore || articleData?.humanization_score || 0;
    console.log('✅ Stage 5 data loaded');
  }

  // Stage 6: SEO
  if (pipeline.seo_article || stageData.seoArticle) {
    resumeState.seoArticle = pipeline.seo_article || stageData.seoArticle || resumeState.humanizedArticle;
    resumeState.seoStats = pipeline.seo_stats || stageData.seoStats || {};
    console.log('✅ Stage 6 data loaded');
  }

  // Stage 7: Meta
  if (pipeline.meta_data || stageData.metaData) {
    resumeState.meta = pipeline.meta_data || stageData.metaData || (articleData ? {
      metaTitle: articleData.title,
      metaDescription: articleData.meta_description,
      canonicalSlug: articleData.slug,
    } : null);
    console.log('✅ Stage 7 data loaded');
  }

  // Content sections
  if (articleData?.content_part1 || stageData.contentSections) {
    resumeState.contentSections = stageData.contentSections || [
      articleData?.content_part1 || '',
      articleData?.content_part2 || '',
      articleData?.content_part3 || ''
    ].filter(Boolean);
  }

  // Hero type and media
  resumeState.heroType = articleData?.hero_type || pipeline.hero_type || stageData.heroType || 'image';
  
  // Update state
  update(resumeState);
  console.log('📝 State updated with resume data');

  // Restore hero/section sources
  const hType = resumeState.heroType;
  if (hType) setHeroType(hType as 'image' | 'video');
  if (pipeline.hero_source || stageData.heroSource) {
    setHeroSource(pipeline.hero_source || stageData.heroSource);
  }
  if (pipeline.section_source || stageData.sectionSource) {
    setSectionSource(pipeline.section_source || stageData.sectionSource);
  }

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
    console.log('🖼️ Media restored:', Object.keys(restoredUploads));
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
  console.log(`✅ Pipeline resumed at Stage ${targetStage}`);

  toast({
    title: 'Pipeline loaded!',
    description: `Resuming from Stage ${targetStage}`
  });
};
```

## Key Improvements

1. **Better Logging** - Console logs at each step to debug what's being loaded
2. **Stage Data Extraction** - Checks `stage_data` field in pipeline for additional data
3. **Fallback Chain** - Multiple fallbacks for each field (pipeline → stageData → articleData)
4. **Explicit Stage Checks** - Validates data exists for each stage before loading
5. **Better Error Handling** - Continues even if some data is missing

## Testing

After implementing, test by:

1. Create an article and stop at Stage 3
2. Go back to insights page
3. Click "Resume" on that article
4. Should load at Stage 3 with all previous data intact

## Debugging

If it still starts at Stage 1, check the console logs:
- "🔄 Resuming pipeline:" - Shows pipeline ID
- "📊 Pipeline data:" - Shows what's in the database
- "🎯 Target stage:" - Shows where it should resume
- "✅ Stage X data loaded" - Shows which stages have data

If you see "Target stage: 1" but you stopped at Stage 3, the `current_stage` field in the database isn't being updated correctly.

## Database Check

Run this query in Supabase to check your pipeline data:

```sql
SELECT 
  id,
  current_stage,
  brief_transcript,
  selected_idea,
  article_plan,
  raw_article,
  humanized_article,
  seo_article,
  meta_data,
  stage_data
FROM content_pipelines
WHERE id = 'YOUR_PIPELINE_ID'
ORDER BY created_at DESC
LIMIT 1;
```

Make sure `current_stage` is being updated as you progress through stages.
