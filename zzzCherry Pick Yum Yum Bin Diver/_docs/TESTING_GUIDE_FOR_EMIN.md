# 🧪 TESTING GUIDE FOR EMIN WANKA

**Project**: AI Content Pipeline (9 Stages)  
**Your Role**: QA Engineer + SEO Expert  
**Mission**: Test every stage end-to-end and ensure 100% functionality  
**Status**: READY FOR TESTING  
**Date**: January 23, 2026

---

## 📋 YOUR MISSION

You need to **test every single piece** of this AI content pipeline. This is a **world-class enterprise system** that generates SEO-optimized articles automatically. Your job is to make sure it **works perfectly**.

---

## 🚀 SETUP INSTRUCTIONS

### **Step 1: Pull the Latest Code**

```bash
# Navigate to project directory
cd ~/Desktop/Dev\ Projects/bpoc-stepten

# Check current branch
git status

# Pull latest changes from main
git pull origin main

# OR if you want to test on a separate branch first
git checkout -b test/ai-pipeline-emin
git pull origin main
```

### **Step 2: Install Dependencies**

```bash
# Install any new dependencies
npm install

# Verify these packages are installed
npm list @anthropic-ai/sdk     # Should show v0.60.0
npm list marked                 # Should show latest
npm list @types/marked          # Should show latest
```

### **Step 3: Verify Environment Variables**

Open `.env.local` and make sure these API keys exist:

```env
# Required API Keys
CLAUDE_API_KEY=sk-ant-...          # Anthropic (Claude Opus 4 + Sonnet 4)
GROK_API_KEY=xai-...                # xAI (Grok for humanization)
OPENAI_API_KEY=sk-...               # OpenAI (GPT-4o + DALL-E 3 + embeddings)
PERPLEXITY_API_KEY=pplx-...         # Perplexity AI (research)
SERPER_API_KEY=...                  # Serper (Google search)
GOOGLE_GENERATIVE_AI_API_KEY=...    # Google (Imagen 3)
RUNWAY_API_KEY=...                  # Runway (video generation)
SUPABASE_SERVICE_ROLE_KEY=...       # Supabase (database)
NEXT_PUBLIC_SUPABASE_URL=...        # Supabase URL
NEXT_PUBLIC_APP_URL=http://localhost:3001  # Your local dev URL
```

**ACTION**: If any keys are missing, ask Stephen for them.

### **Step 4: Run Database Migration**

**IMPORTANT**: The new SEO tables need to be created in Supabase.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Open this file: `supabase/migrations/20260123_create_seo_tables.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run**
7. Verify you see: ✅ Success message

**Tables created**:
- `article_embeddings` (for semantic search)
- `article_links` (for internal linking)
- `targeted_keywords` (for cannibalization prevention)
- `humanization_patterns` (for AI learning)

### **Step 5: Start Development Server**

```bash
# Start Next.js dev server
npm run dev

# Should start on http://localhost:3001
# Keep this terminal open
```

---

## 🧪 TESTING CHECKLIST

### **TEST 1: Master Orchestrator (Full Pipeline)**

**Purpose**: Test all 9 stages running automatically end-to-end.

**API Endpoint**: `POST /api/admin/insights/pipeline/orchestrate`

**Test Command** (from a new terminal):

```bash
curl -X POST http://localhost:3001/api/admin/insights/pipeline/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "brief": "Write a comprehensive guide about BPO call center training programs in the Philippines for 2026. Focus on onboarding best practices, compliance requirements, and technology tools used by top BPO companies.",
    "autoPublish": false,
    "forcePublish": false
  }'
