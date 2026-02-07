# Media Generation in Publish Stage - Implementation Guide

## Problem
Media generation (videos/images) happens in the backend during publish, but the frontend doesn't show progress. Users just see a loading spinner without knowing that video/image generation is happening.

## Solution
Add progress tracking to show users what's happening during publish.

---

## Changes Needed

### 1. Add State Variables (page.tsx - top of component)

Add these state variables near the other useState declarations:

```typescript
const [publishProgress, setPublishProgress] = useState(0);
const [publishStatus, setPublishStatus] = useState('');
```

---

### 2. Update PublishStage Component Props

**File:** `src/app/(admin)/admin/insights/create/components/PublishStage.tsx`

**Add to interface (line 27):**
```typescript
interface PublishStageProps extends StageProps {
  publishArticle: (isDraft: boolean) => Promise<void>;
  uploadedImages: UploadedImages;
  publishProgress: number;  // ADD THIS
  publishStatus: string;    // ADD THIS
}
```

**Update component params (line 32):**
```typescript
export default function PublishStage({
  state,
  loading,
  publishArticle,
  uploadedImages,
  publishProgress,  // ADD THIS
  publishStatus,    // ADD THIS
}: PublishStageProps) {
```

---

### 3. Add Progress Display in PublishStage

**File:** `src/app/(admin)/admin/insights/create/components/PublishStage.tsx`

**Add this BEFORE the "Publish Actions" section (around line 290):**

```typescript
        {/* Media Generation Progress */}
        {loading && publishProgress > 0 && (
          <div className="bg-white/5 rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold text-sm">{publishStatus}</span>
              <span className="text-emerald-400 font-bold text-sm">{publishProgress}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${publishProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="flex items-center justify-center mt-3 gap-2">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              <span className="text-gray-400 text-xs">
                {publishStatus.includes('video') ? 'This may take 60-90 seconds...' : 'Generating media...'}
              </span>
            </div>
          </div>
        )}

        {/* Publish Actions */}
```

---

### 4. Pass Props from Main Page

**File:** `src/app/(admin)/admin/insights/create/page.tsx`

**Find the PublishStage component (around line 750) and add the new props:**

```typescript
<PublishStage
  state={state}
  updateState={update}
  loading={loading}
  setLoading={setLoading}
  toast={toast}
  savePipelineProgress={savePipelineProgress}
  saveProgress={saveProgress}
  publishArticle={publishArticle}
  uploadedImages={uploadedImages}
  publishProgress={publishProgress}  // ADD THIS
  publishStatus={publishStatus}      // ADD THIS
/>
```

---

### 5. Update publishArticle Function

**File:** `src/app/(admin)/admin/insights/create/page.tsx` (line ~463)

See `PUBLISH_FUNCTION_UPDATE.md` for the complete updated function.

**Key additions:**
- Progress tracking with `setPublishProgress()` and `setPublishStatus()`
- Different messages for video vs image generation
- Simulated progress for video generation (takes ~60 seconds)
- Media info in success toast

---

## What Users Will See

### Before (Current):
```
[Publish Button] → [Loading Spinner] → [Success/Error]
```
No indication of what's happening, especially during long video generation.

### After (With Progress):
```
[Publish Button] → 
  5%: "Starting publication..."
  10%: "🎬 Generating hero video with Runway AI..." (if video)
  10-50%: Progress bar animates during video generation
  55%: "🖼️ Generating 3 section images..."
  70%: "Uploading to database..."
  95%: "Finalizing..."
  100%: "Done!" → [Success]
```

---

## Benefits

1. **User Feedback** - Users know what's happening
2. **Patience** - Users understand why it takes 60-90 seconds
3. **Transparency** - Clear indication of video vs image generation
4. **Professional** - Looks polished and intentional

---

## Testing

After implementing:

1. Publish with video hero → Should show video generation progress
2. Publish with image hero → Should show image generation progress
3. Publish with uploaded media → Should be faster, minimal progress
4. Save as draft → Should skip media generation

---

## Files Modified

- ✅ `page.tsx` - Add state, update publishArticle function
- ✅ `PublishStage.tsx` - Add progress display
- ✅ Backend already handles media generation

---

## Status

⏳ Manual implementation needed (see instructions above)
📝 All code provided in this document
🎯 Estimated time: 10-15 minutes
