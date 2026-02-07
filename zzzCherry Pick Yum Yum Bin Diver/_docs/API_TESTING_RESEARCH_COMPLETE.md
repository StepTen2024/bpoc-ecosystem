# API Testing - Complete Research & Plan

**Date:** 2026-01-26
**Status:** Research Complete - Ready to Test

---

## 🎯 Executive Summary

You already have a **fully-functional API testing simulator** built into your platform at `/developer/api-simulator`. Here's what exists and what needs to be built:

### ✅ What Already Exists

1. **API Simulator UI** - Full testing interface at `/developer/api-simulator`
2. **V1 API Routes** - Complete REST API for agencies
3. **Database Tables** - All necessary tables including `job_matches`
4. **Job Creation** - Working (both internal and via API)
5. **Job Application** - Candidates can view and apply to jobs
6. **Test Data Generators** - Mock data for agencies, jobs, candidates

### ❌ What's Missing (THIS IS THE WORK)

1. **Job Matching Algorithm** - Table exists, NO automatic matching logic
2. **Matching Trigger** - Nothing triggers matches when jobs are created
3. **Match Score Calculation** - AI function exists but never called

---

## 📁 What I Found - File by File

### 1. API Simulator (Already Built!)

**Location:** `/developer/api-simulator`

**Components:**
```
src/app/(admin)/developer/api-simulator/
├── page.tsx              # Main simulator page (4 tabs)
├── components/
    ├── ApiTester.tsx     # Test API endpoints
    ├── WebhookMonitor.tsx # Monitor webhook deliveries
    ├── TestDataViewer.tsx # View test data
    └── Documentation.tsx  # API docs
```

**Database Tables:**
```sql
- developer_test_agencies    # Track test agencies
- webhook_test_logs          # Monitor webhooks
- api_test_requests          # Request/response history
```

**Features:**
- ✅ Create test agencies with API keys
- ✅ Test all V1 API endpoints
- ✅ Monitor webhook deliveries
- ✅ View test data
- ✅ Auto-generated API documentation

**Mock Data:** `src/lib/api-simulator/mock-data.ts`
- Generate mock jobs
- Generate mock candidates
- Generate API keys
- Create test agencies

---

### 2. V1 API Routes (Production-Ready)

**Base:** `/api/v1/`

**Complete Endpoints:**

#### Jobs API
```
GET    /api/v1/jobs              # List jobs
GET    /api/v1/jobs/[id]         # Get job details
POST   /api/v1/jobs/create       # Create job (agency)
PUT    /api/v1/jobs/[id]/approve # Approve job (admin)
```

#### Applications API
```
POST   /api/v1/applications      # Submit application
GET    /api/v1/applications/[id] # Get application details
POST   /api/v1/applications/invite # Invite candidate
```

#### Candidates API
```
POST   /api/v1/candidates        # Create/update candidate
GET    /api/v1/candidates/[id]   # Get candidate details
```

#### Clients API
```
GET    /api/v1/clients           # List agency clients
POST   /api/v1/clients/get-or-create # Get or create client
```

#### Interviews API
```
POST   /api/v1/interviews        # Schedule interview
GET    /api/v1/interviews/availability # Get availability
```

#### Offers API
```
POST   /api/v1/offers            # Create offer
POST   /api/v1/offers/[id]/sign  # Sign offer
POST   /api/v1/offers/[id]/counter # Counter offer
```

**Authentication:** X-API-Key header

---

### 3. Job Matching System (INCOMPLETE)

#### What Exists

**Database Table:** `job_matches`
```sql
CREATE TABLE job_matches (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  job_id UUID REFERENCES jobs(id),
  match_score INTEGER,       # 0-100
  status TEXT,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Query Functions:** `src/lib/db/matches/queries.supabase.ts`
```typescript
- getMatchesByCandidate()  # Get candidate's matches
- getMatchCountByCandidate() # Count matches
```

**AI Matching Function:** `src/lib/ai.ts`
```typescript
AIService.matchCandidateToJobs(candidateProfile, jobs)
// Returns: matches with scores and reasons
// Uses OpenAI GPT-4 for intelligent matching
```

#### What's Missing

**❌ NO Automatic Matching Trigger**
- Job created → No matches generated
- Candidate profile updated → No matches generated
- Nothing populates the `job_matches` table

**❌ NO Matching Algorithm Integration**
- AI function exists but is never called
- No background job to generate matches
- No webhook to trigger matching

**❌ NO Match Score Calculation**
- Table has match_score column
- But scores are never calculated or stored

---

### 4. Candidate Job Flow (Working)

**Location:** `/candidate/jobs`

**Flow:**
1. Candidate navigates to Jobs page
2. Sees list of all active jobs (NOT matched - just all jobs)
3. Can search, filter by work type, shift, salary
4. Clicks "Apply Now" button
5. Application submitted via `/api/candidate/applications`
6. Application tracked in `job_applications` table

**Issue:** Candidates see ALL jobs, not matched jobs. No personalization.

---

### 5. Job Creation Flow (Working)

#### Internal (Recruiter)
**Location:** `/recruiter/jobs/create`
- Recruiter fills form
- Job created in `jobs` table
- Status: `pending` (requires admin approval)

#### External (Agency via API)
**Endpoint:** `POST /api/v1/jobs/create`
**Headers:** `X-API-Key: {agency_api_key}`
**Body:**
```json
{
  "clientId": "uuid",
  "title": "Customer Service Rep",
  "description": "...",
  "requirements": ["..."],
  "salaryMin": 25000,
  "salaryMax": 35000,
  "workArrangement": "remote",
  "shift": "day",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "job": { "id": "...", "title": "...", ... }
}
```

---

## 🔥 The Missing Piece: Job Matching

### Current State
```
Agency creates job
    ↓