```

**Expected Duration**: 3-10 minutes

**What to Watch For**:

Check the dev server terminal. You should see:

```
🚀 MASTER ORCHESTRATOR STARTED
📝 Brief: Write a comprehensive guide about BPO call center...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 STAGE 2: RESEARCH (Perplexity + Serper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ STAGE 2 COMPLETE (8.2s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 STAGE 3: PLAN GENERATION (Claude Opus 4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ STAGE 3 COMPLETE (12.5s)

... (continues for all stages)

════════════════════════════════════════════════════════════
🎉 PIPELINE COMPLETE!
════════════════════════════════════════════════════════════
⏱️  Total time: 182.3s
📄 Article: BPO Call Center Training Programs...
🔗 URL: /insights/bpo-call-center-training-programs-2026
📊 Quality: 87/100
🎯 RankMath: 92/100
✅ Status: review
════════════════════════════════════════════════════════════
```

**Success Criteria**:
- [ ] All 9 stages complete without errors
- [ ] Total time < 15 minutes
- [ ] Article URL returned
- [ ] Quality score ≥ 80/100
- [ ] RankMath score ≥ 80/100
- [ ] Status = "review" (since autoPublish was false)

**Response JSON** (saved to a file):

```bash
# Save the response to a file
curl -X POST http://localhost:3001/api/admin/insights/pipeline/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "brief": "Write a comprehensive guide about BPO call center training programs in the Philippines for 2026. Focus on onboarding best practices, compliance requirements, and technology tools used by top BPO companies.",
    "autoPublish": false,
    "forcePublish": false
  }' > test_results/orchestrator_test1.json
```

**Inspect the response**:

```bash
cat test_results/orchestrator_test1.json | jq '.'
```

**What to check**:
- `success: true`
- `article.id` exists
- `article.slug` exists
- `article.url` exists
- `quality.score` ≥ 80
- `quality.passed` = true (or false with warnings listed)
- `stages` all show `true`

---

### **TEST 2: Stage 2 - Research (Perplexity + Serper)**

**Purpose**: Test research capabilities independently.

**API Endpoint**: `POST /api/admin/insights/pipeline/research`

**Test Command**:

```bash
curl -X POST http://localhost:3001/api/admin/insights/pipeline/research \
  -H "Content-Type: application/json" \
  -d '{
    "brief": "BPO outsourcing to Philippines vs India comparison",
    "pipelineId": null
  }' | jq '.' > test_results/stage2_research.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `research.perplexity` exists with:
  - `uniqueAngles` (array)
  - `contentGaps` (array)
  - `socialContext` (Reddit/Medium/LinkedIn insights)
- [ ] `research.serper` exists with:
  - `competitors` (array of top 10 results)
  - `validatedLinks` (1-3 high-authority links)
  - Domain authority estimates
- [ ] `processingTime` < 30 seconds

**What to inspect**:

```bash
cat test_results/stage2_research.json | jq '.research.serper.competitors[0]'
# Should show: { title, url, snippet, estimatedDA, domainType }

cat test_results/stage2_research.json | jq '.research.perplexity.uniqueAngles'
# Should show array of unique content angles
```

---

### **TEST 3: Stage 3 - Plan Generation (Claude Opus 4)**

**Purpose**: Test comprehensive content planning.

**Prerequisite**: Use research data from Test 2.

**Test Command**:

```bash
# First, extract research from Test 2
RESEARCH=$(cat test_results/stage2_research.json | jq '.research')

# Then generate plan
curl -X POST http://localhost:3001/api/admin/insights/pipeline/generate-plan \
  -H "Content-Type: application/json" \
  -d "{
    \"brief\": \"BPO outsourcing to Philippines vs India comparison\",
    \"research\": $RESEARCH,
    \"pipelineId\": null
  }" | jq '.' > test_results/stage3_plan.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `plan.title` exists (compelling H1)
- [ ] `plan.keywords.main` exists (array of 5-10 keywords)
- [ ] `plan.keywords.cluster` exists (5-10 related keywords)
- [ ] `plan.keywords.semantic` exists (LSI keywords)
- [ ] `plan.structure.sections` exists (array of H2s with H3s)
- [ ] `plan.competitorAnalysis.topCompetitors` exists
- [ ] `plan.competitorAnalysis.recommendedWordCount` > 1500
- [ ] `plan.linkStrategy.outboundLinks` exists (1-3 links with anchor text)
- [ ] `plan.seoChecklist` has RankMath 100/100 criteria
- [ ] `plan.writingInstructions` includes plagiarism avoidance
- [ ] `plan.ateYnaGuidelines` exists (personality instructions)

**What to inspect**:

```bash
# View the content structure
cat test_results/stage3_plan.json | jq '.plan.structure'

# View keyword strategy
cat test_results/stage3_plan.json | jq '.plan.keywords'

# View competitor analysis
cat test_results/stage3_plan.json | jq '.plan.competitorAnalysis'
```

---

### **TEST 4: Stage 4 - Write Article (Claude Opus 4)**

**Purpose**: Test article writing with Ate Yna personality.

**Prerequisite**: Use plan from Test 3.

**Test Command**:

```bash
# Extract plan from Test 3
PLAN=$(cat test_results/stage3_plan.json | jq '.plan')
RESEARCH=$(cat test_results/stage2_research.json | jq '.research')

# Write article
curl -X POST http://localhost:3001/api/admin/insights/pipeline/write-article \
  -H "Content-Type: application/json" \
  -d "{
    \"plan\": $PLAN,
    \"research\": $RESEARCH,
    \"brief\": \"BPO outsourcing to Philippines vs India comparison\",
    \"pipelineId\": null
  }" | jq '.' > test_results/stage4_article.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `article` exists (markdown format)
