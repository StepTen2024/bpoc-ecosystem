# Onboarding Wizard - Testing Guide

## ✅ Issues Fixed

### Root Cause
All 8 step API endpoints were using the regular `supabase` client which was blocked by Row Level Security (RLS) policies. This caused 500 errors when trying to update onboarding records.

### Solution Applied
Updated all step API endpoints to use `supabaseAdmin` client which bypasses RLS:
- ✅ `/api/onboarding/personal-info`
- ✅ `/api/onboarding/resume`
- ✅ `/api/onboarding/gov-ids`
- ✅ `/api/onboarding/education`
- ✅ `/api/onboarding/medical`
- ✅ `/api/onboarding/data-privacy`
- ✅ `/api/onboarding/signature`
- ✅ `/api/onboarding/emergency-contact`

Each endpoint now:
1. Uses regular `supabase` client for authentication (session check)
2. Uses `supabaseAdmin` client for database operations (bypasses RLS)
3. Includes proper error handling and logging

## 🧪 How to Test

### Prerequisites
- Dev server running: `npm run dev` (on port 3001)
- Test candidate: **Jennifer Tuason**
  - Email: `jennifer.tuason@testbpo.com`
  - Password: `testtest1`
  - Candidate ID: `3a89a2fc-df10-49f4-8c75-56adf939f7ce`

### Manual Testing Steps

#### 1. Navigate to Test Page
```
http://localhost:3001/test/onboarding
```

#### 2. Log In (if not already logged in)
```
http://localhost:3001/auth/signin
Email: jennifer.tuason@testbpo.com
Password: testtest1
```

#### 3. Launch the Wizard
- Click "Launch Onboarding Wizard" button
- This creates/resets the onboarding record for testing
- Wizard modal should open with Step 1

#### 4. Test Each Step

##### Step 1: Personal Info
**Required Fields:**
- First Name
- Last Name
- Gender (dropdown)
- Civil Status (dropdown)
- Date of Birth (must be 18+)
- Contact Number
- Email
- Complete Address

**Test Data:**
```
First Name: Jennifer
Middle Name: Marie
Last Name: Tuason
Gender: Female
Civil Status: Single
Date of Birth: 1995-06-15
Contact Number: +63 912 345 6789
Email: jennifer.tuason@testbpo.com
Address: 123 Test Street, Makati City, Metro Manila 1200
```

**Expected Result:**
- ✅ Form submits successfully
- ✅ Toast notification: "Personal information saved!"
- ✅ Automatically advances to Step 2
- ✅ Progress bar updates to 12.5%

---

##### Step 2: Resume
**Required:**
- Resume file upload (PDF or DOCX, max 5MB)

**Expected Result:**
- ✅ File uploads to Supabase storage
- ✅ Form submits successfully
- ✅ Advances to Step 3
- ✅ Progress bar updates to 25%

**Note:** If file upload fails, check Supabase storage buckets and RLS policies.

---

##### Step 3: Government IDs
**Required Fields (Philippines specific):**
- SSS Number (format: XX-XXXXXXX-X)
- TIN (format: XXX-XXX-XXX-XXX)
- PhilHealth Number (format: XX-XXXXXXXXX-X)
- Pag-IBIG Number (format: XXXX-XXXX-XXXX)
- Document uploads for each ID
- Valid ID photo

**Test Data:**
```
SSS: 12-3456789-0
TIN: 123-456-789-000
PhilHealth: 12-123456789-0
Pag-IBIG: 1234-5678-9012
```

**Expected Result:**
- ✅ Validates ID formats
- ✅ Requires all document uploads
- ✅ Form submits successfully
- ✅ Advances to Step 4
- ✅ Progress bar updates to 37.5%

---

##### Step 4: Education
**Required:**
- Education Level (dropdown)
- Education Document (diploma/transcript)

**Test Data:**
```
Education Level: Bachelor's Degree
```

**Expected Result:**
- ✅ Form submits successfully
- ✅ Advances to Step 5
- ✅ Progress bar updates to 50%

---

##### Step 5: Medical Clearance
**Required:**
- Medical Certificate (upload)
- Medical Notes (optional)

**Expected Result:**
- ✅ Form submits successfully
- ✅ Advances to Step 6
- ✅ Progress bar updates to 62.5%

---

##### Step 6: Data Privacy Consent
**Required:**
- Accept Philippines Data Privacy Act 2012 consent

**Expected Result:**
- ✅ Checkbox must be checked to proceed
- ✅ Timestamp recorded (data_privacy_signed_at)
- ✅ Advances to Step 7
- ✅ Progress bar updates to 75%

---

##### Step 7: Digital Signature
**Required:**
- Canvas signature (draw with mouse/touch)

**Expected Result:**
- ✅ Signature can be drawn and cleared
- ✅ Signature converts to image and uploads
- ✅ Timestamp recorded (signature_date)
- ✅ Advances to Step 8
- ✅ Progress bar updates to 87.5%

---

##### Step 8: Emergency Contact
**Required Fields:**
- Emergency Contact Name
- Relationship
- Phone Number

**Test Data:**
```
Name: Maria Tuason
Relationship: Mother
Phone: +63 912 987 6543
```

**Expected Result:**
- ✅ Form submits successfully
- ✅ Progress bar updates to 100%
- ✅ All steps show green checkmark
- ✅ is_complete flag set to true

