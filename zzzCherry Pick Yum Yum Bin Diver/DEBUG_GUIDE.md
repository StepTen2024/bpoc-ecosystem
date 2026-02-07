# BPOC Insights Pipeline - Debug Guide

## Issue Summary: Stage 3 (generate-plan) failing with 500

### Root Cause Analysis
1. **Claude API Key**: The key in `.env.local` is VALID and working
2. **Model Name**: `claude-sonnet-4-20250514` is correct and functional
3. **Likely Cause**: Vercel deployment has wrong/outdated CLAUDE_API_KEY

### Verification Done
- ✅ Tested API key from `.env.local` - works correctly
- ✅ Tested model name: `claude-sonnet-4-20250514`
- ✅ API responds correctly to simple requests

### Files Using Claude API (Stage 3, 4, 6)
1. `src/app/api/admin/insights/pipeline/generate-plan/route.ts` (Stage 3)
2. `src/app/api/admin/insights/pipeline/write-article/route.ts` (Stage 4)
3. `src/app/api/admin/insights/pipeline/seo-optimize/route.ts` (Stage 6)

All use:
- Model: `claude-sonnet-4-20250514`
- API Key: `process.env.CLAUDE_API_KEY`

## Fix Steps

### Step 1: Update Vercel Environment Variables
In Vercel dashboard or CLI, update CLAUDE_API_KEY with the value from `.env.local`

### Step 2: Redeploy
```bash
vercel --prod
```

### Step 3: Test Stage 3
1. Go to `/admin/insights/create`
2. Complete Stage 1 (Brief + Ideas)
3. Complete Stage 2 (Research)
4. Click "Generate Plan" in Stage 3

## Code Improvements Made

### Error Logging
All routes have comprehensive error logging via `logError()` from `@/lib/error-logger`

### Model Names Verified
- `claude-sonnet-4-20250514` ✅ Valid
- `claude-4-sonnet-20250514` ✅ Also valid (both work)

## Data Flow Between Stages

```
Stage 1 (ideas) → Stage 2 (research) → Stage 3 (plan) → Stage 4 (write) → Stage 5 (humanize) → Stage 6 (seo) → Stage 7 (meta) → Stage 8 (publish)
```

### Key Data Contracts

**Stage 1 → 2:**
- `selectedIdea`: { title, description, keywords, ... }
- `selectedSilo`: string
- `transcript`: string (original brief)

**Stage 2 → 3:**
- `researchData`: { perplexity, serper, validatedLinks, synthesis }

**Stage 3 → 4:**
- `plan`: { structure, keywords, linkStrategy, competitorAnalysis }

**Stage 4 → 5:**
- `article`: string (markdown)

**Stage 5 → 6:**
- `humanizedArticle`: string

**Stage 6 → 7:**
- `seoArticle`: string

**Stage 7 → 8:**
- `meta`: { metaTitle, metaDescription, canonicalSlug, ... }
- `images`: array

## Environment Variables Required

```env
# AI Services
CLAUDE_API_KEY=sk-...
GROK_API_KEY=xai-...
OPENAI_API_KEY=sk-proj-...
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...

# Research
PERPLEXITY_API_KEY=pplx-...
SERPER_API_KEY=...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