- [ ] `htmlArticle` exists (rendered HTML)
- [ ] `qualityMetrics.wordCount` ≥ 1500
- [ ] `qualityMetrics.keywordDensity` between 0.01-0.03 (1-3%)
- [ ] `qualityMetrics.internalLinksCount` ≥ 3
- [ ] `qualityMetrics.outboundLinksCount` ≥ 2
- [ ] `qualityMetrics.seoScore` ≥ 70
- [ ] Article includes Ate Yna personality traits:
  - Filipino expressions ("Diba?", "Kasi", "Para sa")
  - Conversational tone
  - Personal anecdotes
  - Warm, supportive voice

**What to inspect**:

```bash
# View the article (first 1000 chars)
cat test_results/stage4_article.json | jq -r '.article' | head -c 1000

# View quality metrics
cat test_results/stage4_article.json | jq '.qualityMetrics'

# Check for link highlighting in HTML
cat test_results/stage4_article.json | jq -r '.htmlArticle' | grep -E '🔗|➜'
# Should find blue 🔗 for outbound, green ➜ for internal
```

---

### **TEST 5: Stage 5 - Humanize (Grok)**

**Purpose**: Test AI detection bypass and humanization.

**Prerequisite**: Use article from Test 4.

**Test Command**:

```bash
# Extract article and title from Test 4
ARTICLE=$(cat test_results/stage4_article.json | jq -r '.article')
TITLE=$(cat test_results/stage3_plan.json | jq -r '.plan.title')

# Humanize
curl -X POST http://localhost:3001/api/admin/insights/pipeline/humanize \
  -H "Content-Type: application/json" \
  -d "{
    \"article\": $(echo "$ARTICLE" | jq -Rs .),
    \"title\": \"$TITLE\",
    \"pipelineId\": null
  }" | jq '.' > test_results/stage5_humanize.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `humanizedArticle` exists (different from original)
- [ ] `changes` array exists (list of modifications)
- [ ] `aiDetection.before` > 70 (high AI detection)
- [ ] `aiDetection.after` < 15 (low AI detection - 92%+ human)
- [ ] `patterns` array exists (AI patterns identified)
- [ ] `humanizationNotes` explains approach

**What to inspect**:

```bash
# View AI detection scores
cat test_results/stage5_humanize.json | jq '.aiDetection'
# Should show: { before: 85, after: 8, improvement: 77 }

# View changes made
cat test_results/stage5_humanize.json | jq '.changes[0:3]'
# Should show first 3 changes with reasons

# View patterns identified
cat test_results/stage5_humanize.json | jq '.patterns'
# Should list AI writing patterns found
```

**Manual Check**: Compare original vs humanized:

```bash
# Save both versions
cat test_results/stage4_article.json | jq -r '.article' > test_results/original.md
cat test_results/stage5_humanize.json | jq -r '.humanizedArticle' > test_results/humanized.md

