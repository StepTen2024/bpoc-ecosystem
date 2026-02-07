# 🚀 INSIGHTS CONTENT PIPELINE - COMPLETE REBUILD PLAN

**Status**: IN PROGRESS  
**Started**: 2026-01-23 5:00 AM  
**Goal**: World-class SEO content pipeline with proper AI model usage, state management, and validation

---

## 📊 PIPELINE STAGES OVERVIEW

| Stage | Current Model | New Model | Priority | Status |
|-------|--------------|-----------|----------|--------|
| 1. Brief (Wispr) | N/A | N/A | ✅ Done | Complete |
| 2. Research | Serper + Labor Law | **Perplexity + Serper** | ✅ Done | Complete |
| 3. Plan | GPT-4o | **Claude Opus 4** | 🔥 HIGH | TODO |
| 4. Write | GPT-4o | **Claude Opus 4** | 🔥 HIGH | TODO |
| 5. Humanize | N/A | **Grok** | 🔥 HIGH | TODO |
| 6. SEO Optimize | GPT-4o | **Claude Sonnet 4** | 🔥 HIGH | TODO |
| 7. Meta Tags | GPT-4o | **GPT-4o** | 🔥 MEDIUM | TODO |
| 8. Media Gen | Imagen | **Research VO** | 🔥 MEDIUM | TODO |
| 9. Publish | Basic | **Full CMS** | 🔥 MEDIUM | TODO |

---

## 🎯 STAGE 3: PLAN GENERATION (Priority 1)

### Current Issues:
- ❌ Uses GPT-4o (not good for planning)
- ❌ Doesn't analyze competitor word counts
- ❌ No keyword clustering
- ❌ No semantic keyword variations
- ❌ Missing outbound link anchor text strategy
- ❌ No SEO scoring (RankMath/SEMrush/Moz style)
- ❌ Doesn't consider plagiarism avoidance
- ❌ No LLM crawling optimization

### What Needs to Be Built:
1. **Switch to Claude Opus 4** (best for planning)
2. **Competitor Analysis**:
   - Analyze top 10 competitors from Stage 2 research
   - Extract their word counts
   - Determine optimal word count (beat top 3 by 10-20%)
3. **Keyword Strategy**:
   - Main target keyword (from silo/brief)
   - Keyword cluster (5-10 related keywords from research)
   - Semantic variations (LSI keywords, synonyms)
4. **Content Structure**:
   - H1 (includes main keyword)
   - H2s (include keyword variations)
   - H3s (semantic keywords)
   - Suggested subheadings based on competitor gaps
5. **Link Strategy**:
   - Outbound links (1-3 based on word count)
   - Anchor text suggestions for each link
   - Internal link opportunities (2-5)
6. **SEO Checklist**:
   - Keyword in first paragraph
   - Keyword in H1, at least 2 H2s
   - Meta description includes keyword
   - Alt text strategy for images
   - Schema markup recommendations
7. **Writing Instructions**:
   - Avoid AI detection patterns
   - Plagiarism avoidance techniques
   - Unique angles to take
   - Ate Yna personality guidelines
8. **RankMath 100/100 Criteria**:
   - Content length score
   - Keyword density (0.5-2.5%)
   - Internal links (2-5)
   - Outbound links (1-3)
   - Image alt text
   - Readability score target
   - FAQ schema
   - Table of contents

