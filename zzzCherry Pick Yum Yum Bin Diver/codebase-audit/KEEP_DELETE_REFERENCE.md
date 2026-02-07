# Keep vs Delete Reference

## KEEP (Primary Versions)
- ✓ **Admin System**: `src/app/(admin)/admin`
- ✓ **Candidate System**: `src/app/(candidate)/candidate`
- ✓ **Recruiter System**: `src/app/(recruiter)/recruiter`
- ✓ **Active Resume Builder**: `src/app/(candidate)/candidate/resume/build`
- ✓ **Main Database Client**: `src/lib/supabase.ts`

## DELETE (Duplicates/Dead Code)
- ✗ **Legacy BPOC DB**: `src/lib/bpoc-db.ts.DEPRECATED`
- ✗ **Legacy ShoreAgents DB**: `src/lib/shoreagents-db.ts`
- ✗ **Video Call Feedback Table**: (If confirmed unused)

## REVIEW (Manual Check Needed)
- ? **Public Resume Builder**: `src/app/try-resume-builder` (Is this still part of marketing strategy?)
- ? **Resume Debug**: `src/app/resume-debug` (Dev tool? Delete if not needed)
