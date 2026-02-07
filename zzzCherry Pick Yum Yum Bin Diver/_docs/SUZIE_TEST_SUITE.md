# SUZIE TEST SUITE
## Chaos Testing for Confused Users

**Testing Philosophy**: "Suzie" is our persona for users who fundamentally misunderstand how the platform works. She makes illogical choices, skips steps, uploads wrong files, and clicks buttons without reading. If Suzie can break it, real users will.

---

## TEST CATEGORIES

### 1. AUTHENTICATION CHAOS

#### Test: Wrong Role Portal Access
**Scenario**: Suzie signs up as a Candidate but tries to access Recruiter features
- Navigate to `/recruiter/dashboard` while logged in as candidate
- Expected: Redirect to correct dashboard OR clear permission denied message
- **Current Risk**: Silent redirect with no explanation

#### Test: Bookmark Deep Link as Guest
**Scenario**: Suzie finds `/candidate/games/personality` while signed in, bookmarks it, then tries to access as guest
- Save bookmark while authenticated
- Log out
- Access bookmark
- Expected: Login prompt with explanation OR guest access with limitations
- **Current Risk**: Silent redirect to home with no context

#### Test: Account Exists But User Forgot
**Scenario**: Suzie signed up months ago, forgot, tries to sign up again with same email
- Sign up with email `test@example.com`
- Log out
- Try to sign up again with same email
- Expected: Clear message "You already have an account. Try signing in instead."
- **Current Risk**: Error message only after form submission

#### Test: Session Expires During Multi-Step Process
**Scenario**: Suzie starts resume upload, goes to lunch, comes back, session expired
- Start resume upload process
- Wait for token expiration (or manually expire)
- Try to continue to next step
- Expected: Re-authentication prompt with data preserved
- **Current Risk**: Data loss with no warning

---

### 2. RESUME UPLOAD CHAOS

#### Test: Upload Wrong File Type
**Scenario**: Suzie uploads her vacation photo thinking it's her resume
- Upload `vacation.jpg` (not a document)
- Expected: Clear error "Please upload a resume document (PDF, DOC, or DOCX)"
- **Current Risk**: Accepts JPG, tries to OCR, gives poor results

#### Test: Upload Massive File
**Scenario**: Suzie uploads a 50MB PDF with images
- Upload 50MB PDF
- Expected: Instant validation "File too large. Max 10MB."
- **Current Risk**: Upload completes, then error after waiting

#### Test: Skip to Analysis Without Uploading
**Scenario**: Suzie navigates directly to `/candidate/resume/analysis` via URL
- Manually navigate to analysis page
- Expected: Redirect back to upload OR show empty state
- **Current Risk**: Might show stale data or crash

#### Test: Upload Same Resume Twice
**Scenario**: Suzie uploads resume, forgets, uploads again
- Upload `resume.pdf`
- Go back to upload page
- Upload same `resume.pdf` again
- Expected: Detect duplicate, offer to use existing OR overwrite
- **Current Risk**: Creates duplicate entries

#### Test: Clear Browser Data Mid-Process
**Scenario**: Suzie extracts resume as guest, clears cookies, then tries to continue
- Start resume extraction as guest
- Clear localStorage manually
- Try to view analysis
- Expected: Graceful error or prompt to re-upload
- **Current Risk**: Data lost, page broken

#### Test: Upload Encrypted PDF
**Scenario**: Suzie uploads password-protected PDF
- Upload password-protected PDF
- Expected: Error "Cannot read encrypted PDFs. Please upload unprotected version."
- **Current Risk**: Processing might hang or fail silently

---

### 3. JOB CREATION CHAOS

#### Test: Create Job Without Selecting Client
**Scenario**: Suzie fills entire job form but forgets to select client
- Fill job title, description, requirements
- Skip client dropdown
- Click "Continue to Step 2"
- Expected: Clear validation "Please select a client before continuing"
- **Current Risk**: Error only shown after clicking continue

#### Test: Skip Step 2 Then Go Back
**Scenario**: Suzie generates AI description, clicks "Skip AI", then goes back to edit
- Complete Step 1
- Generate AI description in Step 2
- Edit description
- Click "Skip AI and write manually"
- Go back to Step 1
- Forward to Step 2
- Expected: AI-generated text preserved
- **Current Risk**: Text might be lost