### API Changes:
```typescript
// New request body
{
  topic: string,
  focusKeyword: string,
  siloTopic: string,
  research: object, // From Stage 2
  originalBrief: string,
  selectedIdea: object,
  competitors: array, // Top 10 from research
}

// New response
{
  plan: {
    targetWordCount: number,
    competitorAnalysis: {
      averageWordCount: number,
      topCompetitorCounts: [2500, 2800, 3200],
      recommendedCount: 3500,
      reasoning: "..."
    },
    keywords: {
      main: "work life balance bpo",
      cluster: ["bpo work schedule", "call center wellness", ...],
      semantic: ["workplace balance", "job satisfaction", ...]
    },
    structure: {
      h1: "...",
      sections: [
        {
          h2: "...",
          h3s: ["...", "..."],
          keywords: ["...", "..."],
          estimatedWords: 400
        }
      ],
      faq: [...],
      conclusion: "..."
    },
    linkStrategy: {
      outbound: [
        {
          url: "https://example.edu/...",
          anchorText: "workplace wellness research",
          placement: "section 2",
          reason: "..."
        }
      ],
      internal: [...]
    },
    seoChecklist: {
      keywordInFirstPara: true,
      keywordInH1: true,
      keywordDensity: "1.2%",
      readabilityTarget: "8th grade",
      ...
    },
    writingInstructions: {
      plagiarismAvoidance: "...",
      aiDetectionAvoidance: "...",
      uniqueAngles: [...],
      ateYnaPersonality: "..."
    },
    rankMathScore: {
      expectedScore: 95,
      keyMetrics: {...}
    }
  }
}
```

---

## 🎯 STAGE 4: WRITE ARTICLE (Priority 2)

### Current Issues:
- ❌ Uses GPT-4o (not good for long-form writing)
- ❌ Ate Yna personality not fully embedded
- ❌ Output is just markdown (needs HTML rendering)
- ❌ Quality issues reported

### What Needs to Be Built:
1. **Switch to Claude Opus 4** (best for writing)
2. **Enhanced Ate Yna Integration**:
   - Load full personality profile from database
   - Include her background, experiences, writing style
   - Feed brief + research + plan + personality → Claude
3. **Writing Prompt**:
   - Include plagiarism avoidance instructions
   - AI detection avoidance patterns
   - Unique angle from research
   - Keyword placement from plan
   - Link anchor text from plan
4. **Output Format**:
   - Markdown + HTML hybrid
   - Proper heading tags
   - Styled tables
   - Highlighted links (outbound in blue, internal in green)
   - Callout boxes with icons
5. **Quality Checks**:
   - Word count matches plan (±10%)
   - All keywords included
   - Links properly placed
   - FAQ section present
   - Readability score

### API Changes:
```typescript
// Request
{
  plan: object,
  research: object,
  personalityId: string, // Ate Yna profile ID
  originalBrief: string
}

// Response
{
  article: {
    markdown: "...",
    html: "...", // With styling
    wordCount: 3500,
    keywordDensity: 1.2,
    links: {
      outbound: 2,
      internal: 4
    },
    qualityScore: {
      readability: 8.2,
      seoScore: 92,
      uniqueness: 98
    }
  }
}
```

---

## 🎯 STAGE 5: HUMANIZE (Grok) (Priority 3)

### Current Issues:
- ❌ Not implemented yet

### What Needs to Be Built:
1. **Grok Integration** (xAI API)
2. **Humanization Prompt**:
   - Feed Ate Yna personality
   - "You ARE Ate Yna, analyze this article YOU wrote"
   - Bypass AI detection patterns
   - Add human imperfections (not too many)
   - Emotional touch
3. **Output Format**:
   - Original article (tab 1)
   - Humanized article (tab 2)
   - Changes made (tab 3) with reasoning
   - AI detection score (before/after)
4. **Pattern Database**:
   - Store patterns that trigger AI detection
   - Store humanization techniques
   - Build knowledge base for future improvements

### API Changes:
```typescript
// Request
{
  article: string,
  personalityId: string
}

// Response
{
  original: string,
  humanized: string,
  changes: [
    {
      section: "Introduction",
      original: "...",
      humanized: "...",
      reason: "Removed repetitive structure pattern",
      pattern: "too_perfect_grammar"
    }
  ],
  aiDetection: {
    beforeScore: 0.85, // 85% detected as AI
    afterScore: 0.08,  // 8% detected as AI (92% human)
    improvement: "77% more human"
  },
  plagiarismScore: 0.02 // 98% unique
}
```

---

## 🎯 STAGE 6: SEO OPTIMIZATION (Priority 4)

