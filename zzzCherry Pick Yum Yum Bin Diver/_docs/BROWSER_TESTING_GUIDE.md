# 🧪 Profile Onboarding Flow - Browser Testing Checklist

## Pre-Testing Setup

✅ **Dev Server Running**: Port 3001  
✅ **All Code Deployed**: Wizard, banner, redirect logic  
✅ **No TypeScript Errors**: In modified files  
✅ **Files Created**:
- `src/components/profile/ProfileCompletionWizard.tsx` (350+ lines)
- `src/components/auth/PasswordStrengthMeter.tsx` (155 lines)

✅ **Files Modified**:
- `src/components/shared/auth/SignUpForm.tsx` (line 184-185)
- `src/app/(candidate)/candidate/dashboard/page.tsx` (wizard + banner)

---

## 🎯 Test Scenario 1: New User Signup → Wizard Appears

### Steps to Test:
1. Open browser to: **http://localhost:3001/home**
2. Click **"Sign Up"** button (top right or hero section)
3. Fill signup form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `testuser+$(date +%s)@example.com` (unique email)
   - Password: `TestPass123!`
   - Check "I agree to terms"
4. Click **"Create Account"**
5. Wait for redirect to `/candidate/dashboard?welcome=true`

### Expected Results:
- ✅ User redirected to dashboard
- ✅ **Profile Completion Wizard modal appears** after 500ms
- ✅ Wizard shows **Step 1 of 3**
- ✅ Progress bar at **0%**
- ✅ Fields visible: Location, Birthday, Work Status
- ✅ Dashboard content visible behind modal (blurred)

### If Wizard DOESN'T Appear:
- Check browser console for errors
- Verify `sessionStorage` has `justSignedUp=true`
- Check URL has `?welcome=true` parameter
- Check React state: `showWizard` should be `true`

---

## 🎯 Test Scenario 2: Complete Step 1 → Auto-Save Works

### Steps to Test:
1. With wizard open on **Step 1**, fill fields:
   - **Location**: `Manila, Philippines`
   - **Birthday**: `1995-06-15`
   - **Work Status**: Select `Unemployed Looking for Work`
2. Click **"Next →"** button
3. **Watch Network tab** (F12 → Network)

### Expected Results:
- ✅ Loading state shows on button (spinner icon)
- ✅ **POST request** to `/api/user/profile` with body:
  ```json
  {
    "location": "Manila, Philippines",
    "birthday": "1995-06-15",
    "work_status": "unemployed",
    "profile_completed": false
  }
  ```
- ✅ Response: `200 OK`
- ✅ Console log: `✅ Auto-saved profile progress`
- ✅ Wizard advances to **Step 2 of 3**
- ✅ Progress bar updates to **33%**

### If Auto-Save Fails:
- Check API response in Network tab
- Look for error toast notification
- Verify Supabase credentials in `.env.local`
- Check if `/api/user/profile` endpoint exists

---

## 🎯 Test Scenario 3: Complete Step 2 → Progress Persists

### Steps to Test:
1. On **Step 2**, fill fields:
   - **Expected Salary Min**: `30000`
   - **Expected Salary Max**: `50000`
   - **Preferred Shift**: Select `Day Shift`
   - **Work Setup**: Select `Work From Home`
2. Click **"Next →"**
3. **Watch Network tab**

### Expected Results:
- ✅ **POST request** to `/api/user/profile`
- ✅ Response includes ALL data from Step 1 + Step 2
- ✅ Wizard advances to **Step 3 of 3**
- ✅ Progress bar updates to **66%**
- ✅ Step 3 fields visible: Phone, Bio, Current Employer (all optional)

---

## 🎯 Test Scenario 4: Complete Profile → 100% Completion