#### Test: No Clients Available
**Scenario**: New recruiter has zero clients, tries to create job
- Log in as recruiter with no clients
- Try to create job
- Expected: Clear prompt "Add your first client before posting jobs" with big CTA
- **Current Risk**: Empty dropdown with buried error message

#### Test: Wrong Currency for Agency
**Scenario**: Suzie's agency is USD-based but form defaults to PHP
- Create job with salary 50000 (thinking USD)
- Form defaults to PHP currency
- Post job
- Expected: Confirmation "You're posting salary in PHP. Is this correct?"
- **Current Risk**: Job posted in wrong currency with no warning

#### Test: Post Job with Zero Salary
**Scenario**: Suzie leaves salary fields blank
- Fill all required fields
- Leave salary min/max empty
- Post job
- Expected: Warning "No salary info provided. Continue?"
- **Current Risk**: Job posted without salary, confuses candidates

#### Test: Access Another Agency's Client
**Scenario**: Suzie guesses client ID in URL to access other agency
- Get client ID from another agency (via API inspection)
- Try to create job with that client ID
- Expected: Clear permission error "This client doesn't belong to your agency"
- **Current Risk**: Generic 400 error, unclear why

---

### 4. APPLICATION STATUS CHAOS

#### Test: Accept Interview Invitation Twice
**Scenario**: Suzie clicks "Accept" button twice (impatient)
- Accept interview invitation
- Click "Accept" again before page updates
- Expected: Second click ignored OR message "Already accepted"
- **Current Risk**: Error "Cannot accept invite with status: submitted"

#### Test: Withdraw Application After Offer Sent
**Scenario**: Suzie gets offer but clicks "Withdraw" by mistake
- Apply to job
- Receive offer
- Click "Withdraw Application"
- Expected: Confirmation dialog "You have an active offer. Are you sure?"
- **Current Risk**: Instant withdrawal, no undo

#### Test: Apply Without Complete Profile
**Scenario**: Suzie applies to job with 50% profile completion
- Fill profile partially
- Try to apply to job
- Expected: Clear requirements "Complete your profile to apply: [Missing fields]"
- **Current Risk**: Unclear what's required

#### Test: Check Application Status Every 5 Minutes
**Scenario**: Suzie refreshes application page 50 times in one hour (anxious)
- Apply to job
- Refresh page repeatedly
- Expected: Rate limiting OR cached results
- **Current Risk**: 50 database queries, performance hit

---

### 5. CONTRACT & SIGNING CHAOS

#### Test: Access Contract URL Before It Exists
**Scenario**: Suzie guesses contract URL before offer is sent
- Get application ID
- Navigate to `/recruiter/contracts/{applicationId}` before contract created
- Expected: 404 with message "Contract not found for this application"
- **Current Risk**: Blank page or infinite loading

#### Test: Sign Contract Without Reading
**Scenario**: Suzie immediately signs without scrolling through contract
- Open contract signing page
- Click "Sign" button immediately
- Expected: Require scroll to bottom OR "Read entire contract first" message
- **Current Risk**: Might allow instant signing

#### Test: Both Parties Try to Sign Simultaneously
**Scenario**: Suzie (candidate) and recruiter both click "Sign" at same time
- Open contract on two devices (candidate + recruiter)
- Click "Sign" on both at same moment
- Expected: One succeeds, other gets "Already signed" OR both succeed with proper locking
- **Current Risk**: Race condition might cause duplicate signatures

---

### 6. FORM VALIDATION CHAOS

#### Test: Copy-Paste Spaces in Email Field
**Scenario**: Suzie copies email with trailing space "test@example.com "
- Paste email with whitespace
- Submit form
- Expected: Auto-trim whitespace OR validation error
- **Current Risk**: Might create account with invalid email

#### Test: Password is "password"
**Scenario**: Suzie uses weakest possible password
- Enter password "password" or "123456"
- Submit sign-up form
- Expected: Strength check "Password too weak. Add numbers/symbols."
- **Current Risk**: Might be accepted if it's 6+ characters

#### Test: Terms Scroll Detection on Mobile
**Scenario**: Suzie uses mobile, terms dialog is short, "scroll to bottom" already true
- Open sign-up form on mobile
- Terms fit on screen without scrolling
- Expected: Auto-enable continue button OR require tap acknowledgment
- **Current Risk**: Might be confusing if button is still disabled

