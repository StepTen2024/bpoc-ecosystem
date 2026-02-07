# Frontend to Database Mapping - Content Pipeline

## Complete Field Mapping by Stage

### **Stage 1: Brief Input**

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.transcript` | `brief_transcript` | text | Voice/text input from user |
| `state.selectedSilo` | `selected_silo` | text | Selected content silo (e.g., 'salary', 'career') |
| `state.briefConfirmed` | *(not stored)* | boolean | Frontend-only flag |
| `state.customTopic` | *(not stored)* | string | Frontend-only, merged into transcript |

**API Mapping (Stage 1):**
```typescript
{
  briefTranscript: state.transcript,
  selectedSilo: state.selectedSilo
}
```

---

### **Stage 2: Research & Ideas**

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.researchData` | *(not stored in pipeline)* | any | Stored in `insights_posts` via saveProgress |
| *(generated ideas)* | `generated_ideas` | jsonb | AI-generated article ideas |
| `state.selectedIdea` | `selected_idea` | jsonb | User's chosen idea |

**API Mapping (Stage 2):**
```typescript
{
  generatedIdeas: [...],  // AI output
  selectedIdea: state.selectedIdea
}
```

---

### **Stage 3: Plan Generation**

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.plan` | `article_plan` | jsonb | Article outline/structure |
| `state.planApproved` | `plan_approved` | boolean | User approval flag |

**API Mapping (Stage 3):**
```typescript
{
  articlePlan: state.plan,
  planApproved: state.planApproved
}
```

---

### **Stage 4: Write Article**

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.article` | `raw_article` | text | **NOT SAVED TO PIPELINE** - Goes to `insights_posts.content` |
| `state.wordCount` | `word_count` | integer | **NOT CURRENTLY SAVED** |

**API Mapping (Stage 4):**
```typescript
// Pipeline: Only tracks stage
{ planApproved: true }

// insights_posts (via saveProgress):
{
  content: state.article,
  pipeline_stage: 'writing'
}
```

**⚠️ MISSING:** `word_count` is not being saved!

---

### **Stage 5: Humanize**

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.humanizedArticle` | `humanized_article` | text | **NOT SAVED TO PIPELINE** - Goes to `insights_posts.content` |
| `state.humanScore` | `human_score` | numeric(3,1) | **NOT CURRENTLY SAVED** |

**API Mapping (Stage 5):**
```typescript
// Pipeline: Only tracks stage
{}

// insights_posts (via saveProgress):
{
  content: state.humanizedArticle,
  pipeline_stage: 'humanizing'
}
```

**⚠️ MISSING:** `humanized_article` and `human_score` are not being saved to pipeline!

---

### **Stage 6: SEO Optimization**

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.seoArticle` | `seo_article` | text | **NOT SAVED TO PIPELINE** - Goes to `insights_posts.content` |
| `state.seoStats` | `seo_stats` | jsonb | **NOT CURRENTLY SAVED** |

**API Mapping (Stage 6):**
```typescript
// Pipeline: Only tracks stage
{}

// insights_posts (via saveProgress):
{
  content: state.seoArticle,
  pipeline_stage: 'seo'
}
```

**⚠️ MISSING:** `seo_article` and `seo_stats` are not being saved to pipeline!

---

### **Stage 7: Meta & Schema**

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.meta` | `meta_data` | jsonb | **NOT CURRENTLY SAVED** |
| `state.images` | `generated_images` | jsonb | **NOT CURRENTLY SAVED** |
| *(image prompts)* | `image_prompts` | jsonb | **NOT CURRENTLY SAVED** |

**API Mapping (Stage 7):**
```typescript
// Currently: Nothing saved to pipeline for Stage 7
{}
```

**⚠️ MISSING:** `meta_data`, `image_prompts`, `generated_images` are not being saved!

---

### **Stage 8: Publish (Meta Stage in API)**

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.heroType` | `hero_type` | text | 'image' or 'video' |
| `heroSource` | `hero_source` | text | 'generate' or 'upload' |
| `sectionSource` | `section_source` | text | 'generate' or 'upload' |
| `state.videoUrl` | `video_url` | text | Hero video URL |
| `state.contentSections` | `content_section1`, `content_section2`, `content_section3` | text | **NOT CURRENTLY SAVED** |

**API Mapping (Stage 8):**
```typescript
{
  heroSource: heroSource,
  sectionSource: sectionSource,
  videoUrl: state.videoUrl,
  heroType: state.heroType,
  markComplete: true  // Sets status to 'completed'
}
```

**⚠️ MISSING:** `content_section1/2/3` are not being saved!

---

## Global Pipeline Metadata