# Use diff to see changes
diff test_results/original.md test_results/humanized.md | head -50
```

---

### **TEST 6: Stage 6 - SEO Optimization (Claude Sonnet 4)**

**Purpose**: Test vector embeddings, internal linking, and RankMath scoring.

**Prerequisite**: Use humanized article from Test 5.

**Test Command**:

```bash
# Extract data from previous tests
ARTICLE=$(cat test_results/stage5_humanize.json | jq -r '.humanizedArticle')
TITLE=$(cat test_results/stage3_plan.json | jq -r '.plan.title')
KEYWORDS=$(cat test_results/stage3_plan.json | jq '.plan.keywords.main')
PLAN=$(cat test_results/stage3_plan.json | jq '.plan')

# SEO optimize
curl -X POST http://localhost:3001/api/admin/insights/pipeline/seo-optimize \
  -H "Content-Type: application/json" \
  -d "{
    \"article\": $(echo "$ARTICLE" | jq -Rs .),
    \"title\": \"$TITLE\",
    \"keywords\": $KEYWORDS,
    \"plan\": $PLAN,
    \"pipelineId\": null
  }" | jq '.' > test_results/stage6_seo.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `optimizedArticle` exists (with internal links inserted)
- [ ] `metadata.cannibalizationWarnings` exists (empty or with warnings)
- [ ] `metadata.internalLinkSuggestions` exists (array of 5-15 suggestions)
- [ ] Link suggestions have categories: "parent", "child", "sibling", "cross-silo"
- [ ] `metadata.seoAnalysis` exists with:
  - `keywordDensity` between 0.005-0.025
  - `primaryKeywordInFirstParagraph` = true
  - `primaryKeywordInH1` = true
  - `readabilityScore` ≥ 50
- [ ] `metadata.rankMathScore.total` ≥ 80/100
- [ ] `metadata.rankMathScore.breakdown` shows all 12 criteria
- [ ] `metadata.orphanArticles` exists (list of articles with no incoming links)
- [ ] `metadata.embeddingsGenerated` ≥ 3 (chunked embeddings)

**What to inspect**:

```bash
# View RankMath score
cat test_results/stage6_seo.json | jq '.metadata.rankMathScore'

# View internal link suggestions
cat test_results/stage6_seo.json | jq '.metadata.internalLinkSuggestions[0:3]'

# View SEO analysis
cat test_results/stage6_seo.json | jq '.metadata.seoAnalysis'

# Check for cannibalization warnings
cat test_results/stage6_seo.json | jq '.metadata.cannibalizationWarnings'
```

**Database Check** (after test):

Go to Supabase → Table Editor:
- Check `article_embeddings` table - should have new entries
- Check `targeted_keywords` table - should have new keywords saved

---

### **TEST 7: Stage 7 - Meta Tags & Schema (GPT-4o)**

**Purpose**: Test meta tag generation and schema markup.

**Prerequisite**: Use optimized article from Test 6.

**Test Command**:

```bash
# Extract data
ARTICLE=$(cat test_results/stage6_seo.json | jq -r '.optimizedArticle')
TITLE=$(cat test_results/stage3_plan.json | jq -r '.plan.title')
KEYWORDS=$(cat test_results/stage3_plan.json | jq '.plan.keywords.main')

# Generate meta
curl -X POST http://localhost:3001/api/admin/insights/pipeline/generate-meta \
  -H "Content-Type: application/json" \
  -d "{
    \"article\": $(echo "$ARTICLE" | jq -Rs .),
    \"title\": \"$TITLE\",
    \"keywords\": $KEYWORDS,
    \"category\": \"BPO & Outsourcing\",
    \"pipelineId\": null
  }" | jq '.' > test_results/stage7_meta.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `meta.metaTitle` exists (50-60 chars)
- [ ] `meta.metaDescription` exists (150-160 chars)
- [ ] `meta.ogTitle`, `meta.ogDescription` exist (Open Graph)
- [ ] `meta.twitterTitle`, `meta.twitterDescription` exist
- [ ] `meta.linkedInTitle`, `meta.linkedInDescription` exist
- [ ] `meta.canonicalUrl` exists (full URL)
- [ ] `meta.canonicalSlug` exists (URL-friendly)
- [ ] `meta.focusKeyword` exists (primary keyword)
- [ ] `meta.secondaryKeywords` array exists
- [ ] `meta.robots` = "index, follow, max-image-preview:large..."
- [ ] `schema.article` exists (Article schema.org)
- [ ] `schema.breadcrumb` exists (Breadcrumb schema)
- [ ] `schema.organization` exists (BPOC Careers)
- [ ] `schema.website` exists (SearchAction)
- [ ] `schema.faq` exists if FAQ section found
- [ ] `schema.howTo` exists if steps found
- [ ] `llmCrawling.openaiGPTBot` = "index, follow"
- [ ] `llmCrawling.googleGeminiBot` = "index, follow"
- [ ] `llmCrawling.anthropicClaudeBot` = "index, follow"
- [ ] `validation.warnings` array exists (may be empty)
- [ ] `validation.keywordUnique` = true (or false with conflicts)

**What to inspect**:

```bash
# View meta tags
cat test_results/stage7_meta.json | jq '.meta'