### Current Issues:
- ❌ Not comprehensive enough
- ❌ Missing RankMath 100/100 criteria
- ❌ No internal linking database
- ❌ No vector embeddings for semantic relationships
- ❌ No cannibalization check

### What Needs to Be Built:
1. **RankMath 100/100 Checklist**:
   - ✅ Keyword in H1
   - ✅ Keyword in first paragraph
   - ✅ Keyword in meta description
   - ✅ Keyword density 0.5-2.5%
   - ✅ At least 1 outbound link
   - ✅ At least 2 internal links
   - ✅ Image alt text with keywords
   - ✅ FAQ schema
   - ✅ Article length ≥1500 words
   - ✅ Readability score
2. **Internal Linking System**:
   - Vector embeddings for all articles
   - Chunk articles (500 words each)
   - Store in `article_embeddings` table
   - Semantic search for related articles
   - 4-way linking strategy:
     - Parent topic (link up)
     - Child topics (link down)
     - Sibling topics (link sideways)
     - Related silos (link across)
3. **Cannibalization Check**:
   - Check if keyword already targeted
   - Suggest alternative keyword variations
   - Warn if similar article exists
4. **Orphan Check**:
   - Ensure at least 1 article links TO this one
   - Suggest where to insert links in existing articles
5. **Link Insertion Opportunities**:
   - Scan existing articles
   - Find places to link to new article
   - Generate anchor text suggestions

### Database Schema Needed:
```sql
-- article_embeddings table
CREATE TABLE article_embeddings (
  id uuid PRIMARY KEY,
  article_id uuid REFERENCES insights_posts(id),
  chunk_index integer,
  content text,
  embedding vector(1536),
  keywords text[],
  created_at timestamp
);

-- article_links table
CREATE TABLE article_links (
  id uuid PRIMARY KEY,
  from_article_id uuid REFERENCES insights_posts(id),
  to_article_id uuid REFERENCES insights_posts(id),
  anchor_text text,
  link_type text, -- 'parent', 'child', 'sibling', 'cross-silo'
  created_at timestamp
);

-- targeted_keywords table
CREATE TABLE targeted_keywords (
  id uuid PRIMARY KEY,
  keyword text UNIQUE,
  article_id uuid REFERENCES insights_posts(id),
  silo text,
  created_at timestamp
);
```

---

## 🎯 STAGE 7: META TAGS (Priority 4)

### What Needs to Be Built:
1. **Schema Markup**:
   - Article schema (always)
   - Organization schema (always)
   - FAQ schema (if FAQs present)
   - HowTo schema (if applicable)
   - Breadcrumb schema
2. **Keyword Uniqueness Check**:
   - Query `targeted_keywords` table
   - Ensure no duplicate targeting
   - Suggest variations if duplicate
3. **robots.txt Validation**:
   - Ensure crawlable
   - Add LLM-specific directives
4. **Rich Snippet Optimization**:
   - Structured data validation
   - Preview how it appears in SERP

---

## 🎯 STAGE 8: MEDIA GENERATION (Priority 4)

### Research Needed:
1. **Google VO** (Video generation via Gemini API)
   - Research Gemini API docs
   - Check if VO is available
   - Pricing/limits
2. **OpenAI Sora**:
   - Check if available via API
   - Pricing/access
3. **Leonardo.ai**:
   - VO access via API?
   - Quality comparison
4. **Runway**:
   - Current fallback
   - Pricing
5. **Higgsfield**:
   - Research if viable

### Image Generation:
- ✅ Currently using Banana API (Imagen)
- Need consistent style guide
- Attach personality/brand style
- Filipino representation
- Office/remote work vibes
- Cinematic vs people-focused
- SEO: Alt text with keywords

---

## 🎯 STAGE 9: PUBLISH (Priority 4)

### What Needs to Be Built:
1. **Status Workflow**:
   - Draft → In Progress → Review → Published → Archived
2. **CMS Features**:
   - Read time calculation
   - Author attribution (Ate Yna)
   - Publish date
   - Last updated date
   - View count
   - SEO score display