Job saved to database
    ↓
❌ NOTHING HAPPENS
    ↓
Candidate manually searches all jobs
```

### Desired State
```
Agency creates job
    ↓
Job saved to database
    ↓
✅ MATCHING TRIGGERED AUTOMATICALLY
    ↓
AI analyzes job vs all candidates
    ↓
Scores calculated (0-100)
    ↓
Matches saved to job_matches table
    ↓
Candidates see personalized matches
```

---

## 🎬 Complete Test Flow Plan

### Phase 1: Test Existing API (No Code Changes)

**Goal:** Verify current API works via simulator

**Steps:**
1. Navigate to `http://localhost:3001/developer/api-simulator`
2. Create a test agency (generates API key)
3. Test job creation via API
4. Test application submission via API
5. Verify data in database

**Success Criteria:**
- ✅ Agency created with API key
- ✅ Job created via API appears in jobs table
- ✅ Application submitted successfully
- ✅ Webhook logs captured

---

### Phase 2: Build Job Matching Algorithm

**Goal:** Populate `job_matches` table automatically

**What to Build:**

#### Option A: Trigger on Job Creation (Real-time)
```typescript
// File: src/app/api/v1/jobs/create/route.ts
// After job is created:

// 1. Fetch all active candidates
const candidates = await getActiveCandidates();

// 2. For each candidate, calculate match
for (const candidate of candidates) {
  const profile = await getCandidateProfile(candidate.id);

  // 3. Use AI to score the match
  const matchResult = await AIService.matchCandidateToJobs(
    profile,
    [newJob]
  );

  // 4. Save match if score > threshold (e.g., 60%)
  if (matchResult.matches[0].matchScore >= 60) {
    await createJobMatch({
      candidate_id: candidate.id,
      job_id: newJob.id,
      match_score: matchResult.matches[0].matchScore,
      status: 'active'
    });
  }
}
```

#### Option B: Batch Job (Scheduled)
```typescript
// File: src/app/api/cron/generate-matches/route.ts
// Run every hour via cron

export async function GET() {
  // 1. Get jobs created in last hour
  const newJobs = await getRecentJobs();

  // 2. Get all active candidates
  const candidates = await getActiveCandidates();

  // 3. Generate matches in bulk
  await generateMatchesForJobs(newJobs, candidates);

  return new Response('OK');
}
```

#### Option C: Simple Algorithm (No AI - Fast)
```typescript
function calculateSimpleMatch(candidate, job) {
  let score = 0;

  // Location match (30 points)
  if (candidate.location === job.location) score += 30;

  // Work arrangement match (20 points)
  if (candidate.preferred_work_setup === job.work_arrangement) score += 20;

  // Shift match (20 points)
  if (candidate.preferred_shift === job.shift) score += 20;

  // Salary match (30 points)
  if (candidate.expected_salary_min <= job.salary_max &&
      candidate.expected_salary_max >= job.salary_min) {
    score += 30;
  }

  return score; // 0-100
}
```

**Recommendation:** Start with Option C (simple algorithm), then enhance with AI later.

---

### Phase 3: Test Complete Flow

**Goal:** End-to-end test of job creation → matching → candidate sees matches

**Steps:**

1. **Setup Test Data**
   - Create 5 test candidates with diverse profiles
   - Each candidate has: location, work preferences, salary expectations

2. **Create Job via API**
   ```bash
   POST /api/v1/jobs/create
   # Job: CSR, Remote, Day shift, 25k-35k PHP
   ```

3. **Verify Matching Triggered**
   - Check `job_matches` table
   - Should have 2-5 matches (candidates with score > 60)

4. **Test Candidate View**
   - Login as test candidate
   - Navigate to `/candidate/jobs`
   - Should see matched jobs at top (sorted by match_score)

5. **Test Application**
   - Candidate applies to matched job
   - Verify `job_applications` table updated

6. **Test Webhook**
   - Check `webhook_test_logs` table
   - Verify webhook fired for application

**Success Criteria:**
- ✅ Job created via API
- ✅ Matches generated automatically
- ✅ Candidates see personalized matches
- ✅ Application flow works
- ✅ Webhooks fire correctly

---

## 🎨 UI Mockup: Before vs After Matching