# View schema markup
cat test_results/stage7_meta.json | jq '.schema.article'

# View LLM crawling directives
cat test_results/stage7_meta.json | jq '.llmCrawling'

# View validation results
cat test_results/stage7_meta.json | jq '.validation'
```

**SEO Check**:
- Meta title includes primary keyword? (check)
- Meta description includes keyword + CTA? (check)
- Slug is URL-friendly? (check)
- Schema markup is valid JSON-LD? (check)

---

### **TEST 8: Stage 8 - Media Generation (Runway + Imagen)**

**Purpose**: Test video and image generation.

**⚠️ WARNING**: This stage takes 5-10 minutes and costs money (Runway API).

**Test Command**:

```bash
# Extract data
ARTICLE=$(cat test_results/stage6_seo.json | jq -r '.optimizedArticle')
TITLE=$(cat test_results/stage3_plan.json | jq -r '.plan.title')
KEYWORDS=$(cat test_results/stage3_plan.json | jq '.plan.keywords.main')

# Generate media
curl -X POST http://localhost:3001/api/admin/insights/pipeline/generate-media \
  -H "Content-Type: application/json" \
  -d "{
    \"article\": $(echo "$ARTICLE" | jq -Rs .),
    \"title\": \"$TITLE\",
    \"keywords\": $KEYWORDS,
    \"category\": \"BPO & Outsourcing\",
    \"style\": \"people-focused\",
    \"pipelineId\": null
  }" | jq '.' > test_results/stage8_media.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `video` object exists (if Runway succeeded) OR `video: null` (if failed/skipped)
  - `video.url` is a valid Supabase storage URL
  - `video.provider` = "runway" (or other)
  - `video.duration` = 5-10 seconds
- [ ] `images` array exists (3-5 images)
  - Each image has `url`, `provider`, `alt`, `section`
  - URLs are valid Supabase storage URLs
  - Alt text includes primary keyword
- [ ] `processingTime` < 600 seconds (10 min)

**What to inspect**:

```bash
# View video result
cat test_results/stage8_media.json | jq '.video'

# View images
cat test_results/stage8_media.json | jq '.images'

# Copy URLs and check in browser
cat test_results/stage8_media.json | jq -r '.video.url'
# Paste URL in browser - should play video

cat test_results/stage8_media.json | jq -r '.images[0].url'
# Paste URL in browser - should show image
```

**Manual Checks**:
- [ ] Video shows Filipino professionals in modern office
- [ ] Video is high quality (1080p, smooth motion)
- [ ] Images are photorealistic
- [ ] Images show authentic workplace scenarios
- [ ] No AI artifacts (distorted faces, weird hands, etc.)
- [ ] All media uploaded to Supabase storage

**Database Check**:

Go to Supabase → Storage → `insights`:
- Check `videos/` folder - should have new video file
- Check `images/` folder - should have new image files

---

### **TEST 9: Stage 9 - Finalize & Publish**

**Purpose**: Test quality validation and publishing.

**Prerequisite**: Have a complete pipeline from orchestrator test (Test 1).

**Test Command**:

