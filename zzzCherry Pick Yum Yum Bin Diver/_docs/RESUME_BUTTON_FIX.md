# Resume Button Fix - Pipeline Stage Names

## Problem
After exiting and saving a draft, the Resume button was not appearing in the Recent Articles list.

## Root Cause
The exit save function was setting `pipeline_stage` to `"stage_1"`, `"stage_2"`, etc., but the Resume button condition checks for specific stage names like:
- `"plan_review"`
- `"writing"`
- `"humanizing"`
- `"seo"`
- `"meta"`
- `"ready"`

The condition in `insights/page.tsx` line 278:
```typescript
{!post.is_published && post.pipeline_stage && post.pipeline_stage !== 'draft' && (
  <Resume Button />
)}
```

This would fail because `"stage_1"` !== `"plan_review"`, etc.

## Solution Applied

Added a stage name mapping in the exit save function:

```typescript
const stageNames: Record<number, string> = {
  1: 'brief_input',
  2: 'research',
  3: 'plan_review',
  4: 'writing',
  5: 'humanizing',
  6: 'seo',
  7: 'meta',
  8: 'ready'
};

await saveProgress(state.insightId, {
  content: state.seoArticle || state.humanizedArticle || state.article,
  pipeline_stage: stageNames[stage] || 'draft',
}, stageNames[stage] || 'draft');
```

## Result

✅ **Now when you exit:**
1. Pipeline saves to `content_pipelines` table
2. Insight saves to `insights_posts` with proper `pipeline_stage` name (e.g., "writing", "humanizing")
3. Resume button appears in Recent Articles list
4. Clicking Resume fetches the correct pipeline_id and loads the article

## Stage Name Reference

| Stage # | Stage Name | Description |
|---------|------------|-------------|
| 1 | brief_input | Voice/text brief input |
| 2 | research | Serper research |
| 3 | plan_review | Article plan generation |
| 4 | writing | Article writing |
| 5 | humanizing | Humanization with Grok |
| 6 | seo | SEO optimization |
| 7 | meta | Meta tags & schema |
| 8 | ready | Ready to publish |

## Testing

1. Start creating an article
2. Get to Stage 3, 4, or 5
3. Click Exit
4. Dialog appears with countdown
5. Saves automatically
6. Check Recent Articles - Resume button should appear
7. Click Resume - should load at the correct stage

✅ **Fixed!**