#### Test: Submit Form with Enter Key Mid-Field
**Scenario**: Suzie presses Enter while editing middle field in multi-field form
- Fill first name field
- Press Enter
- Expected: Move to next field OR show validation errors for incomplete form
- **Current Risk**: Form might submit prematurely

---

### 7. FILE UPLOAD CHAOS (General)

#### Test: Upload Corrupted File
**Scenario**: Suzie uploads partially downloaded or corrupted PDF
- Upload corrupted/incomplete file
- Expected: Validation error "File is corrupted or unreadable"
- **Current Risk**: Processing might crash or hang

#### Test: Upload Zero-Byte File
**Scenario**: Suzie accidentally selects empty file
- Create 0-byte file
- Upload it
- Expected: Error "File is empty. Please upload a valid document."
- **Current Risk**: Accepted and processing fails silently

#### Test: Upload While Offline
**Scenario**: Suzie starts upload, loses internet connection mid-upload
- Start file upload
- Disconnect network
- Expected: Error "Network error. Please check connection and try again."
- **Current Risk**: Infinite loading or silent failure

#### Test: Upload Filename with Special Characters
**Scenario**: Suzie uploads "Résumé (Final) [2024]!.pdf"
- Upload file with special chars in name
- Expected: Accept file, sanitize filename, or reject with clear error
- **Current Risk**: Might break file storage/retrieval

---

### 8. MULTI-STEP PROCESS CHAOS

#### Test: Browser Back Button Mid-Process
**Scenario**: Suzie clicks browser back button in step 2 of 3
- Complete step 1
- Start step 2
- Click browser back button
- Expected: Return to step 1 with data preserved OR warning "Progress will be lost"
- **Current Risk**: State might be lost

#### Test: Open Two Tabs with Same Multi-Step Form
**Scenario**: Suzie opens job creation in two tabs, edits both
- Open `/recruiter/jobs/create` in tab 1
- Open same URL in tab 2
- Edit in tab 1, submit
- Edit in tab 2, submit
- Expected: Last submission wins OR conflict detection
- **Current Risk**: Data race, one submission might overwrite other

#### Test: Refresh Page Mid-Process
**Scenario**: Suzie hits F5 during step 2 of resume upload
- Start resume upload
- Complete step 1
- Refresh page on step 2
- Expected: Resume progress OR prompt to restart
- **Current Risk**: All progress lost

---

### 9. PAYMENT/SALARY CONFUSION

#### Test: Enter Salary in Wrong Currency Format
**Scenario**: Suzie enters "50,000" instead of "50000"
- Enter salary with comma: "50,000"
- Submit form
- Expected: Auto-parse OR validation "Please enter numbers only"
- **Current Risk**: parseInt might fail, salary becomes NaN

#### Test: Salary Min > Salary Max
**Scenario**: Suzie enters min: 80000, max: 50000 (backwards)
- Enter salary min: 80000
- Enter salary max: 50000
- Submit
- Expected: Validation "Minimum cannot be greater than maximum"
- **Current Risk**: Might accept backwards range

#### Test: Negative Salary
**Scenario**: Suzie enters "-50000" (typo)
- Enter negative salary
- Submit
- Expected: Validation "Salary must be positive"
- **Current Risk**: Might accept negative value

---

### 10. ANONYMOUS SESSION CHAOS

#### Test: Sign Up After Guest Session
**Scenario**: Suzie uses platform as guest, then creates account
- Complete resume analysis as guest
- Click "Sign up"
- Create account
- Expected: Guest data merged into new account
- **Current Risk**: Silent merge failure, data lost

#### Test: Multiple Guest Sessions in Different Browsers
**Scenario**: Suzie starts on phone, switches to desktop, both as guest
- Start resume upload on mobile browser
- Switch to desktop browser
- Start new guest session
- Expected: Separate sessions OR prompt "Continue previous session?"
- **Current Risk**: Conflicting anonymous sessions

#### Test: Guest Session Expires
**Scenario**: Suzie starts resume as guest, leaves for 2 days, returns
- Start guest session
- Wait 48 hours
- Try to continue
- Expected: Session expired message, offer to restart
- **Current Risk**: Stale data or broken page

---

### 11. ROLE & PERMISSION CHAOS

#### Test: Admin Tries Candidate Features
**Scenario**: Suzie is admin but wants to apply to jobs
- Log in as admin
- Navigate to `/candidate/applications`
- Expected: Permission denied OR offer to create candidate profile
- **Current Risk**: Silent redirect or broken page

