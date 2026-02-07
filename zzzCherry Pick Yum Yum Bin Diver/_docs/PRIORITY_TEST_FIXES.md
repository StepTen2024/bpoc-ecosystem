# 🚨 PRIORITY TEST FIXES - CRITICAL BLOCKERS

**Date**: 2026-01-20
**Source**: Actual functional test execution results
**Full Report**: `ACTUAL_FUNCTIONAL_AUDIT_REPORT.md`
**Test Pass Rate**: 75% (6/8 tests passed)

---

## ⚡ QUICK SUMMARY

**Tests Run**: 8 functional tests
**Passed**: 6 tests (75%)
**Failed**: 2 tests (25%)

**Critical Finding**: Signup form has **0 visible input fields**

---

## 🔴 BLOCKER #1: SIGNUP FORM - 0 INPUT FIELDS

**Status**: CRITICAL - Blocks all new user registrations
**Test**: AUDIT 1 failed
**File**: `src/app/auth/signup/page.tsx`

**What the test found**:
```
✓ Navigated to /auth/signup
Found 0 input fields on page:
❌ Expected: email input, password input
❌ Actual: 0 inputs found
```

**Screenshot**: `test-results/signup-form-state.png`

### Fix Steps:

1. **Navigate to page in browser**:
   ```
   http://localhost:3001/auth/signup
   ```

2. **Check if form is visible** - Are email/password inputs showing?

3. **Common causes**:
   - Form wrapped in conditional render that's false
   - CSS hiding fields (display: none, visibility: hidden)
   - JavaScript not hydrating
   - Terms modal blocking form

4. **Quick fix example**:
   ```typescript
   // ❌ Bad - form hidden if showForm is false
   {showForm && (
     <form>
       <input type="email" />
     </form>
   )}

   // ✅ Good - form always visible
   <form>
     <input
       type="email"
       data-testid="signup-email-input"
       className="block w-full"
     />
     <input
       type="password"
       data-testid="signup-password-input"
       className="block w-full"
     />
   </form>
   ```

5. **Verify fix**:
   ```bash
   npm run test:e2e tests/e2e/full_platform_audit.spec.ts -g "AUDIT 1"
   ```

---

## 🔴 BLOCKER #2: CANDIDATE LOGIN TIMEOUT

**Status**: CRITICAL - Blocks all candidate testing
**Test**: AUDIT 2 failed
**File**: `src/app/home/page.tsx` or login modal component

**What the test found**:
```
🤖 Harness: Logging in as Candidate...
TimeoutError: page.fill: Timeout 10000ms exceeded.
- waiting for locator('input[type="email"]')

Location: fixtures/harness.ts:57:20
```

**Problem**: Email input not found at `/home?login=true`

### Fix Steps:

1. **Navigate to page in browser**:
   ```
   http://localhost:3001/home?login=true
   ```

2. **Check if login modal appears**

3. **Verify email/password inputs are visible**

4. **Common causes**:
   - Modal not opening at /home?login=true
   - Inputs inside modal hidden
   - Modal animation preventing interaction

5. **Quick fix example**:
   ```typescript
   // Ensure modal opens on ?login=true
   useEffect(() => {
     const params = new URLSearchParams(window.location.search);
     if (params.get('login') === 'true') {
       setShowLogin(true);
     }
   }, []);

   // Ensure inputs are visible
   <input
     type="email"
     data-testid="login-email-input"
     className="block w-full" // Must be visible!
   />
   ```

6. **Verify fix**:
   ```bash
   npm run test:e2e tests/e2e/full_platform_audit.spec.ts -g "AUDIT 2"
   ```

---

## 🟠 HIGH PRIORITY: EMPTY DATABASE

**Status**: Blocks 80% of testing
**Test**: AUDIT 3, 6, 7 found no data
**Action**: Create test data seeding script

**What the test found**:
```
Jobs found: 0
Applications found: 0
Cannot test: Job browsing, applications, recruitment workflow
```

### Fix Steps:

1. **Create seeding script**: `scripts/seed-test-data.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  // Create 10 test candidates
  const candidateIds = [];
  for (let i = 0; i < 10; i++) {
    const { data } = await supabase
      .from('candidates')
      .insert({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: `test.candidate.${i}@bpoc.test`,
        phone: faker.phone.number('+639#########'),
        location: 'Manila, Philippines',
        status: 'active',
      })
      .select('id')
      .single();
    if (data) candidateIds.push(data.id);
  }
  console.log(`✅ Created ${candidateIds.length} candidates\n`);

  // Create 20 test jobs
  const jobIds = [];
  for (let i = 0; i < 20; i++) {
    const { data } = await supabase
      .from('jobs')
      .insert({
        title: faker.helpers.arrayElement([
          'Software Engineer',
          'Customer Service Rep',
          'Product Manager',
        ]),
        description: faker.lorem.paragraphs(2),
        requirements: [faker.lorem.sentence()],
        salary_min: 50000,
        salary_max: 100000,
        location: 'Manila, Philippines',
        status: 'active',
        employment_type: 'full-time',
      })
      .select('id')
      .single();
    if (data) jobIds.push(data.id);
  }
  console.log(`✅ Created ${jobIds.length} jobs\n`);

  // Create 30 test applications
  let appCount = 0;
  for (const candidateId of candidateIds.slice(0, 6)) {
    const jobsToApply = faker.helpers.arrayElements(jobIds, 5);
    for (const jobId of jobsToApply) {
      const { error } = await supabase
        .from('applications')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          status: faker.helpers.arrayElement([
            'submitted',
            'reviewing',
            'shortlisted',
          ]),
        });
      if (!error) appCount++;
    }
  }
  console.log(`✅ Created ${appCount} applications\n`);

  console.log('🎉 Test data seeding complete!');
}

seedTestData()
  .catch(console.error)
  .finally(() => process.exit());
```

