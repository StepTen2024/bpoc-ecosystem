# Quick Fix: Exit Confirmation with Browser Dialog

Since the custom dialog isn't showing up, here's a simpler approach using browser's native confirm dialog.

## Replace the Exit Button Handler

Find the Exit button in `page.tsx` (line ~601) and replace it with this:

```typescript
<Button 
  onClick={async () => {
    if (!state.pipelineId) {
      // No pipeline, just exit
      router.push('/admin/insights');
      return;
    }

    // Ask user if they want to save
    const shouldSave = window.confirm(
      'You have unsaved progress. Would you like to save your work as a draft before exiting?\n\n' +
      'Click OK to save draft and exit.\n' +
      'Click Cancel to exit without saving.'
    );

    if (shouldSave) {
      // Save draft
      try {
        setLoading(true);
        
        // Save to pipeline
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
      } catch (err: any) {
        toast({ title: 'Error saving draft', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    // Exit regardless
    router.push('/admin/insights');
  }} 
  variant="ghost" 
  size="sm" 
  className="text-gray-400"
  disabled={loading}
>
  Exit
</Button>
```

## How It Works

1. User clicks Exit
2. If no pipeline exists → exits immediately
3. If pipeline exists → shows browser confirm dialog:
   - **OK** → Saves draft then exits
   - **Cancel** → Exits without saving

## Benefits

- ✅ Works immediately (no integration needed)
- ✅ Uses native browser dialog (no dependencies)
- ✅ Saves to both pipeline and insights tables
- ✅ Shows toast notifications
- ✅ Prevents data loss

## Alternative: Custom Dialog

If you want the prettier custom dialog, you need to:

1. Add `const [showExitDialog, setShowExitDialog] = useState(false);` to page.tsx
2. Import the ExitConfirmDialog component
3. Add the component to the JSX
4. Change Exit button to `onClick={() => setShowExitDialog(true)}`

See `EXIT_DIALOG_IMPLEMENTATION.md` for full instructions.