```bash
# Use the pipelineId from Test 1
PIPELINE_ID="<insert-pipeline-id-from-test-1>"

# Finalize without publishing (review status)
curl -X POST http://localhost:3001/api/admin/insights/pipeline/finalize \
  -H "Content-Type: application/json" \
  -d "{
    \"pipelineId\": \"$PIPELINE_ID\",
    \"forcePublish\": false,
    \"status\": \"review\"
  }" | jq '.' > test_results/stage9_finalize_review.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `article` object exists with:
  - `id`, `slug`, `title`, `url`, `status`, `publishedAt`
- [ ] `quality.score` ≥ 80/100
- [ ] `quality.passed` = true (or false with `blockers` listed)
- [ ] `quality.checks` has 10 checks:
  - `rankMathScore` (passed if ≥ 80)
  - `hasMetaDescription` (150-160 chars)
  - `hasInternalLinks` (3-8 links)
  - `hasOutboundLinks` (2-5 links)
  - `keywordDensity` (0.5-2.5%)
  - `allImagesHaveAlt` (all images have alt text)
  - `hasHeroMedia` (video or image)
  - `hasValidSchema` (schema markup exists)
  - `noTODOMarkers` (no TODO/PLACEHOLDER in content)
  - `minWordCount` (≥ 1000 words)
- [ ] `quality.warnings` array (suggestions for improvement)
- [ ] `quality.blockers` array (issues preventing publish)

**What to inspect**:

```bash
# View quality checks
cat test_results/stage9_finalize_review.json | jq '.quality.checks'

# View warnings
cat test_results/stage9_finalize_review.json | jq '.quality.warnings'

# View blockers (should be empty if quality passed)
cat test_results/stage9_finalize_review.json | jq '.quality.blockers'

# Get article URL
cat test_results/stage9_finalize_review.json | jq -r '.article.url'
```

**Database Check**:

Go to Supabase → Table Editor → `insights_posts`:
- Find the article by slug
- Check `is_published` = false (review status)
- Check `pipeline_stage` = "review"
- Check `generation_metadata` has all stage data

Go to `content_pipelines`:
- Find pipeline by ID
- Check `status` = "completed"
- Check `current_stage` = 9
- Check `quality_score` ≥ 80

**Now test actual publishing**:

```bash
# Publish the article
curl -X POST http://localhost:3001/api/admin/insights/pipeline/finalize \
  -H "Content-Type: application/json" \
  -d "{
    \"pipelineId\": \"$PIPELINE_ID\",
    \"forcePublish\": false,
    \"status\": \"published\"
  }" | jq '.' > test_results/stage9_finalize_publish.json
```

**Success Criteria**:
- [ ] `article.status` = "published"
- [ ] `article.publishedAt` has timestamp
- [ ] Article appears in Supabase `insights_posts` with `is_published` = true

**Visit the article**:

```bash
# Get URL and open in browser
URL=$(cat test_results/stage9_finalize_publish.json | jq -r '.article.url')
echo "Article URL: http://localhost:3001$URL"
# Open in browser and verify it renders correctly
```

---

### **TEST 10: CMS - List Articles**

**Purpose**: Test article listing API.

**Test Command**:

```bash
# Get all articles (page 1)
curl "http://localhost:3001/api/admin/insights/pipeline/list?page=1&limit=20" | jq '.' > test_results/cms_list_all.json

# Get published only
curl "http://localhost:3001/api/admin/insights/pipeline/list?isPublished=true" | jq '.' > test_results/cms_list_published.json

# Get drafts only
curl "http://localhost:3001/api/admin/insights/pipeline/list?status=draft" | jq '.' > test_results/cms_list_drafts.json

# Search by keyword
curl "http://localhost:3001/api/admin/insights/pipeline/list?search=BPO" | jq '.' > test_results/cms_list_search.json

# Sort by quality score
curl "http://localhost:3001/api/admin/insights/pipeline/list?sortBy=generation_metadata&sortOrder=desc" | jq '.' > test_results/cms_list_sorted.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `articles` array exists
- [ ] `pagination` object exists with:
  - `page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrev`
- [ ] Each article has:
  - `id`, `title`, `slug`, `description`, `category`, `author`
  - `is_published`, `pipeline_stage`, `published_at`, `created_at`
  - `url`, `editUrl`, `qualityScore`, `rankMathScore`
  - `internalLinks`, `outboundLinks`, `read_time_minutes`

**What to inspect**:

