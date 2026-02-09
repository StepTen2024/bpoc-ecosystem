#!/usr/bin/env npx tsx
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env manually into a local object
const env: Record<string, string> = {};
const envPath = resolve(__dirname, '../.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.startsWith('#')) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
const perplexityKey = env.PERPLEXITY_API_KEY;
const grokKey = env.XAI_API_KEY;

async function getNext() {
  const { data } = await supabase.from('insights_production_queue').select('*').eq('status', 'queued').order('priority', { ascending: false }).order('created_at', { ascending: true }).limit(1).single();
  return data;
}

async function update(id: string, status: string, extra: any = {}) {
  await supabase.from('insights_production_queue').update({ status, updated_at: new Date().toISOString(), ...extra }).eq('id', id);
}

async function research(topic: string, kw: string) {
  if (!perplexityKey) return '';
  try {
    const r = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${perplexityKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: `Research "${topic}" keywords: ${kw}. Philippine BPO context. Stats, trends, companies, PHP salaries.` }] })
    });
    const d = await r.json();
    return d.choices?.[0]?.message?.content || '';
  } catch { return ''; }
}

async function plan(topic: string, res: string, level: string) {
  const wc = level === 'PILLAR' ? '3500' : '2000';
  const r = await anthropic.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: `Outline for "${topic}". Research: ${res}. ${wc} words. Filipino BPO workers. PHP salaries. Real companies. Return: title, H2 sections, key points.` }] });
  return r.content[0].type === 'text' ? r.content[0].text : '';
}

async function write(topic: string, outline: string, level: string) {
  const wc = level === 'PILLAR' ? '3500' : '2000';
  const r = await anthropic.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: 8000, messages: [{ role: 'user', content: `Write article from outline:\n${outline}\n\nAs "Ate Yna" Filipino career coach. ${wc} words. Filipino-English tone. Philippine examples. PHP salaries. Real BPO companies. Markdown H2/H3. Practical advice.` }] });
  return r.content[0].type === 'text' ? r.content[0].text : '';
}

async function humanize(article: string) {
  if (!grokKey) return article;
  try {
    const r = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST', headers: { 'Authorization': `Bearer ${grokKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'grok-3-fast', max_tokens: 8000, messages: [{ role: 'user', content: `Humanize this article. Natural, conversational. Keep Filipino-English tone. Same structure.\n\n${article}` }] })
    });
    const d = await r.json();
    return d.choices?.[0]?.message?.content || article;
  } catch { return article; }
}

async function publish(item: any, article: string) {
  const title = article.match(/^#\s*(.+)$/m)?.[1] || item.title;
  const { data, error } = await supabase.from('insights_posts').insert({
    title, slug: item.slug, content: article, category: item.silo_name || 'BPO', silo_topic: item.silo_name, silo_id: item.silo_id,
    is_published: true, published_at: new Date().toISOString(), is_pillar: item.level === 'PILLAR',
    author: 'ate-yna', author_name: 'Ate Yna', author_slug: 'ate-yna', read_time: Math.ceil(article.split(/\s+/).length / 200),
    meta_description: article.substring(0, 160).replace(/[#*]/g, '').trim()
  }).select('id').single();
  if (error) throw error;
  return data.id;
}

async function process(item: any) {
  const start = Date.now();
  console.log(`\n[${new Date().toISOString()}] "${item.title}"`);
  try {
    await update(item.id, 'research');
    const res = await research(item.title, item.target_keywords || '');
    await update(item.id, 'planning');
    const outline = await plan(item.title, res, item.level);
    await update(item.id, 'writing');
    let article = await write(item.title, outline, item.level);
    await update(item.id, 'humanizing');
    article = await humanize(article);
    await update(item.id, 'publishing');
    const id = await publish(item, article);
    await update(item.id, 'published', { insight_id: id, completed_at: new Date().toISOString() });
    console.log(`✓ ${Math.round((Date.now()-start)/1000)}s`);
    return true;
  } catch (e: any) {
    console.log(`✗ ${e.message}`);
    await update(item.id, 'failed', { error_message: e.message.slice(0,500), retry_count: (item.retry_count||0)+1 });
    return false;
  }
}

async function main() {
  console.log('Content Engine Started');
  let done = 0, fail = 0;
  while (true) {
    const item = await getNext();
    if (!item) break;
    (await process(item)) ? done++ : fail++;
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`\nDone: ${done} | Failed: ${fail}`);
}

main();
