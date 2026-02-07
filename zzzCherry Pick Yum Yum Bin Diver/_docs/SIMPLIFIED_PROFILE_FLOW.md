# Simplified Profile Flow - ONE PAGE, NO BULLSHIT

## What Got Deleted
- ❌ `ProfileCompletionWizard.tsx` - DELETED (redundant modal)
- ❌ `ProfileCompletionModal.tsx` (shared/auth) - DELETED
- ❌ `ProfileCompletionModal.tsx` (candidate) - DELETED

## The New Simple Flow

```
User clicks "I Want a Job"
  ↓
SignUpForm opens
  ↓
User fills email, password, name
  ↓
Creates Supabase auth user
  ↓
Calls /api/user/sync (creates candidate record)
  ↓
Redirects to /candidate/profile?welcome=true
  ↓
User fills out ONE PROFILE PAGE
  ↓
Clicks "Save Profile"
  ↓
Calls /api/user/profile + /api/user/work-status
  ↓
Sets profile_completed = true
  ↓
Done. Complete. No wizard. No modal. Simple.
```

## What Happens on `/candidate/profile`

### First Time (welcome=true)
1. Shows welcome banner: "Welcome to BPOC! 🎉"
2. Page title: "Complete Your Profile"
3. All fields are editable
4. User fills everything out
5. Clicks "Save Profile"
6. Profile saved → `profile_completed = true`
7. Can navigate away

### Returning Users (profile incomplete)
1. No welcome banner
2. Page title: "Complete Your Profile"
3. Shows incomplete warning banner
4. Fields are editable
5. Can save progress

### Returning Users (profile complete)
1. No welcome banner
2. Page title: "Your Profile"
3. Fields are READ-ONLY by default
4. Click "Edit Profile" to make changes
5. Click "Save" to update

## Dashboard Behavior

### New User (profile incomplete)
- Shows orange banner: "Complete Your Profile to Get Matched! ⚡"
- "Complete Now" button → redirects to `/candidate/profile`
- Can dismiss banner

### User with Complete Profile
- No banner shows
- profile_completion = 100%
- Normal dashboard view

## ONE SOURCE OF TRUTH

**`/candidate/profile` page** is the ONLY place to edit profile information.

- No duplicate forms
- No confusing modals
- No wizard bullshit
- Just one fucking page that works

## API Routes (Unchanged)

These still work the same:

- `GET /api/user/profile?userId=xxx` - Returns user profile
- `PUT /api/user/profile` - Updates basic profile info
- `PUT /api/user/work-status` - Updates work-related fields
- `POST /api/user/sync` - Creates new candidate after signup

## Testing Checklist

### ✅ Signup Flow
1. Go to localhost:3001
2. Click "I Want a Job"
3. Fill signup form
4. Should redirect to `/candidate/profile?welcome=true`
5. Should see welcome banner
6. Fill all fields
7. Click "Save Profile"
8. Should save without errors
9. Navigate to dashboard
10. Should NOT see wizard popup
11. Should NOT see incomplete banner (profile 100%)

### ✅ Incomplete Profile Flow
1. Login as user with incomplete profile
2. Dashboard shows orange banner
3. Click "Complete Now"
4. Redirects to `/candidate/profile`
5. Fill remaining fields
6. Save
7. Navigate back to dashboard
8. Banner should disappear

### ✅ Edit Profile Flow
1. Login as user with complete profile
2. Go to `/candidate/profile` (from sidebar)
3. Fields should be READ-ONLY
4. Click "Edit Profile"
5. Fields become editable
6. Make changes
7. Click "Save"
8. Changes saved
9. Fields become READ-ONLY again

## Files Changed

### Deleted
- `src/components/profile/ProfileCompletionWizard.tsx`
- `src/components/shared/auth/ProfileCompletionModal.tsx`
- `src/components/candidate/ProfileCompletionModal.tsx`

### Modified
- `src/app/(candidate)/candidate/dashboard/page.tsx`
  - Removed wizard state and component
  - Redirect to profile page instead of showing wizard
  - Banner button redirects to profile page

- `src/components/shared/auth/SignUpForm.tsx`
  - Changed redirect from `/candidate/dashboard?welcome=true` to `/candidate/profile?welcome=true`

- `src/app/(candidate)/candidate/profile/page.tsx`
  - Added `useSearchParams` to detect `welcome=true`
  - Added welcome banner for new users
  - Already had all profile fields (no changes to form)

---

**Simple. Clean. One fucking page. Done.**

_Last Updated: 2026-01-22_
_Status: SIMPLE AF_