```bash
# View pagination
cat test_results/cms_list_all.json | jq '.pagination'

# View first 3 articles
cat test_results/cms_list_all.json | jq '.articles[0:3]'

# Count total articles
cat test_results/cms_list_all.json | jq '.pagination.total'
```

---

### **TEST 11: CMS - Dashboard Stats**

**Purpose**: Test dashboard statistics API.

**Test Command**:

```bash
curl "http://localhost:3001/api/admin/insights/pipeline/stats" | jq '.' > test_results/cms_stats.json
```

**Success Criteria**:
- [ ] `success: true`
- [ ] `stats.articles` exists with:
  - `total`, `published`, `draft`, `review`, `archived`
- [ ] `stats.pipelines` exists with:
  - `total`, `inProgress`, `completed`, `failed`, `avgQualityScore`
- [ ] `stats.quality` exists with:
  - `avgQualityScore`, `avgRankMathScore`, `articlesAbove80`, `articlesBelow80`
- [ ] `stats.categories` array (top 10 categories)
- [ ] `stats.recentActivity` exists with:
  - `articles` (last 10 created)
  - `pipelines` (last 10 created)
- [ ] `stats.seo` exists with:
  - `articlesWithInternalLinks`, `articlesWithOutboundLinks`, `articlesWithMetaDescription`
  - Percentages for each
- [ ] `stats.orphans` exists with:
  - `count` (number of orphan articles)
  - `articles` (top 5 orphans)
- [ ] `stats.cannibalization` exists with:
  - `totalConflicts` (keyword conflicts)
  - `conflicts` array (top 10 conflicts)
- [ ] `stats.trends` array (last 30 days performance)

**What to inspect**:

```bash
# View article counts
cat test_results/cms_stats.json | jq '.stats.articles'

# View quality metrics
cat test_results/cms_stats.json | jq '.stats.quality'

# View SEO health
cat test_results/cms_stats.json | jq '.stats.seo'

# View orphan articles
cat test_results/cms_stats.json | jq '.stats.orphans'

# View keyword cannibalization
cat test_results/cms_stats.json | jq '.stats.cannibalization'
```

---

## 🔥 ADVANCED TESTS

### **TEST 12: Quality Gate Failures**

**Purpose**: Test that quality checks block publishing when criteria not met.

**Test with poor quality article**:

```bash
# Manually create a bad article in content_pipelines table
# Or use forcePublish to see warnings

curl -X POST http://localhost:3001/api/admin/insights/pipeline/finalize \
  -H "Content-Type: application/json" \
  -d "{
    \"pipelineId\": \"<pipeline-with-low-quality>\",
    \"forcePublish\": false,
    \"status\": \"published\"
  }"
```

**Expected**: Should return `success: false` with `quality.blockers` array listing issues.

**Try force publish**:

```bash
curl -X POST http://localhost:3001/api/admin/insights/pipeline/finalize \
  -H "Content-Type: application/json" \
  -d "{
    \"pipelineId\": \"<pipeline-with-low-quality>\",
    \"forcePublish\": true,
    \"status\": \"published\"
  }"
```

**Expected**: Should succeed despite quality issues.

---

### **TEST 13: Keyword Cannibalization**

**Purpose**: Test that duplicate keywords are detected.

1. Run orchestrator with brief: "BPO call center training"
2. Wait for completion
3. Run orchestrator again with same/similar brief: "BPO call center training programs"
4. Check Stage 6 output for cannibalization warnings

**Expected**:
- Stage 6 should show: `cannibalizationWarnings` with the first article listed
- Stage 7 validation should warn about keyword conflict

---

### **TEST 14: Orphan Article Detection**

**Purpose**: Test orphan detection function.

1. Create an article with no incoming links (run orchestrator once)
2. Check Supabase: `SELECT * FROM detect_orphan_articles();`
3. The new article should appear in orphan list
4. Create a second article (run orchestrator again)
5. Check if second article links to first (via Stage 6 internal linking)
6. Run orphan check again - first article should no longer be orphan

---

### **TEST 15: Vector Semantic Search**

**Purpose**: Test that semantic search finds related articles.

1. Create 3 articles with similar topics:
   - "BPO call center training"
   - "Call center onboarding programs"
   - "BPO employee training best practices"
