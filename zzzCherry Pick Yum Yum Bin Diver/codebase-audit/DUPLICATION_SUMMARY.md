# Duplication Summary

## 1. Resume System
**Status:** High Duplication
- **Active Version:** `src/app/(candidate)/candidate/resume/build` (Logged in flow)
- **Legacy/Public Version:** `src/app/try-resume-builder` (Public funnel)
- **APIs:**
    - `api/candidates/resume/*` (Active - User initiated)
    - `api/save-resume` (Active - Extraction Utility)
    - `api/user/saved-resumes` (Active - Fetch list)

**Recommendation:** Consolidate public builder to use the same components as the candidate builder. `api/save-resume` is **ACTIVE** (used by OCR extraction) and should be kept.

## 2. Database Clients
**Status:** Critical Fragmentation
- **Main Client:** `src/lib/supabase.ts` (and `utils.ts` in some places)
- **Dead Client 1:** `src/lib/bpoc-db.ts.DEPRECATED` (Explicitly marked)
- **Dead Client 2:** `src/lib/shoreagents-db.ts` (Orphaned unique client)

**Recommendation:** DELETE `bpoc-db.ts.DEPRECATED` and `shoreagents-db.ts` immediately.

## 3. HR Assistant
**Status:** Implementation Duplication
- **Admin:** `src/app/(admin)/admin/hr-assistant`
- **Candidate:** `src/app/(candidate)/candidate/hr-assistant`
- **Recruiter:** `src/app/(recruiter)/recruiter/hr-assistant`
- **Public:** `src/app/(main)/hr-assistant-demo`

**Recommendation:** Ensure `src/components/chat/ChatInterface` or similar is the **single source of truth** for the UI, and the pages are just thin wrappers. If pages contain logic, refactor into a shared component in `src/components/shared/hr-assistant`.

## 4. Games
**Status:** Route Duplication
- `src/app/(candidate)/candidate/games`
- `src/app/career-tools/games`

**Recommendation:** Verify if these render the same components. If so, this is acceptable for SEO/UX purposes (public vs private access), but ensure logic is not duplicated.
