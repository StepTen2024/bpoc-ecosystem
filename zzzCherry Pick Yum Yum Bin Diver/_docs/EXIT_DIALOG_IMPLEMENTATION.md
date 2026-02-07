# Exit Confirmation Dialog - Implementation Guide

## What Was Created

**File:** `src/app/(admin)/admin/insights/create/components/ExitConfirmDialog.tsx`

A reusable dialog component that shows when user clicks Exit, with options to:
- Save Draft & Exit
- Exit Without Saving  
- Cancel (stay on page)

## How to Integrate

### Step 1: Add State to page.tsx

Add this near the other useState declarations (around line 50):

```typescript
const [showExitDialog, setShowExitDialog] = useState(false);
```

### Step 2: Add Save Draft Function

Add this function after the `publishArticle` function (around line 515):

```typescript
const handleSaveDraft = async () => {
  if (!state.pipelineId) {
    toast({ title: 'No pipeline to save', variant: 'destructive' });
    return;
  }

  try {
    // Save current progress to pipeline
    await savePipelineProgress(state.pipelineId, stage, {
      transcript: state.transcript,
      selectedSilo: state.selectedSilo,
      selectedIdea: state.selectedIdea,
      plan: state.plan,
      article: state.article,
      humanizedArticle: state.humanizedArticle,
      seoArticle: state.seoArticle,
      meta: state.meta,
      heroType: state.heroType,
      heroSource,
      sectionSource,
    });

    // Save to insights_posts if exists
    if (state.insightId) {
      await saveProgress(state.insightId, {
        content: state.seoArticle || state.humanizedArticle || state.article,
        pipeline_stage: `stage_${stage}`,
      }, 'draft');
    }

    toast({ title: 'Draft saved!', description: 'Your progress has been saved' });
    router.push('/admin/insights');
  } catch (err: any) {
    toast({ title: 'Error saving draft', description: err.message, variant: 'destructive' });
  }
};
```

### Step 3: Import the Dialog Component

Add this to the imports at the top of page.tsx:

```typescript
import ExitConfirmDialog from './components/ExitConfirmDialog';
```

### Step 4: Replace the Exit Button

Find the Exit button (line 601-603) and replace it with:

```typescript
<Button 
  onClick={() => setShowExitDialog(true)} 
  variant="ghost" 
  size="sm" 
  className="text-gray-400"
>
  Exit
</Button>
```

### Step 5: Add the Dialog Component

Add this at the end of the return statement, before the closing `</div>` (around line 830):

```typescript
      {/* Exit Confirmation Dialog */}
      <ExitConfirmDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onSaveDraft={handleSaveDraft}
        onExitWithoutSaving={() => router.push('/admin/insights')}
        hasPipeline={!!state.pipelineId}
      />
```

## How It Works

1. **User clicks Exit** → Dialog opens
2. **User has 3 options:**
   - **Cancel** - Closes dialog, stays on page
   - **Save Draft & Exit** - Saves all current progress to pipeline and insights_posts, then exits
   - **Exit Without Saving** - Immediately exits without saving

3. **Save Draft Logic:**
   - Saves current stage data to `content_pipelines` table
   - Saves article content to `insights_posts` table
   - Shows success toast
   - Redirects to insights page

## Benefits

- ✅ Prevents accidental data loss
- ✅ Gives users control over saving
- ✅ Clear visual feedback with loading states
- ✅ Saves to both pipeline and insights tables
- ✅ Professional UX

## Testing

1. Start creating an article, get to Stage 3
2. Click Exit
3. Dialog should appear with 3 options
4. Click "Save Draft & Exit"
5. Should save progress and redirect
6. Go back and click Resume
7. Should load at Stage 3 with all data

---

## Files Modified

- ✅ Created: `ExitConfirmDialog.tsx`
- ⏳ Update: `page.tsx` (follow steps above)

**Status:** Component created, manual integration needed