### Steps to Test:
1. On **Step 3** (optional fields), either:
   - **Option A**: Fill fields:
     - Phone: `+639123456789`
     - Bio: `Experienced customer service professional`
     - Current Employer: `Acme Corp`
   - **Option B**: Leave all blank (they're optional)
2. Click **"Complete Profile ✨"**
3. **Watch Network tab**

### Expected Results:
- ✅ **POST request** to `/api/user/profile` with:
  ```json
  {
    ...allPreviousData,
    "profile_completed": true  // ← KEY FIELD
  }
  ```
- ✅ Success toast: `🎉 Profile Complete!`
- ✅ Wizard closes (modal disappears)
- ✅ Dashboard refreshes/reloads
- ✅ **Profile completion shows 100%** in dashboard stats
- ✅ **Orange banner DOES NOT appear** (because profile is complete)

---

## 🎯 Test Scenario 5: "I'll Do This Later" → Banner Appears

### Steps to Test:
1. Sign up with new account (or use existing incomplete profile)
2. When wizard appears, fill **Step 1** only
3. Click **"I'll Do This Later"** button (bottom of wizard)
4. **Watch Network tab**

### Expected Results:
- ✅ **POST request** to `/api/user/profile` with:
  ```json
  {
    "location": "...",
    "birthday": "...",
    "work_status": "...",
    "profile_completed": false  // ← Still incomplete
  }
  ```
- ✅ Toast: `Progress saved! You can complete this anytime`
- ✅ Wizard closes
- ✅ **Orange banner appears** at top of dashboard:
  ```
  ⚠️ Complete Your Profile
  Your profile is only X% complete. Complete it now to unlock...
  [Complete Now →] [X]
  ```
- ✅ Banner has dismiss button (X) in top-right

---

## 🎯 Test Scenario 6: Banner "Complete Now" → Wizard Reopens with Data

### Steps to Test:
1. With banner visible, click **"Complete Now"** button
2. Wizard should reopen

### Expected Results:
- ✅ Wizard opens at **Step 1**
- ✅ **Previously saved data is pre-filled**:
  - Location field has saved value
  - Birthday field has saved value
  - Work Status dropdown shows saved selection
- ✅ User can continue from where they left off
- ✅ Can click "Next" to go to Step 2 and continue

---

## 🎯 Test Scenario 7: Dismiss Banner → Stays Dismissed

### Steps to Test:
1. With banner visible, click **X** button (top-right of banner)
2. **Check localStorage** (F12 → Application → Local Storage):
   - Should have key: `profile_banner_dismissed`
   - Value: `"true"`
3. Refresh the page (F5)

### Expected Results:
- ✅ Banner immediately hides (smooth fade out)
- ✅ `localStorage` has `profile_banner_dismissed = "true"`
- ✅ After refresh, **banner does NOT reappear**
- ✅ User can still access wizard via profile completion card or profile page

---

## 🎯 Test Scenario 8: Return to Complete Later → Data Persists

### Steps to Test:
1. User who clicked "I'll Do This Later" earlier
2. **Close browser completely**
3. Reopen browser and login again
4. Go to dashboard
5. Click "Complete Now" on banner

### Expected Results:
- ✅ Wizard opens with **saved data pre-filled**
- ✅ User can continue from last step
- ✅ No data loss
- ✅ Auto-save continues to work

---

## 🎯 Test Scenario 9: Mobile Responsiveness

### Steps to Test:
1. Open DevTools (F12)
2. Toggle device emulation (Ctrl+Shift+M)
3. Test on:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
4. Go through full wizard flow

### Expected Results:
- ✅ Wizard modal is **full-screen on mobile** (or nearly full)
- ✅ All form fields are **touch-friendly** (min 44px tap targets)
- ✅ Text is **readable** (min 16px font size)
- ✅ Buttons are **easily tappable**
- ✅ Progress bar visible and readable
- ✅ No horizontal scrolling required
- ✅ Banner is responsive (stacks on mobile)

---

## 🎯 Test Scenario 10: Error Handling

### Steps to Test:
1. On **Step 1**, leave Location empty
2. Click "Next"
3. Expected: Toast error `Location required`

4. Fill Location, leave Birthday empty
5. Click "Next"
6. Expected: Toast error `Birthday required`

7. Fill Location + Birthday, leave Work Status unselected
8. Click "Next"
9. Expected: Toast error `Work status required`

10. On **Step 2**, leave salary fields empty
11. Click "Next"
12. Expected: Toast error `Salary range required`

### Expected Results:
- ✅ Validation errors show as **toast notifications**
- ✅ User **stays on current step** (doesn't advance)
- ✅ Error messages are **clear and helpful**
- ✅ No console errors

---

## 🎯 Test Scenario 11: Direct URL Navigation

### Steps to Test:
1. Manually navigate to: **http://localhost:3001/candidate/dashboard?welcome=true**
2. (Without being a new signup)

### Expected Results:
- ✅ If profile is **incomplete**: Wizard should appear
- ✅ If profile is **complete**: Wizard should NOT appear
- ✅ URL parameter is checked alongside sessionStorage flag

---

## 🎯 Test Scenario 12: Database Verification

### Steps to Test:
1. Complete the wizard fully
2. Go to Supabase Dashboard → Table Editor → `candidates` table
3. Find your test user's row
4. Check columns

### Expected Results:
- ✅ `location` field has saved value
- ✅ `birthday` field has saved date
- ✅ `work_status` has enum value (`unemployed`, `employed`, etc.)
- ✅ `expected_salary_min` and `expected_salary_max` have integers
- ✅ `preferred_shift` has value
- ✅ `work_setup` has value
- ✅ `completed_data` field is `TRUE` (if profile completed)
- ✅ All other optional fields (phone, bio) saved if filled

---

## 🐛 Known Issues to Watch For

### Issue 1: Wizard Doesn't Appear After Signup
**Symptoms**: User redirected to dashboard but wizard never shows  
**Possible Causes**:
- `sessionStorage.setItem('justSignedUp', 'true')` not executing
- Redirect happens before sessionStorage is set
- `useEffect` dependency array issue
- `currentUserId` is `null` when effect runs

**Debug Steps**:
1. Check browser console for errors
2. Check `sessionStorage` in DevTools
3. Check if `?welcome=true` is in URL
4. Check React DevTools state: `showWizard` value

---

### Issue 2: Auto-Save Returns 401 Unauthorized
**Symptoms**: "Save failed" toast when clicking Next  
**Possible Causes**:
- User session expired
- Supabase auth token invalid
- `/api/user/profile` endpoint requires authentication

**Debug Steps**:
1. Check Network tab response body
2. Verify `supabase.auth.getUser()` returns valid user
3. Check if endpoint uses `userId` from query/body correctly

---

### Issue 3: Data Not Pre-Filled When Returning
**Symptoms**: User returns to wizard but fields are blank  
**Possible Causes**:
- `useEffect` fetch not running on mount
- API endpoint not returning saved data
- `setFormData` not being called with fetched data

**Debug Steps**:
1. Check if `fetchExistingProfile()` is called on mount
2. Verify API returns data in correct format
3. Check React DevTools state: `formData` object

---

### Issue 4: Banner Appears Even Though Profile is Complete
**Symptoms**: Orange banner visible despite 100% completion  
**Possible Causes**:
- `stats.profile_completion` calculation incorrect
- Database field `completed_data` not set to `TRUE`
- Banner dismiss flag (`localStorage`) not checked

**Debug Steps**:
1. Check `stats` object in React DevTools
2. Verify database `completed_data` column value
3. Clear `localStorage` and test again

---

## 📊 Testing Checklist Summary

| Test Scenario | Status | Notes |
|---------------|--------|-------|
| 1. Wizard appears after signup | ⬜ | Check URL param + sessionStorage |
| 2. Step 1 auto-save works | ⬜ | Verify POST request + 200 response |
| 3. Step 2 saves and progresses | ⬜ | Check progress bar updates |
| 4. Complete profile → 100% | ⬜ | Verify `completed_data=TRUE` |
| 5. "I'll Do This Later" → banner | ⬜ | Check banner appears |
| 6. Banner "Complete Now" works | ⬜ | Wizard reopens with data |
| 7. Dismiss banner persists | ⬜ | Check localStorage flag |
| 8. Data persists after logout | ⬜ | Close browser + reopen |
| 9. Mobile responsiveness | ⬜ | Test 3 viewport sizes |
| 10. Error validation works | ⬜ | Test all required fields |
| 11. Direct URL navigation | ⬜ | Manual ?welcome=true test |
| 12. Database verification | ⬜ | Check Supabase table |

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Mark this feature as **COMPLETE**
2. Update `ONBOARDING_FLOW_IMPLEMENTATION.md` with test results
3. Ask StepTen for UX feedback:
   - Is the wizard too intrusive?
   - Is the banner helpful or annoying?
   - Should we add password strength meter to signup form?
4. Consider enhancements:
   - Add progress percentage (granular calculation)
   - Add "Skip this step" for Step 2 (make salary optional)
   - Add keyboard shortcuts (ESC to close, Enter to submit)

### If Tests Fail ❌
1. Document **exact failure scenario**
2. Check browser console for errors
3. Check Network tab for API failures
4. Fix bugs using Edit tool
5. Re-run failed test scenarios
6. Update this checklist with fixes

---

## 📝 Test Results Section

_Copy this section and fill it out during testing:_

### Test Results - [Date: YYYY-MM-DD]

**Tester**: [Your Name]  
**Browser**: [Chrome/Firefox/Safari] [Version]  
**Device**: [Desktop/Mobile] [OS]

| Scenario | Pass/Fail | Notes |
|----------|-----------|-------|
| 1. Wizard appears after signup | ⬜ Pass / ⬜ Fail |  |
| 2. Step 1 auto-save | ⬜ Pass / ⬜ Fail |  |
| 3. Step 2 auto-save | ⬜ Pass / ⬜ Fail |  |
| 4. Profile completion | ⬜ Pass / ⬜ Fail |  |
| 5. "I'll Do This Later" | ⬜ Pass / ⬜ Fail |  |
| 6. Banner "Complete Now" | ⬜ Pass / ⬜ Fail |  |
| 7. Dismiss banner | ⬜ Pass / ⬜ Fail |  |
| 8. Data persistence | ⬜ Pass / ⬜ Fail |  |
| 9. Mobile responsive | ⬜ Pass / ⬜ Fail |  |
| 10. Error handling | ⬜ Pass / ⬜ Fail |  |
| 11. Direct URL | ⬜ Pass / ⬜ Fail |  |
| 12. Database verification | ⬜ Pass / ⬜ Fail |  |

**Overall Grade**: ⬜ A+ / ⬜ A / ⬜ B / ⬜ C / ⬜ F

**Critical Bugs Found**: [None / List bugs]

**Recommendations**: [What should be improved/fixed]

---

## 🔗 Quick Links

- **Dev Server**: http://localhost:3001/home
- **Dashboard**: http://localhost:3001/candidate/dashboard
- **Profile Page**: http://localhost:3001/candidate/profile
- **Supabase Dashboard**: [Your Supabase URL]
- **Implementation Doc**: `ONBOARDING_FLOW_IMPLEMENTATION.md`
- **Auth Flow Report**: `AUTH_PROFILE_FLOW_REPORT.md`

---

**END OF TESTING GUIDE** ✅