### Before (Current State)
```
┌─────────────────────────────────────┐
│ All Jobs (127 available)            │
├─────────────────────────────────────┤
│ 🔍 Search jobs...                   │
│                                     │
│ [Remote] [Day Shift] [Filter]      │
├─────────────────────────────────────┤
│ Customer Service Rep                │
│ Company X · Remote · 25k-35k        │
│ [Apply Now]                         │
├─────────────────────────────────────┤
│ Data Entry Specialist               │
│ Company Y · Hybrid · 20k-30k        │
│ [Apply Now]                         │
└─────────────────────────────────────┘
```

### After (With Matching)
```
┌─────────────────────────────────────┐
│ 🎯 Your Matched Jobs (5)            │
├─────────────────────────────────────┤
│ ⭐ 94% Match                        │
│ Customer Service Rep                │
│ Company X · Remote · 25k-35k        │
│ ✅ Location match · Salary match    │
│ [Apply Now]                         │
├─────────────────────────────────────┤
│ ⭐ 87% Match                        │
│ Technical Support                   │
│ Company Z · Remote · 28k-38k        │
│ ✅ Work setup match · Shift match   │
│ [Apply Now]                         │
├─────────────────────────────────────┤
│ Browse All Jobs (127 total)        │
│ [See All Jobs →]                    │
└─────────────────────────────────────┘
```

---

## 📋 Implementation Checklist

### Step 1: Simple Matching Algorithm (2-3 hours)
- [ ] Create `/api/jobs/generate-matches` endpoint
- [ ] Implement simple scoring algorithm (location, salary, shift, work setup)
- [ ] Test with 5 test candidates and 1 test job
- [ ] Verify `job_matches` table populated

### Step 2: Auto-trigger on Job Creation (1 hour)
- [ ] Hook matching into `POST /api/v1/jobs/create`
- [ ] Test via API simulator
- [ ] Verify matches generated automatically

### Step 3: Update Candidate Jobs UI (2 hours)
- [ ] Fetch matches from `job_matches` table
- [ ] Sort jobs by match_score
- [ ] Display match percentage badge
- [ ] Show match reasons (location match, salary match, etc.)

### Step 4: Test Complete Flow (1 hour)
- [ ] Create test agency via simulator
- [ ] Create job via API
- [ ] Login as test candidate
- [ ] See matched jobs
- [ ] Apply to job
- [ ] Verify application in database

### Step 5: Enhance with AI (Optional - 2 hours)
- [ ] Integrate `AIService.matchCandidateToJobs()`
- [ ] Compare AI scores vs simple algorithm
- [ ] Use AI for match reasons (more detailed)

**Total Time: 6-8 hours for complete implementation**

---

## 🚀 Quick Start: Test Existing API Right Now

**No code changes needed - test what exists:**

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to API Simulator:**
   ```
   http://localhost:3001/developer/api-simulator
   ```

3. **Create Test Agency:**
   - Click "Test Data" tab
   - Click "Create Test Agency"
   - Copy the generated API key

4. **Test Job Creation:**
   - Click "API Tester" tab
   - Select "POST /api/v1/jobs/create"
   - Paste API key in X-API-Key header
   - Use sample payload (provided in UI)
   - Click "Send Request"

5. **Verify in Database:**
   - Open Supabase dashboard
   - Check `jobs` table
   - See newly created job

**That's it! API already works. Now we just need to add matching.**

---

## 📊 Database Schema Reference

### Relevant Tables

```sql
-- Jobs created by agencies
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  agency_client_id UUID,
  title TEXT,
  description TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  work_arrangement TEXT, -- remote, hybrid, onsite
  shift TEXT,            -- day, night, flexible
  status TEXT,           -- active, closed, draft
  created_at TIMESTAMPTZ
);

-- Matches (EMPTY - needs population)
CREATE TABLE job_matches (
  id UUID PRIMARY KEY,
  candidate_id UUID,
  job_id UUID,
  match_score INTEGER,  -- 0-100
  status TEXT,
  created_at TIMESTAMPTZ
);

-- Applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY,
  job_id UUID,
  candidate_id UUID,
  status TEXT,         -- applied, screening, interview, offer, hired
  created_at TIMESTAMPTZ
);

-- Test candidates (already created)
SELECT id, email, username, first_name, last_name
FROM candidates
WHERE email LIKE '%testbpo%';
```

---

## 🎯 Recommended Next Action

**START HERE:** Test the existing API simulator (15 minutes)

1. Open `http://localhost:3001/developer/api-simulator`
2. Create a test agency
3. Create a job via API
4. See it work end-to-end

**THEN:** Build the matching algorithm (6-8 hours total)

Let me know when you're ready and I'll start implementing the matching algorithm step-by-step.

---

## Questions to Answer Before Building

1. **Matching Threshold:** What minimum match score should trigger a match? (Suggest: 60%)

2. **Matching Trigger:** Real-time (when job created) or batch (hourly cron)? (Suggest: Real-time for now)

3. **Algorithm Type:** Simple rules-based or AI-powered? (Suggest: Start simple, enhance with AI later)

4. **UI Location:** Show matches on dashboard or dedicated page? (Suggest: Dedicated "Matched Jobs" page)

5. **Notifications:** Email candidates about new matches? (Suggest: Later phase)

---

**Ready to proceed?** Let me know and I'll start building the matching algorithm.