| Frontend State | Database Column | Type | Notes |
|----------------|-----------------|------|-------|
| `state.pipelineId` | `id` | uuid | Primary key |
| `state.insightId` | `insight_id` | uuid | Foreign key to insights_posts |
| `stage` | `current_stage` | integer | Current stage number (1-8) |
| *(status)* | `status` | text | 'draft', 'in_progress', 'completed', 'abandoned' |
| *(created)* | `created_at` | timestamp | Auto-set on creation |
| *(updated)* | `updated_at` | timestamp | Auto-updated |
| *(completed)* | `completed_at` | timestamp | Set when status = 'completed' |
| *(ai logs)* | `ai_logs` | jsonb | AI interaction logs |

---

## Unused Database Columns

These columns exist in the database but are **NOT currently used** by the frontend:

| Database Column | Type | Purpose | Status |
|-----------------|------|---------|--------|
| `personality_profile` | jsonb | Ate Ina personality data | ❌ Not used |
| `serper_results` | jsonb | Serper API results | ❌ Not used |
| `hr_kb_results` | jsonb | HR knowledge base results | ❌ Not used |
| `research_synthesis` | jsonb | Combined research data | ❌ Not used |

---

## Critical Missing Mappings

### **High Priority:**

1. **`word_count`** (Stage 4) - Should save article word count
2. **`humanized_article`** (Stage 5) - Should save humanized version to pipeline
3. **`human_score`** (Stage 5) - Should save AI detection score
4. **`seo_article`** (Stage 6) - Should save SEO-optimized version to pipeline
5. **`seo_stats`** (Stage 6) - Should save SEO statistics
6. **`meta_data`** (Stage 7) - Should save meta tags and schema
7. **`content_section1/2/3`** (Stage 8) - Should save split content sections

### **Medium Priority:**

8. **`image_prompts`** (Stage 7) - Should save generated image prompts
9. **`generated_images`** (Stage 7) - Should save image URLs

### **Low Priority (Research Data):**

10. **`serper_results`** - Could save raw Serper API results
11. **`hr_kb_results`** - Could save HR knowledge base results
12. **`research_synthesis`** - Could save combined research summary

---

## Recommendations

### **1. Fix Exit Save Function**

The current exit save (lines 880-910 in page.tsx) should save ALL stage data:

```typescript
await savePipelineProgress(state.pipelineId!, stage, {
  // Stage 1
  transcript: state.transcript,
  selectedSilo: state.selectedSilo,
  selectedIdea: state.selectedIdea,
  
  // Stage 3
  plan: state.plan,
  planApproved: state.planApproved,
  
  // Stage 4 - ADD THESE
  article: state.article,
  wordCount: state.wordCount,
  
  // Stage 5 - ADD THESE
  humanizedArticle: state.humanizedArticle,
  humanScore: state.humanScore,
  
  // Stage 6 - ADD THESE
  seoArticle: state.seoArticle,
  seoStats: state.seoStats,
  
  // Stage 7 - ADD THESE
  meta: state.meta,
  images: state.images,
  
  // Stage 8
  heroType: state.heroType,
  heroSource,
  sectionSource,
  videoUrl: state.videoUrl,
  contentSections: state.contentSections,
});
```

### **2. Update API Route**

Modify `/api/admin/content-pipeline/update/route.ts` to handle all fields:

```typescript
case 4: // Write
  if (data.article) updateData.raw_article = data.article;
  if (data.wordCount) updateData.word_count = data.wordCount;
  break;

case 5: // Humanize
  if (data.humanizedArticle) updateData.humanized_article = data.humanizedArticle;
  if (data.humanScore) updateData.human_score = data.humanScore;
  break;

case 6: // SEO
  if (data.seoArticle) updateData.seo_article = data.seoArticle;
  if (data.seoStats) updateData.seo_stats = data.seoStats;
  break;

case 7: // Meta
  if (data.meta) updateData.meta_data = data.meta;
  if (data.images) updateData.generated_images = data.images;
  if (data.imagePrompts) updateData.image_prompts = data.imagePrompts;
  break;

case 8: // Publish
  if (data.contentSections) {
    updateData.content_section1 = data.contentSections[0];
    updateData.content_section2 = data.contentSections[1];
    updateData.content_section3 = data.contentSections[2];
  }
  // ... existing code
  break;
```

### **3. Update Resume Function**

The `resumePipeline` function should load ALL saved data from the pipeline.

---

## Summary

**Current State:**
- ✅ Stage 1-3: Properly mapped
- ⚠️ Stage 4-6: Only saves to `insights_posts`, not to pipeline
- ⚠️ Stage 7: Nothing saved to pipeline
- ⚠️ Stage 8: Partial save (missing content sections)

**Result:**
- Resume functionality is **incomplete** - only loads basic metadata
- Article content, scores, and stats are **lost** on resume
- Need to implement full pipeline data persistence for proper resume functionality
