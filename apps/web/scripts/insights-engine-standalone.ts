#!/usr/bin/env npx tsx
/**
 * STANDALONE INSIGHTS ENGINE — NO UI, NO HTTP, PURE BACKEND
 * 
 * Processes all queued articles directly without any web server.
 * Just runs until queue is empty.
 * 
 * Run: cd apps/web && npx tsx scripts/insights-engine-standalone.ts
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env
config({ path: resolve(__dirname, '../.env.local') });

// Clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Grok (xAI)
const grokApiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;

// Perplexity
const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

// ═══════════════════════════════════════════════════════════
// QUEUE HELPERS
// ═══════════════════════════════════════════════════════════

async function getNextQueuedItem() {
  const { data, error } = await supabase
    .from('insights_production_queue')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

async function updateQueueStatus(id: string, status: string, extra: Record<string, any> = {}) {
  await supabase
    .from('insights_production_queue')
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq('id', id);
  console.log(`   📌 Status: ${status}`);
}

async function getQueueStats() {
  const { data } = await supabase
    .from('insights_production_queue')
    .select('status');
  
  if (!data) return { queued: 0, published: 0, failed: 0, total: 0 };
  
  return {
    queued: data.filter(d => d.status === 'queued').length,
    published: data.filter(d => d.status === 'published').length,
    failed: data.filter(d => d.status === 'failed').length,
    total: data.length,
  };
}

// ═══════════════════════════════════════════════════════════
// STAGE 1: RESEARCH (Perplexity)
// ═══════════════════════════════════════════════════════════

async function doResearch(topic: string, keywords: string): Promise<string> {
  console.log('   🔍 Stage 1: Research (Perplexity)...');
  
  if (!perplexityApiKey) {
    console.log('   ⚠️ No Perplexity key, skipping research');
    return '';
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: `Research the topic: "${topic}" with focus on keywords: ${keywords}. 
                    Focus on Philippine BPO industry context.
                    Include statistics, trends, company examples, salary data in PHP.
                    Return structured research findings.`,
        }],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err: any) {
    console.log(`   ⚠️ Research error: ${err.message}`);
    return '';
  }
}

// ═══════════════════════════════════════════════════════════
// STAGE 2: PLAN (Claude)
// ═══════════════════════════════════════════════════════════

async function generatePlan(topic: string, research: string, level: string): Promise<string> {
  console.log('   📋 Stage 2: Plan (Claude)...');
  
  const wordCount = level === 'PILLAR' ? '3000-4500' : '1800-2500';
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Create an article outline for: "${topic}"

Research context:
${research}

Requirements:
- Target word count: ${wordCount} words
- Written for Filipino BPO workers
- Include practical advice with Philippine context
- Use ₱ for salary figures
- Mention real Philippine companies

Return a structured outline with:
1. Title suggestions (3 options)
2. H2 sections (4-6 sections)
3. Key points for each section
4. Suggested internal links`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// ═══════════════════════════════════════════════════════════
// STAGE 3: WRITE (Claude)
// ═══════════════════════════════════════════════════════════

async function writeArticle(topic: string, plan: string, level: string): Promise<string> {
  console.log('   ✍️ Stage 3: Write (Claude)...');
  
  const wordCount = level === 'PILLAR' ? '3500' : '2000';
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Write a complete article based on this outline:

${plan}

Requirements:
- Write as "Ate Yna", a friendly Filipino career coach
- Target ${wordCount} words
- Use conversational Filipino-English tone
- Include specific Philippine examples
- Use ₱ for all salary figures
- Mention real BPO companies (Accenture, Concentrix, TTEC, etc.)
- Add practical, actionable advice
- Format with proper H2, H3 headers in markdown
- Include bullet points and numbered lists

Write the full article now:`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

// ═══════════════════════════════════════════════════════════
// STAGE 4: HUMANIZE (Grok)
// ═══════════════════════════════════════════════════════════

async function humanizeArticle(article: string): Promise<string> {
  console.log('   🎭 Stage 4: Humanize (Grok)...');
  
  if (!grokApiKey) {
    console.log('   ⚠️ No Grok key, skipping humanization');
    return article;
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-fast',
        messages: [{
          role: 'user',
          content: `Humanize this article to sound more natural and conversational.
Keep the same structure and information, but make it feel like a real person wrote it.
Add small imperfections, conversational transitions, and natural flow.
Keep the Filipino-English tone.

Article:
${article}

Return the humanized version:`,
        }],
        max_tokens: 8000,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || article;
  } catch (err: any) {
    console.log(`   ⚠️ Humanize error: ${err.message}`);
    return article;
  }
}

// ═══════════════════════════════════════════════════════════
// STAGE 5: SEO (Claude Sonnet)
// ═══════════════════════════════════════════════════════════

async function optimizeSEO(article: string, keywords: string): Promise<{ article: string; metaDescription: string }> {
  console.log('   🔎 Stage 5: SEO (Claude)...');
  
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `Optimize this article for SEO with keywords: ${keywords}

Article:
${article}

Tasks:
1. Naturally incorporate keywords (don't stuff)
2. Optimize H2/H3 headers for search
3. Add internal linking placeholders [LINK: topic]
4. Generate meta description (150-160 chars)

Return JSON:
{
  "article": "optimized article...",
  "metaDescription": "150-160 char description"
}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}
  
  return { article, metaDescription: '' };
}

// ═══════════════════════════════════════════════════════════
// STAGE 6: META (GPT-4o)
// ═══════════════════════════════════════════════════════════

async function generateMeta(title: string, description: string): Promise<any> {
  console.log('   🏷️ Stage 6: Meta (GPT-4o)...');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `Generate SEO meta tags for article:
Title: ${title}
Description: ${description}

Return JSON with:
{
  "title": "SEO optimized title (50-60 chars)",
  "description": "meta description (150-160 chars)",
  "ogTitle": "Open Graph title",
  "ogDescription": "OG description",
  "keywords": ["keyword1", "keyword2", ...]
}`,
    }],
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch {
    return { title, description };
  }
}

// ═══════════════════════════════════════════════════════════
// STAGE 7: PUBLISH
// ═══════════════════════════════════════════════════════════

async function publishArticle(item: any, article: string, meta: any): Promise<string> {
  console.log('   📤 Stage 7: Publish to database...');
  
  const { data, error } = await supabase
    .from('insights_posts')
    .insert({
      title: meta.title || item.title,
      slug: item.slug,
      content: article,
      meta_description: meta.description || meta.metaDescription,
      category: item.silo_name || 'BPO & Outsourcing',
      silo_topic: item.silo_name,
      silo_id: item.silo_id,
      is_published: true,
      published_at: new Date().toISOString(),
      is_pillar: item.level === 'PILLAR',
      author_name: 'Ate Yna',
      author_slug: 'ate-yna',
      read_time: Math.ceil(article.split(/\s+/).length / 200),
    })
    .select('id')
    .single();

  if (error) {
    console.error('   ❌ Publish error:', error.message);
    throw error;
  }

  return data.id;
}

// ═══════════════════════════════════════════════════════════
// MAIN PROCESSOR
// ═══════════════════════════════════════════════════════════

async function processQueueItem(item: any): Promise<boolean> {
  const startTime = Date.now();
  console.log(`\n🏭 ══════════════════════════════════════════════════════`);
  console.log(`🏭 Processing: "${item.title}"`);
  console.log(`🏭 Slug: ${item.slug} | Level: ${item.level}`);
  console.log(`🏭 ══════════════════════════════════════════════════════`);

  try {
    await updateQueueStatus(item.id, 'research');

    // Stage 1: Research
    const research = await doResearch(item.title, item.target_keywords || '');

    // Stage 2: Plan
    await updateQueueStatus(item.id, 'planning');
    const plan = await generatePlan(item.title, research, item.level);

    // Stage 3: Write
    await updateQueueStatus(item.id, 'writing');
    let article = await writeArticle(item.title, plan, item.level);

    // Stage 4: Humanize
    await updateQueueStatus(item.id, 'humanizing');
    article = await humanizeArticle(article);

    // Stage 5: SEO
    await updateQueueStatus(item.id, 'seo');
    const seoResult = await optimizeSEO(article, item.target_keywords || '');
    article = seoResult.article;

    // Stage 6: Meta
    await updateQueueStatus(item.id, 'meta');
    const meta = await generateMeta(item.title, seoResult.metaDescription);

    // Stage 7: Publish
    await updateQueueStatus(item.id, 'publishing');
    const articleId = await publishArticle(item, article, meta);

    // Done!
    const duration = Math.round((Date.now() - startTime) / 1000);
    await updateQueueStatus(item.id, 'published', {
      insight_id: articleId,
      completed_at: new Date().toISOString(),
    });

    console.log(`\n🎉 ══════════════════════════════════════════════════════`);
    console.log(`🎉 PUBLISHED: "${item.title}"`);
    console.log(`🎉 Duration: ${duration}s | Article ID: ${articleId}`);
    console.log(`🎉 ══════════════════════════════════════════════════════\n`);

    return true;

  } catch (err: any) {
    console.error(`\n❌ FAILED: ${err.message}`);
    await updateQueueStatus(item.id, 'failed', {
      error_message: err.message.slice(0, 500),
      retry_count: (item.retry_count || 0) + 1,
    });
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log('\n🏭 ══════════════════════════════════════════════════════════════');
  console.log('🏭  STANDALONE INSIGHTS ENGINE — NO UI, NO HTTP, PURE BACKEND');
  console.log('🏭 ══════════════════════════════════════════════════════════════\n');

  const stats = await getQueueStats();
  console.log('📊 Queue Status:');
  console.log(`   • Queued:    ${stats.queued}`);
  console.log(`   • Published: ${stats.published}`);
  console.log(`   • Failed:    ${stats.failed}`);
  console.log(`   • Total:     ${stats.total}`);
  console.log('');

  if (stats.queued === 0) {
    console.log('✅ Queue empty! Nothing to process.');
    return;
  }

  console.log(`🚀 Starting to process ${stats.queued} articles...`);
  console.log(`   Estimated time: ${Math.round(stats.queued * 3 / 60)} hours\n`);

  let processed = 0;
  let failed = 0;

  while (true) {
    const item = await getNextQueuedItem();
    if (!item) {
      console.log('\n✅ Queue empty! All done.');
      break;
    }

    const success = await processQueueItem(item);
    if (success) processed++;
    else failed++;

    // Brief pause between items
    await new Promise(r => setTimeout(r, 2000));

    // Progress update
    const remaining = await getQueueStats();
    console.log(`📊 Progress: ${processed} done, ${failed} failed, ${remaining.queued} remaining\n`);
  }

  console.log('\n🏁 ══════════════════════════════════════════════════════════════');
  console.log(`🏁  ENGINE COMPLETE`);
  console.log(`🏁  Processed: ${processed} | Failed: ${failed}`);
  console.log('🏁 ══════════════════════════════════════════════════════════════\n');
}

// Run
main().catch(console.error);
