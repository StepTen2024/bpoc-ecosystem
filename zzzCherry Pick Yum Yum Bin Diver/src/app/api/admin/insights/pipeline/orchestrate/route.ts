/**
 * MASTER ORCHESTRATOR
 * Runs all 9 stages of the AI content pipeline end-to-end
 * 
 * STAGES:
 * 1. Brief Recording (Wispr) - Already handled externally
 * 2. Research (Perplexity + Serper)
 * 3. Plan Generation (Claude Opus 4)
 * 4. Write Article (Claude Opus 4)
 * 5. Humanize (Grok)
 * 6. SEO Optimization (Claude Sonnet 4)
 * 7. Meta Tags & Schema (GPT-4o)
 * 8. Media Generation (Google Veo + Imagen)
 * 9. Finalize & Publish
 * 
 * USAGE:
 * POST /api/admin/insights/pipeline/orchestrate
 * Body: { brief: "...", autoPublish: true }
 * 
 * RETURNS:
 * { success: true, article: {...}, pipelineId: "..." }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logError } from '@/lib/error-logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { 
      brief, 
      autoPublish = false,
      forcePublish = false,
    } = await req.json();

    if (!brief || brief.length < 50) {
      return NextResponse.json(
        { success: false, error: 'Brief must be at least 50 characters' },
        { status: 400 }
      );
    }

    console.log('🚀 MASTER ORCHESTRATOR STARTED');
    console.log(`📝 Brief: ${brief.substring(0, 100)}...`);
    console.log(`🔄 Auto-publish: ${autoPublish}`);
    console.log('');

    // ============================================
    // STEP 0: Create Pipeline Entry
    // ============================================
    console.log('📊 Creating pipeline entry...');
    
    const { data: pipeline, error: pipelineError } = await supabase
      .from('content_pipelines')
      .insert({
        brief,
        status: 'in_progress',
        current_stage: 0,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    if (pipelineError || !pipeline) {
      throw new Error('Failed to create pipeline entry');
    }

    console.log(`✅ Pipeline created: ${pipeline.id}\n`);

    let currentData: any = { brief };

    // ============================================
    // STAGE 2: RESEARCH
    // ============================================
    console.log('━'.repeat(60));
    console.log('🔍 STAGE 2: RESEARCH (Perplexity + Serper)');
    console.log('━'.repeat(60));

    try {
      const researchResponse = await fetch(`${BASE_URL}/api/admin/insights/pipeline/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: currentData.brief,
          pipelineId: pipeline.id,
        }),
      });

      const researchData = await researchResponse.json();
      
      if (!researchData.success) {
        throw new Error(researchData.error || 'Research failed');
      }

      currentData = { ...currentData, ...researchData };
      console.log(`✅ STAGE 2 COMPLETE (${researchData.processingTime}s)\n`);
    } catch (error: any) {
      console.error('❌ STAGE 2 FAILED:', error.message);
      await markPipelineFailed(pipeline.id, 2, error.message);
      throw error;
    }

    // ============================================
    // STAGE 3: PLAN GENERATION
    // ============================================
    console.log('━'.repeat(60));
    console.log('📋 STAGE 3: PLAN GENERATION (Claude Opus 4)');
    console.log('━'.repeat(60));

    try {
      const planResponse = await fetch(`${BASE_URL}/api/admin/insights/pipeline/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: currentData.brief,
          research: currentData.research,
          pipelineId: pipeline.id,
        }),
      });

      const planData = await planResponse.json();
      
      if (!planData.success) {
        throw new Error(planData.error || 'Plan generation failed');
      }

      currentData = { ...currentData, ...planData };
      console.log(`✅ STAGE 3 COMPLETE (${planData.processingTime}s)\n`);
    } catch (error: any) {
      console.error('❌ STAGE 3 FAILED:', error.message);
      await markPipelineFailed(pipeline.id, 3, error.message);
      throw error;
    }

    // ============================================
    // STAGE 4: WRITE ARTICLE
    // ============================================
    console.log('━'.repeat(60));
    console.log('✍️  STAGE 4: WRITE ARTICLE (Claude Opus 4)');
    console.log('━'.repeat(60));

    try {
      const writeResponse = await fetch(`${BASE_URL}/api/admin/insights/pipeline/write-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: currentData.plan,
          research: currentData.research,
          brief: currentData.brief,
          pipelineId: pipeline.id,
        }),
      });

      const writeData = await writeResponse.json();
      
      if (!writeData.success) {
        throw new Error(writeData.error || 'Article writing failed');
      }

      currentData = { ...currentData, ...writeData };
      console.log(`✅ STAGE 4 COMPLETE (${writeData.processingTime}s)\n`);
    } catch (error: any) {
      console.error('❌ STAGE 4 FAILED:', error.message);
      await markPipelineFailed(pipeline.id, 4, error.message);
      throw error;
    }

    // ============================================
    // STAGE 5: HUMANIZE
    // ============================================
    console.log('━'.repeat(60));
    console.log('🤖 STAGE 5: HUMANIZE (Grok)');
    console.log('━'.repeat(60));

    try {
      const humanizeResponse = await fetch(`${BASE_URL}/api/admin/insights/pipeline/humanize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: currentData.article,
          title: currentData.plan?.title,
          pipelineId: pipeline.id,
        }),
      });

      const humanizeData = await humanizeResponse.json();
      
      if (!humanizeData.success) {
        throw new Error(humanizeData.error || 'Humanization failed');
      }

      currentData = { ...currentData, ...humanizeData };
      console.log(`✅ STAGE 5 COMPLETE (${humanizeData.processingTime}s)\n`);
    } catch (error: any) {
      console.error('❌ STAGE 5 FAILED:', error.message);
      await markPipelineFailed(pipeline.id, 5, error.message);
      throw error;
    }

    // ============================================
    // STAGE 6: SEO OPTIMIZATION
    // ============================================
    console.log('━'.repeat(60));
    console.log('📈 STAGE 6: SEO OPTIMIZATION (Claude Sonnet 4)');
    console.log('━'.repeat(60));

    try {
      const seoResponse = await fetch(`${BASE_URL}/api/admin/insights/pipeline/seo-optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: currentData.humanizedArticle || currentData.article,
          title: currentData.plan?.title,
          keywords: currentData.plan?.keywords?.main || [],
          plan: currentData.plan,
          pipelineId: pipeline.id,
        }),
      });

      const seoData = await seoResponse.json();
      
      if (!seoData.success) {
        throw new Error(seoData.error || 'SEO optimization failed');
      }

      currentData = { ...currentData, ...seoData };
      console.log(`✅ STAGE 6 COMPLETE (${seoData.processingTime}s)\n`);
    } catch (error: any) {
      console.error('❌ STAGE 6 FAILED:', error.message);
      await markPipelineFailed(pipeline.id, 6, error.message);
      throw error;
    }

    // ============================================
    // STAGE 7: META TAGS & SCHEMA
    // ============================================
    console.log('━'.repeat(60));
    console.log('🏷️  STAGE 7: META TAGS & SCHEMA (GPT-4o)');
    console.log('━'.repeat(60));

    try {
      const metaResponse = await fetch(`${BASE_URL}/api/admin/insights/pipeline/generate-meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: currentData.optimizedArticle || currentData.humanizedArticle || currentData.article,
          title: currentData.plan?.title,
          keywords: currentData.plan?.keywords?.main || [],
          originalBrief: currentData.brief,
          plan: currentData.plan,
          category: currentData.plan?.silo || 'BPO & Outsourcing',
          pipelineId: pipeline.id,
        }),
      });

      const metaData = await metaResponse.json();
      
      if (!metaData.success) {
        throw new Error(metaData.error || 'Meta generation failed');
      }

      currentData = { ...currentData, ...metaData };
      console.log(`✅ STAGE 7 COMPLETE (${metaData.processingTime}s)\n`);
    } catch (error: any) {
      console.error('❌ STAGE 7 FAILED:', error.message);
      await markPipelineFailed(pipeline.id, 7, error.message);
      throw error;
    }

    // ============================================
    // STAGE 8: MEDIA GENERATION
    // ============================================
    console.log('━'.repeat(60));
    console.log('🎬 STAGE 8: MEDIA GENERATION (Google Veo + Imagen)');
    console.log('━'.repeat(60));

    try {
      const mediaResponse = await fetch(`${BASE_URL}/api/admin/insights/pipeline/generate-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article: currentData.optimizedArticle || currentData.humanizedArticle || currentData.article,
          title: currentData.plan?.title,
          keywords: currentData.plan?.keywords?.main || [],
          category: currentData.plan?.silo || 'BPO & Outsourcing',
          style: 'people-focused',
          pipelineId: pipeline.id,
        }),
      });

      const mediaData = await mediaResponse.json();
      
      if (!mediaData.success) {
        throw new Error(mediaData.error || 'Media generation failed');
      }

      currentData = { ...currentData, ...mediaData };
      console.log(`✅ STAGE 8 COMPLETE (${mediaData.processingTime}s)\n`);
    } catch (error: any) {
      console.error('❌ STAGE 8 FAILED:', error.message);
      await markPipelineFailed(pipeline.id, 8, error.message);
      throw error;
    }

    // ============================================
    // STAGE 9: FINALIZE & PUBLISH
    // ============================================
    console.log('━'.repeat(60));
    console.log('🚀 STAGE 9: FINALIZE & PUBLISH');
    console.log('━'.repeat(60));

    try {
      const finalizeResponse = await fetch(`${BASE_URL}/api/admin/insights/pipeline/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipelineId: pipeline.id,
          forcePublish,
          status: autoPublish ? 'published' : 'review',
        }),
      });

      const finalizeData = await finalizeResponse.json();
      
      if (!finalizeData.success) {
        throw new Error(finalizeData.error || 'Finalization failed');
      }

      currentData = { ...currentData, ...finalizeData };
      console.log(`✅ STAGE 9 COMPLETE (${finalizeData.processingTime}s)\n`);
    } catch (error: any) {
      console.error('❌ STAGE 9 FAILED:', error.message);
      await markPipelineFailed(pipeline.id, 9, error.message);
      throw error;
    }

    // ============================================
    // DONE!
    // ============================================
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('='.repeat(60));
    console.log('🎉 PIPELINE COMPLETE!');
    console.log('='.repeat(60));
    console.log(`⏱️  Total time: ${totalDuration}s`);
    console.log(`📄 Article: ${currentData.article?.title || 'Unknown'}`);
    console.log(`🔗 URL: ${currentData.article?.url || 'Not available'}`);
    console.log(`📊 Quality: ${currentData.quality?.score || 0}/100`);
    console.log(`🎯 RankMath: ${currentData.quality?.checks?.rankMathScore?.value || 0}/100`);
    console.log(`✅ Status: ${currentData.article?.status || 'Unknown'}`);
    console.log('='.repeat(60));

    return NextResponse.json({
      success: true,
      article: currentData.article,
      quality: currentData.quality,
      pipelineId: pipeline.id,
      totalDuration: parseFloat(totalDuration),
      stages: {
        research: true,
        plan: true,
        write: true,
        humanize: true,
        seo: true,
        meta: true,
        media: true,
        finalize: true,
      },
    });

  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ PIPELINE FAILED');
    console.error('='.repeat(60));
    console.error(`Error: ${error.message}`);
    console.error(`Duration: ${duration}s`);
    console.error('='.repeat(60));

    await logError(error, {
      endpoint: '/api/admin/insights/pipeline/orchestrate',
      http_method: 'POST',
      external_service: 'pipeline_orchestrator',
    });

    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        duration: parseFloat(duration),
      },
      { status: 500 }
    );
  }
}

/**
 * Mark pipeline as failed
 */
async function markPipelineFailed(
  pipelineId: string,
  stage: number,
  error: string
): Promise<void> {
  await supabase
    .from('content_pipelines')
    .update({
      status: 'failed',
      current_stage: stage,
      error_message: error,
      failed_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    })
    .eq('id', pipelineId);
}
