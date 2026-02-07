# BPOC Admin Panel - Recruitment Flow Audit

## Executive Summary

The Admin panel is designed as a **monitoring/oversight** dashboard. Admins can view all recruitment activities but should **NOT** be the primary actors in the workflow. The actual recruitment flow is driven by:

1. **Agencies/Clients** → Create jobs
2. **Recruiters** → Pre-screen, interview, release to client
3. **Clients** → Interview, make offers
4. **Candidates** → Apply, interview, negotiate, accept

---

## 🔴 CRITICAL ISSUE: Admin Has Too Many Actions

Currently, the Admin panel has **action buttons** that shouldn't exist:

| Page | Current Actions | Should Be |
|------|-----------------|-----------|
| `/admin/jobs` | "Post New Job", "Approve", "Pause", "Edit", "Delete" | **VIEW ONLY** + Approve/Reject pending jobs |
| `/admin/applications` | "Review", "Reject" | **VIEW ONLY** (status changes should come from recruiter) |
| `/admin/offers` | POST (Create Offer), PATCH (Update) | **VIEW ONLY** |
| `/admin/interviews` | POST (Schedule), PATCH (Update) | **VIEW ONLY** |

---

## 📊 The Complete Recruitment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BPOC RECRUITMENT PIPELINE                            │
└─────────────────────────────────────────────────────────────────────────────┘

                         WHO DOES WHAT
                         ─────────────

┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: JOB CREATION                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Agency/Client Portal                    BPOC Admin                          │
│  ────────────────────                    ──────────                          │
│  ✅ Create job posting                   👁️ VIEW jobs                        │
│  ✅ Set requirements                     👁️ See pending approval jobs        │
│  ✅ Attach to agency_client              ✅ APPROVE/REJECT jobs (ONLY ACTION)│
│  ✅ Submit for approval                                                      │
│                                                                              │
│  Job Status Flow:                                                            │
│  pending_approval → (admin approves) → active                                │
│                  → (admin rejects)  → rejected                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: CANDIDATE APPLICATION                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Candidate Portal                        BPOC Admin                          │
│  ────────────────                        ──────────                          │
│  ✅ Browse active jobs                   👁️ VIEW all applications            │
│  ✅ Apply to job (status: submitted)     👁️ See candidate info               │
│  ✅ Upload resume                        👁️ See which job applied to         │
│  ✅ Add cover note                       ❌ SHOULD NOT change status         │
│                                                                              │
│  Application Status: submitted                                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 3: RECRUITER PRE-SCREENING                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Recruiter Portal                        BPOC Admin                          │
│  ────────────────                        ──────────                          │
│  ✅ View applications (detailed=true)    👁️ VIEW applications                │
│  ✅ Review resume, AI score, DISC        👁️ See recruiter notes              │
│  ✅ Mark as "under_review"               👁️ See status changes               │
│  ✅ Add recruiter_notes                  ❌ SHOULD NOT modify                │
│  ✅ Shortlist candidates                                                     │
│  ✅ Reject unsuitable candidates                                             │
│                                                                              │
│  Status Flow: submitted → under_review → shortlisted/rejected                │
│                                                                              │
│  API: POST /api/recruiter/applications/:id/* (status updates)                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 4: RECRUITER INTERVIEWS (BPOC R1 & R2)                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Recruiter Portal                        BPOC Admin                          │
│  ────────────────                        ──────────                          │
│  ✅ Schedule screening interview         👁️ VIEW all interviews              │
│  ✅ Conduct video call (Daily.co)        👁️ See interview status             │
│  ✅ Record interview outcome             👁️ See scheduled/completed          │
│  ✅ Pass/Fail candidate                  ❌ SHOULD NOT schedule              │
│  ✅ Schedule Round 2 if needed           ❌ SHOULD NOT update outcome        │
│                                                                              │
│  Interview Types:                                                            │
│  - screening (Round 1)                                                       │
│  - technical (Round 2)                                                       │
│  - final (Client Interview - see next stage)                                 │
│                                                                              │
│  Status Flow: shortlisted → interview_scheduled → interviewed                │
│                                                                              │
│  API: POST /api/recruiter/applications (creates interview)                   │
│        POST /api/recruiter/interviews                                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 5: RELEASE TO CLIENT (RECRUITER GATE)                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Recruiter Portal                        BPOC Admin                          │
│  ────────────────                        ──────────                          │
│  ✅ Release application to client        👁️ VIEW released_to_client flag    │
│  ✅ Select which calls to share          👁️ See released_at timestamp       │
│  ✅ Mark released_to_client = true       👁️ See released_by recruiter       │
│                                                                              │
│  This is the "Recruiter Gate" - Client cannot see candidate until recruiter  │
│  explicitly releases them after pre-screening.                               │
│                                                                              │
│  API: POST /api/recruiter/applications/:id/release                           │
│        Body: { share_calls_with_client: [...], share_calls_with_candidate }  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 6: CLIENT INTERVIEW                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Client Portal                           BPOC Admin                          │
│  ─────────────                           ──────────                          │
│  ✅ View released candidates             👁️ VIEW client interview scheduled │
│  ✅ Schedule "final" interview           👁️ See interview outcome           │
│  ✅ Conduct interview                    ❌ SHOULD NOT intervene             │
│  ✅ Record feedback                                                          │
│  ✅ Pass/Fail decision                                                       │
│                                                                              │
│  Interview Type: "final" or "client"                                         │
│                                                                              │
│  Pipeline Stage: "final" (Client Interview)                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 7: OFFER CREATION                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Recruiter Portal (on behalf of client)  BPOC Admin                          │
│  ──────────────────────────────────────  ──────────                          │
│  ✅ Create job offer                     👁️ VIEW all offers                  │
│  ✅ Set salary, benefits, start date     👁️ See offer status                 │
│  ✅ Send offer to candidate              👁️ See sent/viewed/responded        │
│  ✅ Set expiry date                      ❌ SHOULD NOT create offers         │
│                                                                              │
│  Offer Fields:                                                               │
│  - salary_offered, currency, salary_type                                     │
│  - start_date, benefits_offered, additional_terms                            │
│  - expires_at                                                                │
│                                                                              │
│  Status: sent → viewed → accepted/rejected/countered                         │
│                                                                              │
│  API: POST /api/recruiter/offers                                             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 8: OFFER NEGOTIATION (COUNTER OFFERS)                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Candidate Portal                        BPOC Admin                          │
│  ────────────────                        ──────────                          │
│  ✅ View offer details                   👁️ VIEW all counter offers          │
│  ✅ Accept offer                         👁️ See negotiation stats            │
│  ✅ Reject offer                         👁️ See % increase requested         │
│  ✅ Counter offer (new salary request)   👁️ See acceptance rate              │
│                                                                              │
│  Recruiter Portal                                                            │
│  ────────────────                                                            │
│  ✅ View counter offer                                                       │
│  ✅ Accept counter (update offer)                                            │
│  ✅ Reject counter                                                           │
│  ✅ Make new offer (final offer)                                             │
│                                                                              │
│  Counter Offer Fields:                                                       │
│  - requested_salary, requested_currency                                      │
│  - candidate_message, employer_response                                      │
│  - status: pending/accepted/rejected                                         │
│                                                                              │
│  API: POST /api/recruiter/offers/:id/counter                                 │
│        POST /api/recruiter/offers/:id/counter/accept                         │
│        POST /api/recruiter/offers/:id/counter/reject                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STAGE 9: HIRED                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Candidate Portal                        BPOC Admin                          │
│  ────────────────                        ──────────                          │
│  ✅ Accept final offer                   👁️ VIEW hired candidates            │
│  ✅ Sign contract (e-signature)          👁️ See placement stats              │
│                                                                              │
│  Recruiter Portal                                                            │
│  ────────────────                                                            │
│  ✅ Mark as hired                                                            │
│  ✅ Initiate onboarding                                                      │
│  ✅ Track placement                                                          │
│                                                                              │
│  Application Status: offer_accepted → hired                                  │
│                                                                              │
│  API: PATCH /api/recruiter/applications/:id/hired                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Admin Dashboard - What They SHOULD See

### `/admin/jobs` - Jobs Overview
| Field | Source | Admin Can |
|-------|--------|-----------|
| All job listings | `jobs` table | VIEW |
| Status (active/pending/paused/closed) | `jobs.status` | VIEW |
| Agency/Client info | `agency_clients` + `agencies` + `companies` | VIEW |
| Applicant count | `job_applications` count | VIEW |
| Created date | `jobs.created_at` | VIEW |
| **ONLY ACTION:** Approve/Reject `pending_approval` jobs | - | ✅ ACTION |

### `/admin/applications` - Applications Overview
| Field | Source | Admin Can |
|-------|--------|-----------|
| Candidate name, email, avatar | `candidates` table | VIEW |
| Job applied to | `jobs` table | VIEW |
| Application status | `job_applications.status` | VIEW |
| Applied date | `job_applications.created_at` | VIEW |
| Released to client? | `job_applications.released_to_client` | VIEW |
| Recruiter notes | `job_applications.recruiter_notes` | VIEW |

### `/admin/interviews` - Interviews Overview
| Field | Source | Admin Can |
|-------|--------|-----------|
| Interview type | `job_interviews.interview_type` | VIEW |
| Status | `job_interviews.status` | VIEW |
| Outcome | `job_interviews.outcome` | VIEW |
| Scheduled date/time | `job_interviews.scheduled_at` | VIEW |
| Duration | `job_interviews.duration_minutes` | VIEW |
| Meeting link | `job_interviews.meeting_link` | VIEW |

### `/admin/offers` - Offers Overview
| Field | Source | Admin Can |
|-------|--------|-----------|
| Salary offered | `job_offers.salary_offered` | VIEW |
| Status | `job_offers.status` | VIEW |
| Sent/Viewed/Responded dates | `job_offers.*_at` | VIEW |
| Candidate response | `job_offers.candidate_response` | VIEW |

### `/admin/counter-offers` - Negotiations Overview
| Field | Source | Admin Can |
|-------|--------|-----------|
| Original vs Requested salary | `counter_offers` | VIEW |
| Percentage increase | Calculated | VIEW |
| Status | `counter_offers.status` | VIEW |
| Messages | `counter_offers.candidate_message` | VIEW |
| Platform stats (avg increase, acceptance rate) | Aggregated | VIEW |

---

## 🔧 Required Code Changes

### 1. Remove Admin Actions from Jobs Page

```tsx
// src/app/(admin)/admin/jobs/page.tsx

// REMOVE: "Post New Job" button
// REMOVE: Edit, Delete, Pause dropdown items
// KEEP: "Approve" button ONLY for pending_approval jobs
// KEEP: "Reject" button ONLY for pending_approval jobs
```

### 2. Remove Admin Actions from Applications Page

```tsx
// src/app/(admin)/admin/applications/page.tsx

// REMOVE: "Review" button
// REMOVE: "Reject" button  
// KEEP: Only view details link
```

### 3. Admin API - Jobs Approval Only

```typescript
// src/app/api/admin/jobs/route.ts

// KEEP: GET (view jobs)
// REMOVE OR RESTRICT: Any POST/PATCH for creating/editing jobs
// ADD: PATCH for approve/reject pending_approval jobs ONLY

export async function PATCH(request: NextRequest) {
  // Only allow status change from pending_approval → active/rejected
  const { jobId, action } = await request.json();
  
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  
  // Get job and verify it's pending
  const job = await getJob(jobId);
  if (job.status !== 'pending_approval') {
    return NextResponse.json({ error: 'Job is not pending approval' }, { status: 400 });
  }
  
  // Update status
  const newStatus = action === 'approve' ? 'active' : 'rejected';
  // ... update job
}
```

### 4. Admin API - Applications (View Only)

```typescript
// src/app/api/admin/applications/route.ts

// KEEP: GET (view applications)
// REMOVE: PATCH (status updates should come from recruiter only)
```

### 5. Admin API - Interviews (View Only)

```typescript
// src/app/api/admin/interviews/route.ts

// KEEP: GET (view interviews)
// REMOVE: POST (create interview - recruiter only)
// REMOVE: PATCH (update interview - recruiter only)
```

### 6. Admin API - Offers (View Only)

```typescript
// src/app/api/admin/offers/route.ts

// KEEP: GET (view offers)
// REMOVE: POST (create offer - recruiter only)
// REMOVE: PATCH (update offer - recruiter only)
```

---

## 📈 Pipeline Stages Mapping

The recruiter pipeline stages from `getEmptyStages()`:

| Stage | Label | Status Values | Who Moves Here |
|-------|-------|---------------|----------------|
| `applied` | Applied | submitted, new | Candidate applies |
| `reviewing` | Reviewing | under_review | Recruiter starts review |
| `shortlisted` | Shortlisted | shortlisted, qualified | Recruiter shortlists |
| `round_1` | BPOC R1 | interview_scheduled | Recruiter schedules screening |
| `round_2` | BPOC R2 | (2nd recruiter interview) | Recruiter schedules round 2 |
| `final` | Client Interview | (client interview scheduled) | Released to client, client interviews |
| `offer_sent` | Offer Sent | offer_sent | Recruiter sends offer |
| `hired` | Hired | hired, accepted | Candidate accepts, marked hired |

---

## ✅ Summary of Admin Capabilities

### Admin CAN:
- 👁️ View all jobs, applications, interviews, offers, counter-offers
- 👁️ See platform-wide analytics and stats
- 👁️ Monitor pipeline progress across all agencies
- ✅ **Approve/Reject** jobs in `pending_approval` status
- 👁️ Access audit logs of all admin actions
- 👁️ View candidate profiles and assessments
- 👁️ Access agency and client information

### Admin CANNOT (should not):
- ❌ Create jobs (agency/recruiter does this)
- ❌ Edit/Delete jobs (agency/recruiter does this)
- ❌ Change application status (recruiter does this)
- ❌ Schedule interviews (recruiter does this)
- ❌ Create offers (recruiter does this)
- ❌ Respond to counter-offers (recruiter does this)
- ❌ Release candidates to client (recruiter does this)
- ❌ Mark candidates as hired (recruiter does this)

---

## 🔔 Admin Notifications Audit

### Current State
- **URL:** `/admin/notifications`
- **UI Structure:** Single list view, no tabs.
- **Capabilities:** View list, Mark as read, Link to action.

### 🔴 Missing Capabilities
1. **Broadcast UI:**
   - **Backend:** `POST /api/admin/notifications/broadcast` exists and handles targeting (Candidate/Recruiter/Agency).
   - **Frontend:** **MISSING.** Admin cannot currently send messages/updates from the panel.
   
2. **Feedback/Reporting:**
   - **Current Flow:** One-way (Admin/System → User).
   - **Missing:** Users (Recruiters/Candidates) cannot "Report" issues or send feedback that appears in Admin notifications.
   - **Current Error Handling:** System errors go to `/admin/errors`, not notifications.

### Notification Ecosystem
| Type | Trigger | Recipient | Action |
|------|---------|-----------|--------|
| `new_signup` | New user registers | Admin | View Candidate |
| `incoming_call` | Video call started | Recruiter/Candidate | Join Call |
| `job_invite` | Recruiter invites candidate | Candidate | **Accept/Decline** Buttons |
| `interview_reminder` | 15 mins before call | Recruiter/Candidate | View Interview |
| `broadcast` | Admin sends message | Target Role/All | View Message |

---

## 🚀 Action Items

1. **Remove CreateJobModal** from admin/jobs page
2. **Remove action buttons** from admin/applications page (except view details)
3. **Add approval flow** to admin/jobs for pending jobs only
4. **Remove POST/PATCH** from admin/offers and admin/interviews APIs
5. **Add `pending_approval` status** handling to job creation flow
6. **Update admin sidebar** to reflect "View-Only" nature of most sections

---

## ✅ IMPLEMENTED (January 12, 2026)

All recommended changes have been implemented:

| Component | Change | Status |
|-----------|--------|--------|
| `admin/jobs` page | Removed CreateJobModal, kept only Approve/Reject for pending jobs | ✅ Done |
| `admin/applications` page | Removed all action buttons, view only | ✅ Done |
| `admin/interviews` page | Removed Pass/Fail/Offer buttons, view only | ✅ Done |
| `admin/offers` page | Removed all actions, shows counter-offer info | ✅ Done |
| `/api/admin/jobs` | Added PATCH for approve/reject pending only | ✅ Done |
| `/api/admin/applications` | Removed PATCH, GET only | ✅ Done |
| `/api/admin/interviews` | Removed POST/PATCH, GET only | ✅ Done |
| `/api/admin/offers` | Removed POST/PATCH, GET only | ✅ Done |

---

*Generated: January 12, 2026*
*Last Updated: January 12, 2026 - Changes Implemented*

