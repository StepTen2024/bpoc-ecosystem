# Resume Pipeline - Current Flow & Fix

## ✅ What's Already Working

The resume flow is **already implemented correctly**:

```typescript
// 1. User clicks "Resume" button (from insights page)
//    → Navigates to: /admin/insights/create?resume=PIPELINE_ID

// 2. Page loads and detects resume parameter (line 88)
const resumeId = searchParams.get('resume');

// 3. Fetches pipeline from database (line 94)
const res = await fetch(`/api/admin/content-pipeline/get?id=${resumeId}`);

// 4. Loads the pipeline data (line 97)
resumePipeline(result.pipeline);
```

**This part works perfectly!** ✅

---

## ❌ What's Broken

The problem is **what data is in the database**:

### Current Database State:
```json
{
  "id": "abc-123",
  "current_stage": 5,
  "brief_transcript": "...",
  "selected_idea": {...},
  "article_plan": {...},
  // ❌ Missing: article, humanizedArticle, seoArticle, etc.
}
```

### What Resume Function Tries to Load:
```typescript
article: pipeline.raw_article || '',           // ❌ Doesn't exist
humanizedArticle: pipeline.humanized_article,  // ❌ Doesn't exist  
seoArticle: pipeline.seo_article,              // ❌ Doesn't exist
```

### Result:
- Loads empty strings for all content
- Stage is set to 5, but no content to show
- Appears to start from Stage 1

---

## 🔧 The Fix

Save ALL data to `stage_data` field so it can be loaded:

### When Saving (Update API):
```typescript
// Current (broken):
updateData.current_stage = 5;

// Fixed:
updateData.current_stage = 5;
updateData.stage_data = {
  article: "...",
  humanizedArticle: "...",
  humanScore: 87,
  // ... all other data
};
```

### When Loading (Resume Function):
```typescript
// Current (broken):
article: pipeline.raw_article || '',  // Empty!

// Fixed:
article: pipeline.stage_data?.article || pipeline.raw_article || '',  // Has data!
```

---

## 🧪 Test It Yourself

### Step 1: Check What's in Database

Open browser console and run this when you click Resume:

```javascript
// Add this to resumePipeline function (line 114)
console.log('📊 Pipeline from database:', pipeline);
console.log('📦 Stage data:', pipeline.stage_data);
console.log('📝 Article:', pipeline.raw_article);
console.log('🎯 Current stage:', pipeline.current_stage);
```

### Step 2: Check What You'll See

**If `pipeline.stage_data` is empty or undefined:**
- ❌ The update API isn't saving the data
- Need to implement the fix in `update/route.ts`

**If `pipeline.current_stage` is 1 but you stopped at 5:**
- ❌ The `savePipelineProgress` isn't being called
- Check if stages are calling `savePipelineProgress()` correctly

**If both are correct but still starts at Stage 1:**
- ❌ The `resumePipeline` function isn't loading the data correctly
- Need to update the resume function

---

## 📋 Implementation Checklist

- [ ] Add `stage_data` column to database (if missing)
- [ ] Update `content-pipeline/update/route.ts` to save stage_data
- [ ] Update `resumePipeline` function to load from stage_data
- [ ] Test: Create article, stop at Stage 3
- [ ] Test: Click Resume, should load at Stage 3 with all data
- [ ] Test: Check console logs to verify data is loaded

---

## 🎯 Quick Summary

**The resume flow is correct:**
1. Click Resume ✅
2. Get pipeline ID from URL ✅
3. Fetch pipeline from database ✅
4. Load pipeline data ✅

**The problem is the data:**
- Database doesn't have the content (article, humanizedArticle, etc.)
- Need to save it to `stage_data` field
- Need to load it from `stage_data` field

**Files to update:**
1. `src/app/api/admin/content-pipeline/update/route.ts` - Save stage_data
2. `src/app/(admin)/admin/insights/create/page.tsx` - Load from stage_data

See `COMPLETE_RESUME_FIX.md` for exact code changes.
