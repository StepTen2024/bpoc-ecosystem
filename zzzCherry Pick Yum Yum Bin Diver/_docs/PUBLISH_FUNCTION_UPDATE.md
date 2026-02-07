// INSTRUCTIONS: Add this to page.tsx around line 463

// Replace the existing publishArticle function with this version:

const publishArticle = async (isDraft: boolean) => {
  setLoading(true);
  
  // Add progress tracking state at the top of the component if not already there:
  // const [publishProgress, setPublishProgress] = useState(0);
  // const [publishStatus, setPublishStatus] = useState('');
  
  try {
    const finalContent = state.seoArticle || state.humanizedArticle || state.article;
    const sections = state.contentSections.length === 3
      ? state.contentSections
      : splitContentIntoSections(finalContent);

    // Show initial progress
    setPublishProgress(5);
    setPublishStatus(isDraft ? 'Saving draft...' : 'Starting publication...');

    if (state.pipelineId) {
      const res = await fetch('/api/admin/content-pipeline/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineId: state.pipelineId, isDraft })
      });
      const result = await res.json();
      if (result.success) {
        toast({ title: isDraft ? 'Saved as draft!' : 'Published!' });
        router.push(isDraft ? '/admin/insights' : `/insights/${result.article?.slug}`);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } else {
      // Determine if we need to generate media
      const needsHeroGeneration = !isDraft && (!uploadedImages.hero && (heroSource === 'generate' || !heroSource));
      const needsSectionGeneration = !isDraft && (!uploadedImages.section1 && (sectionSource === 'generate' || !sectionSource));
      
      if (!isDraft && (needsHeroGeneration || needsSectionGeneration)) {
        // Show media generation progress
        if (state.heroType === 'video' && needsHeroGeneration) {
          setPublishProgress(10);
          setPublishStatus('🎬 Generating hero video with Runway AI...');
          // Simulate progress for video (takes ~60 seconds)
          const videoInterval = setInterval(() => {
            setPublishProgress(prev => Math.min(prev + 2, 50));
          }, 2000);
          
          setTimeout(() => clearInterval(videoInterval), 60000);
        } else if (needsHeroGeneration) {
          setPublishProgress(10);
          setPublishStatus('🖼️ Generating hero image with Imagen 4...');
        }
        
        if (needsSectionGeneration) {
          setPublishProgress(prev => Math.max(prev, 55));
          setPublishStatus('🖼️ Generating 3 section images...');
        }
      } else {
        setPublishProgress(10);
        setPublishStatus(isDraft ? 'Saving...' : 'Publishing...');
      }

      setPublishProgress(70);
      setPublishStatus('Uploading to database...');

      const res = await fetch('/api/admin/insights/pipeline/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.plan?.title || state.selectedIdea?.title,
          content: finalContent,
          contentSections: sections,
          slug: state.meta?.canonicalSlug,
          silo: state.selectedSilo,
          keywords: state.selectedIdea?.keywords,
          meta: state.meta,
          heroType: state.heroType || 'image',
          heroSource: heroSource || 'generate',
          sectionSource: sectionSource || 'generate',
          uploadedHeroUrl: uploadedImages.hero,
          uploadedSectionUrls: [
            uploadedImages.section1,
            uploadedImages.section2,
            uploadedImages.section3,
          ].filter(Boolean),
          isDraft,
          draftId: state.draftId,
        })
      });

      setPublishProgress(95);
      setPublishStatus('Finalizing...');

      const result = await res.json();
      
      if (result.success) {
        setPublishProgress(100);
        setPublishStatus('Done!');
        
        const mediaInfo = [];
        if (result.article?.heroUrl) mediaInfo.push('✓ Hero');
        if (result.article?.sectionUrls?.length) mediaInfo.push(`✓ ${result.article.sectionUrls.length} sections`);
        
        toast({ 
          title: isDraft ? 'Saved as draft!' : 'Published!',
          description: isDraft ? undefined : (mediaInfo.length > 0 ? `Media: ${mediaInfo.join(', ')}` : undefined)
        });
        
        router.push(isDraft ? '/admin/insights' : `/insights/${result.article?.slug}`);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    }
  } catch (err: any) {
    toast({ title: 'Error', description: err.message, variant: 'destructive' });
  } finally {
    setLoading(false);
    setPublishProgress(0);
    setPublishStatus('');
  }
};