---

### Navigation Testing

#### Test Step Navigation
1. Click on any step in the progress bar → Should jump to that step
2. Click "Previous" button → Should go back one step
3. Click "Next" button → Should advance one step (without saving)
4. Click "I'll Do This Later" → Should close wizard without saving

#### Test Progress Indicators
- Pending steps: Gray with white/10 border
- Current step: Orange background and border
- Submitted steps: Cyan background
- Approved steps: Green background with checkmark icon

---

## 🔍 Database Verification

### Check Onboarding Status
Run this script to check Jennifer's current onboarding status:

```bash
node check-jennifer-onboarding.js
```

**Expected Output:**
```
✅ Candidate found: Jennifer Tuason
✅ Found 1 onboarding record
   Completion: X%
   Step Status:
   1. Personal Info:      SUBMITTED/APPROVED
   2. Resume:             SUBMITTED/APPROVED
   ...
```

### Manual SQL Check
```sql
SELECT
    c.first_name || ' ' || c.last_name as full_name,
    co.completion_percent,
    co.is_complete,
    co.personal_info_status,
    co.resume_status,
    co.gov_id_status,
    co.education_status,
    co.medical_status,
    co.data_privacy_status,
    co.signature_status,
    co.emergency_contact_status
FROM candidates c
JOIN candidate_onboarding co ON c.id = co.candidate_id
WHERE c.id = '3a89a2fc-df10-49f4-8c75-56adf939f7ce';
```

---

## 🐛 Common Issues & Solutions

### Issue: 500 Error on Step Submit
**Cause:** RLS policy blocking update
**Solution:** All endpoints now use `supabaseAdmin` - this should be fixed

### Issue: File Upload Fails
**Cause:** Supabase storage bucket permissions
**Solution:** Check storage RLS policies for `candidate_documents` bucket

### Issue: Wizard Won't Open
**Cause:** create-test endpoint failing
**Solution:** Check server logs and ensure job applications exist in database

### Issue: Session Expired
**Cause:** User not logged in or session expired
**Solution:** Log in again at `/auth/signin`

---

## 📊 Test Scenarios

### Happy Path
1. ✅ Create test onboarding
2. ✅ Complete all 8 steps in order
3. ✅ Verify 100% completion
4. ✅ Verify all statuses are SUBMITTED
5. ✅ Verify data persisted in database

### Edge Cases

#### Incomplete Submission
1. Fill Step 1 partially
2. Click "Next" without saving
3. Expected: Should move to Step 2 but Step 1 remains PENDING

#### Resume Existing Progress
1. Complete Steps 1-3
2. Close wizard (click "I'll Do This Later")
3. Reopen wizard
4. Expected: Should resume at Step 4 (first incomplete step)

#### Invalid Data
1. Enter invalid SSS number (wrong format)
2. Try to submit
3. Expected: Validation error shown

#### Age Validation
1. Enter DOB that makes user under 18
2. Try to submit
3. Expected: Error: "Must be 18 years or older"

---

## ✨ Success Criteria

The onboarding wizard is working correctly if:

1. ✅ Wizard opens without errors
2. ✅ All 8 steps can be completed
3. ✅ Data persists in database after each step
4. ✅ Progress bar updates correctly
5. ✅ Status indicators show correct colors
6. ✅ Navigation works (Previous/Next/Jump to step)
7. ✅ File uploads work for all document fields
8. ✅ Validation works (age, ID formats, required fields)
9. ✅ Toast notifications appear on save
10. ✅ Completion reaches 100% after Step 8

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Check database status
node check-jennifer-onboarding.js

# Test API endpoints
node test-onboarding-api.js

# Reset Jennifer's onboarding (SQL)
UPDATE candidate_onboarding SET
  personal_info_status = 'PENDING',
  gov_id_status = 'PENDING',
  education_status = 'PENDING',
  medical_status = 'PENDING',
  data_privacy_status = 'PENDING',
  resume_status = 'PENDING',
  signature_status = 'PENDING',
  emergency_contact_status = 'PENDING',
  completion_percent = 0,
  is_complete = false
WHERE candidate_id = '3a89a2fc-df10-49f4-8c75-56adf939f7ce';
```

---

## 📝 Files Modified

### API Routes
- `src/app/api/onboarding/route.ts` - Already using supabaseAdmin
- `src/app/api/onboarding/personal-info/route.ts` - ✅ Fixed
- `src/app/api/onboarding/resume/route.ts` - ✅ Fixed
- `src/app/api/onboarding/gov-ids/route.ts` - ✅ Fixed
- `src/app/api/onboarding/education/route.ts` - ✅ Fixed
- `src/app/api/onboarding/medical/route.ts` - ✅ Fixed
- `src/app/api/onboarding/data-privacy/route.ts` - ✅ Fixed
- `src/app/api/onboarding/signature/route.ts` - ✅ Fixed
- `src/app/api/onboarding/emergency-contact/route.ts` - ✅ Fixed

### Test Utilities
- `test-onboarding-api.js` - API endpoint tester
- `check-jennifer-onboarding.js` - Database status checker
- `ONBOARDING_WIZARD_TEST_GUIDE.md` - This file

---

**Status**: ✅ All fixes applied - Ready for testing
**Date**: 2026-01-27
**Tested By**: _Pending manual testing_
