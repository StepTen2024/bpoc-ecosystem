// Add this enhanced resumePipeline function to page.tsx (replace lines 114-197)

const resumePipeline = async (pipeline: any) => {
  console.log('🔄 ========== RESUME PIPELINE ==========');
  console.log('📊 Full pipeline object:', pipeline);
  console.log('🎯 Current stage from DB:', pipeline.current_stage);
  console.log('📦 Stage data:', pipeline.stage_data);
  console.log('📝 Insight ID:', pipeline.insight_id);
  
  const targetStage = pipeline.current_stage || 1;
  console.log(`🎯 Target stage (after default): ${targetStage}`);

  // Load article data from insights_posts
  let articleData: any = null;
  if (pipeline.insight_id) {
    try {
      console.log('📄 Fetching article data...');
      const res = await fetch(`/api/admin/insights/pipeline/get-draft?id=${pipeline.insight_id}`);
      const result = await res.json();
      if (result.success && result.draft) {
        articleData = result.draft;
        console.log('✅ Article data loaded:', {
          title: articleData.title,
          hasContent: !!articleData.content,
          contentLength: articleData.content?.length || 0
        });
      } else {
        console.log('⚠️ No article data found');
      }
    } catch (err) {
      console.error('❌ Failed to load article data:', err);
    }
  } else {
    console.log('⚠️ No insight_id in pipeline');
  }

  // Extract stage_data if it exists
  const stageData = pipeline.stage_data || {};
  console.log('📦 Stage data keys:', Object.keys(stageData));

  // Build state object
  const resumeState = {
    pipelineId: pipeline.id,
    insightId: pipeline.insight_id,
    transcript: pipeline.brief_transcript || stageData.briefTranscript || '',
    briefConfirmed: !!(pipeline.brief_transcript || stageData.briefTranscript),
    selectedSilo: pipeline.selected_silo || stageData.selectedSilo || articleData?.silo_topic || '',
    selectedIdea: pipeline.selected_idea || stageData.selectedIdea || (articleData ? { title: articleData.title } : null),
    researchData: stageData.researchData || articleData?.serper_research || {
      serperResults: pipeline.serper_results,
      laborArticles: pipeline.hr_kb_results,
      research: { synthesis: pipeline.research_synthesis }
    },
    plan: pipeline.article_plan || stageData.plan || articleData?.generation_metadata?.plan,
    planApproved: pipeline.plan_approved || stageData.planApproved || false,
    article: stageData.article || articleData?.content || pipeline.raw_article || '',
    wordCount: stageData.wordCount || pipeline.word_count || (articleData?.content?.split(/\s+/).length || 0),
    humanizedArticle: stageData.humanizedArticle || articleData?.content || pipeline.humanized_article || '',
    humanScore: stageData.humanScore || articleData?.humanization_score || pipeline.human_score || 0,
    seoArticle: stageData.seoArticle || articleData?.content || pipeline.seo_article || '',
    seoStats: stageData.seoStats || pipeline.seo_stats || {},
    contentSections: stageData.contentSections || [
      articleData?.content_part1 || '',
      articleData?.content_part2 || '',
      articleData?.content_part3 || ''
    ].filter(Boolean),
    meta: stageData.metaData || pipeline.meta_data || (articleData?.generation_metadata ? {
      metaTitle: articleData.title,
      metaDescription: articleData.meta_description,
    } : null),
    images: [],
    heroType: articleData?.hero_type || pipeline.hero_type || stageData.heroType || 'image',
  };

  console.log('📝 Resume state built:', {
    hasTranscript: !!resumeState.transcript,
    hasIdea: !!resumeState.selectedIdea,
    hasPlan: !!resumeState.plan,
    hasArticle: !!resumeState.article,
    hasHumanized: !!resumeState.humanizedArticle,
    hasSeo: !!resumeState.seoArticle,
    hasMeta: !!resumeState.meta,
  });

  update(resumeState);

  const hType = resumeState.heroType;
  if (hType) setHeroType(hType as 'image' | 'video');
  if (pipeline.hero_source || stageData.heroSource) setHeroSource(pipeline.hero_source || stageData.heroSource);
  if (pipeline.section_source || stageData.sectionSource) setSectionSource(pipeline.section_source || stageData.sectionSource);

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
    console.log('🖼️ Restored uploads:', Object.keys(restoredUploads));
    setUploadedImages(restoredUploads);
  }

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

  console.log(`🎯 Setting stage to: ${targetStage}`);
  setStage(targetStage);

  console.log('✅ ========== RESUME COMPLETE ==========');
  
  toast({
    title: 'Pipeline loaded!',
    description: `Resuming from Stage ${targetStage}`
  });
};