2. On the 4th article, check Stage 6 internal link suggestions
3. Should show all 3 previous articles as related (high similarity scores)

---

## 🐛 ERROR SCENARIOS TO TEST

### **Scenario 1: API Key Missing**

1. Temporarily remove `CLAUDE_API_KEY` from `.env.local`
2. Run orchestrator
3. **Expected**: Stage 3 (Plan Generation) should fail with clear error message
4. **Check**: Pipeline status in database should be "failed" with error message
5. Restore API key

### **Scenario 2: Invalid Brief (Too Short)**

```bash
curl -X POST http://localhost:3001/api/admin/insights/pipeline/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"brief": "BPO", "autoPublish": false}'
```

**Expected**: `400 Bad Request` with error: "Brief must be at least 50 characters"

### **Scenario 3: Supabase Connection Failure**

1. Temporarily use wrong `SUPABASE_SERVICE_ROLE_KEY`
2. Run orchestrator
3. **Expected**: Database operations should fail with clear error
4. Restore correct key

### **Scenario 4: Media Generation Timeout**

**Expected**: If Runway API times out, video should be `null` but pipeline should continue with images only

---

## 📊 PERFORMANCE BENCHMARKS

Track these metrics for each test:

| Stage | Expected Time | Your Result | Pass/Fail |
|-------|---------------|-------------|-----------|
| Stage 2: Research | < 15s | ___ | ___ |
| Stage 3: Plan | < 20s | ___ | ___ |
| Stage 4: Write | < 60s | ___ | ___ |
| Stage 5: Humanize | < 30s | ___ | ___ |
| Stage 6: SEO | < 30s | ___ | ___ |
| Stage 7: Meta | < 10s | ___ | ___ |
| Stage 8: Media | < 600s | ___ | ___ |
| Stage 9: Finalize | < 15s | ___ | ___ |
| **TOTAL** | **< 780s (13 min)** | ___ | ___ |

---

## ✅ FINAL CHECKLIST

Before marking as "TESTED AND APPROVED":

- [ ] All 15 tests completed successfully
- [ ] All test results saved to `test_results/` folder
- [ ] Database migration applied successfully
- [ ] All quality gates pass (≥ 80/100)
- [ ] RankMath scores ≥ 80/100
- [ ] AI detection scores < 15% (92%+ human)
- [ ] Vector embeddings stored in database
- [ ] Internal links categorized correctly (parent/child/sibling/cross-silo)
- [ ] Keyword cannibalization detection works
- [ ] Orphan article detection works
- [ ] Schema markup validates (use https://validator.schema.org)
- [ ] Meta tags within character limits (50-60 for title, 150-160 for description)
- [ ] Media uploads to Supabase storage
- [ ] All 10 quality checks in Stage 9 work
- [ ] CMS listing and stats APIs work
- [ ] Error scenarios handled gracefully
- [ ] Performance benchmarks met

---

## 🎯 DELIVERABLES

Create these documents after testing:

1. **`TEST_RESULTS_SUMMARY.md`** - Overview of all test results
2. **`BUGS_FOUND.md`** - List any issues discovered (if any)
3. **`PERFORMANCE_REPORT.md`** - Timing results for each stage
4. **`SEO_AUDIT.md`** - Analysis of SEO quality (covered in next doc)

---

## 🚨 IF SOMETHING BREAKS

1. **Check the dev server terminal** - Look for error stack traces
2. **Check test result JSON** - Look for `success: false` and `error` messages
3. **Check Supabase logs** - Database → Logs
4. **Check API key validity** - Make sure all keys in `.env.local` are active
5. **Create GitHub issue** with:
   - Test number that failed
   - Error message
   - Test command used
   - Expected vs actual result

---

## 📞 CONTACT

**If you get stuck**: Message Stephen immediately

**Required expertise**:
- Understanding of REST APIs (curl, JSON)
- Basic terminal/command line skills
- Understanding of SEO concepts (RankMath, keywords, meta tags, schema)
- Ability to read JSON responses
- Database query knowledge (Supabase SQL editor)

---

**Good luck, Emin! Make this pipeline shine.** 🚀

**Expected total testing time**: 4-6 hours (including documentation)

**Let's make this the BOMB.** 💣
