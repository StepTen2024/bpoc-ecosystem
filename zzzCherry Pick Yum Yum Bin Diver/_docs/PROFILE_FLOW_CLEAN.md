# Clean Profile Completion Flow

## What Got Deleted
- ❌ `src/components/shared/auth/ProfileCompletionModal.tsx` - DELETED
- ❌ `src/components/candidate/ProfileCompletionModal.tsx` - DELETED

## What Remains (The Good Shit)
- ✅ `src/components/profile/ProfileCompletionWizard.tsx` - **THE ONLY PROFILE WIZARD**
- ✅ Dashboard banner - triggers the wizard if profile incomplete
- ✅ `/candidate/profile` page - for EDITING profile after completion

---

## The Clean Flow

### 1. User Signs Up
```
Click "I Want a Job" 
  → Opens SignUpForm
  → Fill email, password, name
  → Creates Supabase auth user
  → Calls /api/user/sync (creates candidate record)
  → Sets sessionStorage.justSignedUp = 'true'
  → Redirects to /candidate/dashboard?welcome=true
```

### 2. First Login - Wizard Shows
```
Dashboard loads
  → Checks sessionStorage.justSignedUp OR URL param welcome=true
  → Checks if profile_completion < 100
  → If incomplete, shows ProfileCompletionWizard
  → Clears sessionStorage.justSignedUp
```

### 3. User Fills Wizard
```
Step 1: Location, Birthday, Work Status
  → Auto-saves to /api/user/profile and /api/user/work-status
  
Step 2: Salary Range, Shift, Work Setup
  → Auto-saves
  
Step 3: Phone, Bio, Current Employer (optional)
  → Can skip or fill
  
Click "Complete Profile"
  → Saves to /api/user/profile (with completed_data: true)
  → Saves to /api/user/work-status (with completed_data: true)
  → Sets profile_completed = true in database
  → Redirects to /candidate/dashboard
  → Wizard will NOT show again
```

### 4. If User Skips Wizard
```
Dashboard shows banner:
  "Complete Your Profile to Get Matched! ⚡"
  "Your profile is X% complete"
  
Click "Complete Now"
  → Opens ProfileCompletionWizard again
  → Pre-fills any saved data
  
User can dismiss banner:
  → Stored in localStorage.profile_banner_dismissed
  → Banner won't show again until they clear localStorage
```

### 5. After Profile Complete
```
- Wizard never shows automatically
- Banner disappears (profile_completion = 100%)
- User can edit via /candidate/profile page
- Profile photo can be uploaded on /candidate/profile
```

---

## Database Fields

### `candidates` table
- `id` - UUID (FK to auth.users)
- `email`
- `first_name`
- `last_name`
- `phone`
- `avatar_url` - Profile photo URL
- `username`
- `slug`

### `candidate_profiles` table
- `candidate_id` - UUID (FK to candidates)
- `bio`
- `location`
- `birthday`
- `gender`
- `gender_custom`
- `work_status`
- `current_employer`
- `current_salary` - NUMERIC
- `expected_salary_min` - NUMERIC
- `expected_salary_max` - NUMERIC
- `notice_period_days` - INTEGER
- `preferred_shift`
- `preferred_work_setup`
- `current_mood`
- `profile_completed` - BOOLEAN ← **THIS IS THE KEY FLAG**

---

## API Endpoints

### `/api/user/profile` (GET/PUT)
- Returns `completed_data` from `profile_completed` flag
- Handles basic info: location, birthday, phone, bio
- Sanitizes salary values (strips ₱, $, commas)

### `/api/user/work-status` (PUT)
- Handles work-related fields
- Sanitizes salary values
- Sets `profile_completed` flag when done

### `/api/user/sync` (POST)
- Called after signup
- Creates candidate + profile records
- Only for NEW users

---

## Testing Checklist

### ✅ Happy Path
1. Sign up new user → Should redirect to dashboard
2. Wizard should pop up automatically
3. Fill all 3 steps → Should save without errors
4. Click "Complete Profile" → Should redirect to dashboard
5. Wizard should NOT show again on next login
6. Banner should disappear (profile 100% complete)

### ✅ Skip Path
1. Sign up → Wizard shows
2. Click "Skip" or close wizard
3. Dashboard shows orange banner
4. Click "Complete Now" → Wizard opens again
5. Can dismiss banner (X button)

### ✅ Error Handling
1. Fill salary with "₱50,000" → Should sanitize to 50000
2. Fill salary with "100k" → Should sanitize to 100000
3. Leave required field blank → Should show error toast
4. API returns 500 → Should show error message

---

## ONE SOURCE OF TRUTH

**ProfileCompletionWizard** is the ONLY way to complete a profile for the first time.

**`/candidate/profile`** is for editing AFTER profile is complete.

**No more duplicate modals. No more confusion. One fucking flow.**

---

_Last Updated: 2026-01-22_
_Status: CLEAN AF_
