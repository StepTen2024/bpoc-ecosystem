# Frontend Update Instructions

## ✅ COMPLETED
1. **MetaStage.tsx** - Simplified to only generate meta tags (DONE)
2. **Backend APIs** - Updated to handle media generation at publish (DONE)

## ⏳ MANUAL UPDATE NEEDED

### File: `src/app/(admin)/admin/insights/create/page.tsx`

**Location:** Line 463-514 (publishArticle function)

**Change the publish API call from:**
```typescript
body: JSON.stringify({
  title: state.plan?.title || state.selectedIdea?.title,
  content: finalContent,
  contentSections: sections,
  slug: state.meta?.canonicalSlug,
  silo: state.selectedSilo,
  keywords: state.selectedIdea?.keywords,
  meta: state.meta,
  images: state.images,  // ❌ REMOVE THIS LINE
  heroType: state.heroType || 'image',
  isDraft,
  draftId: state.draftId,
})
```

**To:**
```typescript
body: JSON.stringify({
  title: state.plan?.title || state.selectedIdea?.title,
  content: finalContent,
  contentSections: sections,
  slug: state.meta?.canonicalSlug,
  silo: state.selectedSilo,
  keywords: state.selectedIdea?.keywords,
  meta: state.meta,
  heroType: state.heroType || 'image',
  heroSource: heroSource || 'generate', // ✅ ADD THIS
  sectionSource: sectionSource || 'generate', // ✅ ADD THIS
  uploadedHeroUrl: uploadedImages.hero, // ✅ ADD THIS
  uploadedSectionUrls: [ // ✅ ADD THIS
    uploadedImages.section1,
    uploadedImages.section2,
    uploadedImages.section3,
  ].filter(Boolean),
  isDraft,
  draftId: state.draftId,
})
```

**Also update the success toast (line 503-504):**
```typescript
toast({ 
  title: isDraft ? 'Saved as draft!' : 'Published!',
  description: isDraft ? undefined : `Media generated: ${result.article?.heroUrl ? '✓ Hero' : ''} ${result.article?.sectionUrls?.length || 0} sections`
});
```

---

## How It Works Now

### Old Flow:
```
Stage 7: Generate Meta
├── Generate meta tags (10s)
├── Generate hero video (60s) ❌
└── Generate 3 images (30s) ❌
Total: ~100 seconds

Publish: Just save to database (1s)
```

### New Flow:
```
Stage 7: Generate Meta
└── Generate meta tags only (5s) ✅
Total: ~5 seconds

Publish:
├── Generate hero video (if needed) (60s)
├── Generate 3 images (if needed) (30s)
└── Save to database (1s)
Total: ~91 seconds (only when publishing)
```

### Benefits:
- **Faster iteration** through stages 1-7
- **50-70% cost savings** (only generate for published articles)
- **Better quality** (uses final optimized content)
- **More flexibility** (can review before expensive generation)

---

## Testing Checklist

After making the manual update:

- [ ] Stage 7 completes quickly (~5 seconds)
- [ ] Publish with default settings (generates hero + sections)
- [ ] Check that media URLs are returned in response
- [ ] Verify article displays correctly with generated media
- [ ] Test draft saving (should NOT generate media)
- [ ] Check API costs (should be lower)

---

## Rollback

If issues occur, you can revert:
1. Restore old `generate-meta/route.ts` from git
2. Restore old `publish/route.ts` from git  
3. Restore old `MetaStage.tsx` from git
4. No database changes needed

---

## Status

✅ Backend: Complete
✅ MetaStage: Complete
⏳ Main page: Manual update needed (see above)