3. **Preview System**:
   - Full HTML render
   - Mobile preview
   - SEO preview (SERP snippet)
4. **Publishing**:
   - Generate embeddings
   - Update internal link suggestions
   - Check for orphans
   - Create schema markup
   - Generate sitemap entry

---

## 📦 STATE MANAGEMENT

### Critical Question: Is Progress Being Saved?

Need to verify:
1. **After Brief**: Stored in `content_pipelines.brief`?
2. **After Research**: Stored in `content_pipelines.research`?
3. **After Plan**: Stored in `insights_posts.generation_metadata.plan`?
4. **After Write**: Stored in `insights_posts.content`?
5. **After Humanize**: Stored in `insights_posts.humanized_content`?
6. **After SEO**: Stored in `insights_posts.seo_metadata`?
7. **After Meta**: Stored in `insights_posts` (title, meta, schema)?

### Resume Capability:
- User should be able to go back to any stage
- Data should persist
- "Redo" should load previous state
- "Next" should save current state

---

## 🎯 PRIORITIES

### Phase 1 (CRITICAL - Do First):
1. ✅ Stage 2: Research (DONE)
2. 🔥 Stage 3: Plan (Claude Opus 4, full SEO strategy)
3. 🔥 Stage 4: Write (Claude Opus 4, Ate Yna personality)
4. 🔥 Stage 5: Humanize (Grok, pattern tracking)

### Phase 2 (HIGH - Do Next):
5. 🔥 Stage 6: SEO Optimization (RankMath 100/100, embeddings)
6. 🔥 Stage 7: Meta Tags (Schema, uniqueness)

### Phase 3 (MEDIUM - Do After):
7. 🔥 Stage 8: Media Generation (VO research, styling)
8. 🔥 Stage 9: Publish (CMS features, preview)

---

## 🚀 EXECUTION PLAN

### Step 1: State Management Verification
- [ ] Check if `content_pipelines` table saves each stage
- [ ] Verify `insights_posts.generation_metadata` structure
- [ ] Test resume capability

### Step 2: Rebuild Stage 3 (Plan)
- [ ] Switch to Claude Opus 4
- [ ] Add competitor word count analysis
- [ ] Add keyword clustering logic
- [ ] Add semantic keyword extraction
- [ ] Build link anchor text strategy
- [ ] Add SEO checklist generation
- [ ] Add writing instructions

### Step 3: Rebuild Stage 4 (Write)
- [ ] Switch to Claude Opus 4
- [ ] Enhance Ate Yna personality integration
- [ ] Add HTML rendering
- [ ] Add quality scoring
- [ ] Test output format

### Step 4: Build Stage 5 (Humanize)
- [ ] Integrate Grok API
- [ ] Build comparison view (original vs humanized)
- [ ] Build changes tracker
- [ ] Build pattern database
- [ ] Add AI detection scoring

### Step 5: Rebuild Stage 6 (SEO)
- [ ] Create embeddings database
- [ ] Build semantic search
- [ ] Build 4-way linking strategy
- [ ] Add cannibalization check
- [ ] Add orphan check
- [ ] Generate RankMath report

### Step 6: Enhance Stage 7 (Meta)
- [ ] Add schema markup generation
- [ ] Add keyword uniqueness check
- [ ] Add LLM crawling directives

### Step 7: Research & Build Stage 8 (Media)
- [ ] Research VO APIs (Google/Sora/Leonardo/Runway/Higgsfield)
- [ ] Implement best option
- [ ] Add consistent image styling
- [ ] Add SEO alt text generation

### Step 8: Build Stage 9 (Publish)
- [ ] Build status workflow
- [ ] Add CMS features
- [ ] Build preview system
- [ ] Add embeddings generation on publish
- [ ] Build internal link suggestions

---

**This is a MASSIVE rebuild but will result in world-class content pipeline!**

**Estimated Time**: 8-12 hours to complete all stages properly

**Let's fucking do this!** 🔥
