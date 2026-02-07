# Candidate Profile Save Issues — Summary [✅ RESOLVED]

**Status:** All critical issues have been fixed. See `PROFILE_FIXES_APPLIED.md` for complete details.

---

# Original Issue Report

## Problem Snapshot
- **Symptom:** Profile fields (bio, phone, birthday, position, location, work preferences, social links) do **not persist** when navigating away. Username/avatars sometimes save, but most profile fields remain NULL in `candidate_profiles`.
- **Observed:** User can type values, leave the page, and the values are gone on return.
- **Environment:** Local dev on `http://localhost:3001`. Supabase project `ayrdnsiaylomcemfdisr`.

## Verified Database Reality
- **Saving correctly:**
  - `candidates.username`
  - `candidates.avatar_url`
  - `candidate_profiles.cover_photo`
- **Not saving:**
  - ALL other profile fields are NULL in `candidate_profiles` for test users.

## Root Cause (Current State)
- **Data only persists if API calls to `/api/candidates/[id]/profile` actually write.**
- We disabled localStorage drafts (per user request). So **persistence now depends entirely on server writes**.
- If fields disappear after navigation, it means **the DB never received or stored those values**.

## What Was Changed During Debugging
### Frontend (`src/app/(candidate)/candidate/profile/page.tsx`)
- Added **per‑section Save buttons** for Basic / Location / Work / Social.
- Kept bottom **Save Changes** for full save.
- **Auto‑save is ON** (debounced) so typing should push updates to the DB.
- **LocalStorage removed** entirely (no drafts, no restore).
- Added **data normalization** for auto‑save (numbers, dates, empty strings) to avoid invalid payloads.
- `executeSectionSave` now handles candidate vs profile updates safely (no `response.ok` on undefined).

### API (`src/app/api/candidates/[id]/profile/route.ts`)
- Uses **admin client** via `supabaseAdmin` (should bypass RLS).
- Already logs and returns detailed errors if update/create fails.

### Supabase Query Layer (`src/lib/db/profiles/queries.supabase.ts`)
- `updateProfile` **throws** on error and logs Supabase error codes.
- `createProfile` uses admin client.

## Current Behavior After Changes
- Save buttons do save **when they are clicked**.
- **If navigation happens without successful DB save**, values are gone.
- That indicates the **DB update isn’t happening or is failing**.

## Likely Remaining Blockers
1. **RLS or Supabase policy** is still blocking writes.
   - Admin client should bypass, but verify env vars are loaded locally.
2. **Payload mismatch** (enum or date type) causes update error.
   - `gender` is enum, `birthday` is date.
3. **API route not actually executing** (fetch fails, request never sent, or response error ignored).
4. **Missing profile row** or wrong `candidate_id`.

## Highest-Value Next Steps
1. **Add explicit logging** in `/api/candidates/[id]/profile` to print incoming payload and Supabase response.
2. **Run a direct test update** against the API route with a known payload to verify DB writes.
3. **Check RLS / service role env** in local dev:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Verify `candidate_id` exists** in `candidate_profiles` for the user.
   - If not, ensure `createProfile` executes and returns a row.

## Files to Review
- `src/app/(candidate)/candidate/profile/page.tsx`
- `src/app/api/candidates/[id]/profile/route.ts`
- `src/lib/db/profiles/queries.supabase.ts`
- Supabase SQL migrations for `candidate_profiles` schema

## Current Behavior Goal
- Typing in any field should **auto‑save** to DB (no local drafts).
- Section Save buttons should **immediately persist** section fields to DB.
- “Save Changes” should persist all fields to DB.

---
If the next agent needs a clean reproduction: fill in **phone** or **gender**, navigate away, return → field is gone (indicating DB write failed).