2. **Add to package.json**:
```json
{
  "scripts": {
    "seed:test": "tsx scripts/seed-test-data.ts"
  }
}
```

3. **Install tsx if needed**:
```bash
npm install -D tsx
```

4. **Run seeding**:
```bash
npm run seed:test
```

5. **Verify fix**:
```bash
npm run test:e2e tests/e2e/full_platform_audit.spec.ts -g "AUDIT 3"
# Should now find jobs!
```

---

## 🟡 MEDIUM PRIORITY: API RETURNS 500

**Status**: Job fetching fails
**Test**: AUDIT 4 found API error
**File**: `src/app/api/jobs/route.ts`

**What the test found**:
```
GET /api/jobs - Status: 500
❌ Unexpected status code
```

### Fix Steps:

1. **Add proper error handling**:
```typescript
// src/app/api/jobs/route.ts
export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

2. **Test in browser**:
```
http://localhost:3001/api/jobs
```

3. **Should return**: `{ "jobs": [...] }` with status 200

---

## 🟡 MEDIUM PRIORITY: ADD data-testid

**Status**: Tests are fragile
**Impact**: Makes tests more reliable

**Files to update**:
- `src/components/jobs/JobCard.tsx`
- `src/components/applications/ApplicationCard.tsx`
- All form inputs

### Quick Fixes:

```typescript
// Job card
<div data-testid="job-card" data-job-id={job.id}>
  <h3 data-testid="job-title">{job.title}</h3>
  <button data-testid="job-apply-btn">Apply</button>
</div>

// Application card
<div data-testid="application-card">
  <span data-testid="app-status">{status}</span>
  <button data-testid="app-review-btn">Review</button>
</div>

// Form inputs
<input
  type="email"
  data-testid="signup-email-input"
/>
<input
  type="password"
  data-testid="signup-password-input"
/>
```

---

## ✅ VERIFICATION CHECKLIST

### After Signup Form Fix:
- [ ] Navigate to `http://localhost:3001/auth/signup`
- [ ] Email and password inputs are visible
- [ ] Fill form and submit
- [ ] Account created successfully
- [ ] Run test: `npm run test:e2e` - AUDIT 1 passes

### After Login Fix:
- [ ] Navigate to `http://localhost:3001/home?login=true`
- [ ] Login modal appears
- [ ] Email and password inputs visible
- [ ] Can login successfully
- [ ] Run test: `npm run test:e2e` - AUDIT 2 passes

### After Test Data:
- [ ] Created `scripts/seed-test-data.ts`
- [ ] Ran `npm run seed:test`
- [ ] Supabase has 20+ jobs, 10+ candidates, 30+ applications
- [ ] Run test: `npm run test:e2e` - AUDIT 3 finds jobs

---

## 📊 EXPECTED RESULTS

**Current**:
- Total: 8 tests
- Passed: 6 (75%)
- Failed: 2 (25%)

**After P0 Fixes**:
- Total: 8 tests
- Passed: 8 (100%) ✅
- Failed: 0 (0%)

---

## 🚀 QUICK START

**Fix all blockers** (estimated 4-7 hours):

```bash
# 1. Fix signup form
# Edit: src/app/auth/signup/page.tsx
# Ensure inputs are visible, add data-testid

# 2. Fix login modal
# Edit: src/app/home/page.tsx
# Ensure modal opens, inputs visible

# 3. Create seed script
npm install -D tsx
# Create: scripts/seed-test-data.ts
npm run seed:test

# 4. Fix API
# Edit: src/app/api/jobs/route.ts
# Add try/catch, error logging

# 5. Run tests
npm run test:e2e

# Expected: 8/8 tests passing ✅
```

---

## 🎯 PRIORITY ORDER

1. **Fix signup form** (1-2 hours) - Most critical
2. **Fix login modal** (1-2 hours) - Blocks testing
3. **Create seed script** (2-3 hours) - Blocks 80% of tests
4. **Fix API endpoint** (1 hour) - Quick win
5. **Add data-testid** (2-3 hours) - Nice to have

**Total estimated time**: 7-11 hours

---

## 📞 NEED HELP?

**Test still failing?**
```bash
# Run with UI debugger
npm run test:e2e:ui

# View trace file
npx playwright show-trace test-results/**/*.zip
```

**Can't find file?**
```bash
# Find signup page
find src -name "*signup*"

# Find login component
find src -name "*login*"

# Find job API
find src -path "*/api/jobs/*"
```

---

**Full Report**: `ACTUAL_FUNCTIONAL_AUDIT_REPORT.md`
**Test Results**: `test-results/results.json`
**Screenshots**: `test-results/*.png`