#### Test: Recruiter Switched Agencies
**Scenario**: Suzie was in Agency A, moved to Agency B, tries to access old jobs
- Log in as recruiter
- Have user agency changed in database
- Try to access old application from previous agency
- Expected: Permission error "This application belongs to another agency"
- **Current Risk**: 404 error, looks like bug

#### Test: Candidate Tries Recruiter API Directly
**Scenario**: Suzie inspects network tab, tries to call recruiter API as candidate
- Log in as candidate
- Use browser console to call `/api/recruiter/jobs/create`
- Expected: 403 Forbidden with clear message
- **Current Risk**: 401 Unauthorized without context

---

### 12. NO CONFIRMATION CHAOS

#### Test: Accidental Rejection Click
**Scenario**: Suzie tries to click "Shortlist" but misclicks "Reject"
- View candidate application
- Click "Reject" by mistake
- Expected: Confirmation dialog "Are you sure you want to reject [Name]?"
- **Current Risk**: Instant rejection, no undo

#### Test: Delete Video Recording Accidentally
**Scenario**: Suzie hovers over delete button, cat jumps on keyboard
- View video recordings list
- Click "Delete"
- Expected: Confirmation "This cannot be undone. Delete recording?"
- **Current Risk**: Instant deletion

#### Test: Withdraw Application by Mistake
**Scenario**: Suzie clicks wrong button
- View application
- Click "Withdraw"
- Expected: Confirmation "Withdraw your application for [Job Title]?"
- **Current Risk**: Instant withdrawal

---

## PRIORITY TESTS TO IMPLEMENT FIRST

### High Priority (P0) - Security/Data Loss
1. Wrong file type uploads causing crashes
2. Anonymous session data loss after signup
3. Multi-step form data loss on navigation
4. Contract race conditions
5. Role permission bypasses via URL manipulation

### Medium Priority (P1) - User Confusion
6. Wrong role redirect without explanation
7. Job creation without client
8. Application status double-click bugs
9. Salary field validation (backwards ranges, wrong format)
10. Guest session expiration handling

### Low Priority (P2) - Polish
11. Form field whitespace handling
12. Browser back button during multi-step
13. Duplicate form submissions in multiple tabs
14. File upload progress indication
15. Terms scroll detection on mobile

---

## HOW TO RUN SUZIE TESTS

### Setup
```bash
# Install dependencies
npm install

# Set up test environment
cp .env.test.local.example .env.test.local

# Start dev server
npm run dev
```

### Run Tests
```bash
# Run all Suzie chaos tests
npm run test:e2e tests/e2e/suzie-chaos/

# Run specific category
npm run test:e2e tests/e2e/suzie-chaos/authentication.spec.ts

# Run with UI for debugging
npm run test:e2e:ui tests/e2e/suzie-chaos/
```

### Generate New Suzie Test
```bash
npm run generate:test e2e tests/e2e/suzie-chaos/new-chaos-scenario.spec.ts
```

---

## SUCCESS CRITERIA

A test PASSES if:
- Error is caught and user sees helpful message
- Data loss is prevented
- User is guided to correct action
- No crashes or infinite loading

A test FAILS if:
- Silent failures occur
- User sees generic error with no guidance
- Data is lost without warning
- Application crashes
- Race conditions cause corrupt state

---

## REPORTING SUZIE BUGS

When a Suzie test finds a bug, report using this format:

```markdown
**Bug**: [Short title]
**Severity**: High/Medium/Low
**Test File**: tests/e2e/suzie-chaos/[file].spec.ts:[line]
**User Impact**: [What happens to confused user]
**Current Behavior**: [What happens now]
**Expected Behavior**: [What should happen]
**Reproduction Steps**:
1. Step 1
2. Step 2
3. Bug occurs

**Recommended Fix**: [Code change or UX improvement]
```

---

## PHILOSOPHY

> "If Suzie can't figure it out, it's not user error - it's a design error."

Every Suzie test represents a real user who will encounter this confusion. Our goal is not to mock confused users, but to build a platform so clear and robust that even illogical actions result in helpful guidance rather than crashes or data loss.

---

**Last Updated**: 2026-01-19
**Status**: Specification Complete, Implementation Pending
**Total Test Scenarios**: 50+
**Test Categories**: 12
