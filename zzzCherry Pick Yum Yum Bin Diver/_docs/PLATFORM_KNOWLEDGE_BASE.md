# BPOC RECRUITMENT PLATFORM - COMPLETE KNOWLEDGE BASE

> **Last Updated**: 2026-01-19
> **Version**: 1.0
> **Purpose**: Comprehensive documentation of all platform flows, architecture, and implementation status

---

## EXECUTIVE SUMMARY

The BPOC platform is a full-stack recruitment system that powers agencies and their clients through a three-tier system:
- **Candidates**: Job seekers with profiles, resume management, and application tracking
- **Recruiters**: Agency staff managing the recruitment pipeline with quality control via the "Recruiter Gate"
- **Clients**: Companies that post jobs and hire directly or through screened candidates
- **Admins**: BPOC internal team providing platform oversight

The platform operates on **Next.js 15.4.8** with **React 19.1.0**, using **Supabase PostgreSQL** for data, and **Daily.co** for video interviews.

---

## TABLE OF CONTENTS

1. [Platform Architecture](#platform-architecture)
2. [Candidate Journey (12 Steps)](#candidate-journey-12-steps)
3. [Recruiter Workflow](#recruiter-workflow)
4. [Admin/Agency Flow](#adminagency-flow)
5. [Database Schema Overview](#database-schema-overview)
6. [API Endpoints Map](#api-endpoints-map)
7. [Components & UI Structure](#components--ui-structure)
8. [Key Implementation Gaps](#key-implementation-gaps)
9. [Technology Stack](#technology-stack)

---

## PLATFORM ARCHITECTURE

### Role Hierarchy

```
BPOC ADMIN (Platform Oversight)
    ↓
AGENCY (ShoreAgents, etc.)
    ├─→ RECRUITER (Agency Staff - Quality Control)
    └─→ CLIENT (Companies - Hiring)
        ↓
    CANDIDATE (Job Seekers - Talent Pool)
```

### Two Paths to Hire

**Path 1: Normal Application Flow (with Recruiter Gate)**
- Candidate applies → Recruiter pre-screens → Gate controls visibility → Client sees only released candidates

**Path 2: Direct Talent Pool (Bypass Screening)**
- Client browses all candidates → Requests interview directly → Skips recruiter screening

### Core Tables & Relationships

```
candidates → candidate_profiles (1:1)
    ↓
job_applications (hub for everything below)
    ├→ video_call_rooms (pre-screens, interviews, recordings)
    │   ├→ video_call_recordings
    │   └→ video_call_transcripts
    ├→ job_interviews
    ├→ job_offers (+ counter offers)
    └→ onboarding_tasks

jobs ← agency_clients
    ↓
job_applications ← candidates
```

---

## CANDIDATE JOURNEY (12 STEPS)

### 1. FIRST-TIME VISITOR LANDING
- **Routes**: `/` (homepage), `/home`, `/how-it-works`
- **Components**: Hero section, platform features, CTA to signup
- **Database**: No records created yet

### 2. SIGN UP / REGISTRATION
- **Route**: `/auth` (likely Supabase Auth UI)
- **Flow**: Email/password → Verify email → Create `candidates` record
- **Database Tables**: `candidates` (email, password hash, verification_token)
- **Status**: `email_verified = false` initially

### 3. PROFILE COMPLETION (ONBOARDING)
- **Route**: `/candidate/onboarding`
- **Components**: `ProfileCompletionModal`, multi-step form
- **Fields Required**:
  - Personal: First name, last name, phone, avatar
  - Professional: Current role, company, years of experience
  - Location: City, province, country, lat/lng
  - Work Preferences: Work setup (remote/onsite/hybrid), shift preference
  - Salary: Expected min/max, work status
  - Skills: Add skills with proficiency levels
  - Documents: Profile completion %
- **Database Tables**:
  - `candidate_profiles` (all profile fields)
  - `candidate_skills` (skill records)
- **Status**: `profile_completed = true` when finished
- **AI Features**: Resume AI analysis integration

### 4. RESUME BUILDER / UPLOAD
- **Routes**:
  - `/candidate/resume` (view resume)
  - `/candidate/resume/upload` (upload file)
  - `/candidate/resume/build` (builder interface)
  - `/candidate/resume/analysis` (AI analysis results)
- **Components**:
  - `ResumeUploadComponent`
  - `ResumeBuilderUI`
  - PDF preview + editing
- **Database Tables**:
  - `candidate_resumes` (resume records, file URLs)
  - `resume_analysis` (AI-parsed data)
- **AI Features**:
  - Resume parsing (extract education, experience)
  - Resume scoring
  - AI analysis saved to `resume_analysis` table

### 5. GAMES (OPTIONAL ASSESSMENT)
- **Routes**:
  - `/candidate/games` (games hub)
  - `/candidate/games/typing-hero` (typing speed test)
  - `/candidate/games/disc` (DISC personality test)
- **Components**: Game UI, score tracking, leaderboard
- **Database Tables**:
  - `candidate_games` or `game_sessions` (game results)
  - `candidate_typing_stats` (WPM, accuracy)
  - `candidate_disc_results` (DISC type, scores)
- **Public Routes**:
  - `/results/typing-hero/[username]` (public leaderboard)
  - `/results/bpoc-disc/[username]` (public DISC result)

### 6. JOB SEARCH
- **Route**: `/candidate/jobs` or `/jobs`
- **Components**: Job listing cards, filters, search
- **Filter Options**:
  - Keywords, skills, experience level
  - Work arrangement (remote/onsite/hybrid)
  - Salary range, location
  - Availability, shift preference
- **Database Queries**: Filter `jobs` table by status=active and candidate preferences
- **Notifications**: Save jobs (wishlist/favorites feature)

### 7. JOB APPLICATION
- **Route**: `/jobs/[id]` → Click "Apply"
- **Flow**:
  1. Candidate selects resume (if multiple)
  2. Add cover note (optional)
  3. Confirm submission
  4. Create `job_applications` record
- **Database Tables**:
  - `job_applications` (status=submitted, applied_at timestamp)
- **API Endpoint**: `POST /api/candidate/applications`
- **Notifications**: Application confirmation + "What happens next"
- **Status After**: `submitted` (hidden from client until released)

### 8. PRE-SCREENING (RECRUITER CALL)
- **Trigger**: Recruiter calls candidate
- **Types**:
  - **Scheduled**: Recruiter books time → Candidate gets reminder
  - **Quick Call**: Recruiter calls immediately → Incoming call modal
- **Candidate Experience**:
  - Real-time notification with incoming call modal
  - 60-second ring timeout
  - Answer/decline options
  - Video call via Daily.co
  - Optionally share recording/transcript
- **Database Tables**:
  - `video_call_rooms` (call_type=recruiter_prescreen)
  - `video_call_recordings` (if enabled)
  - `video_call_transcripts` (if enabled)
- **Notifications**:
  - `incoming_call` (real-time)
  - `prescreen_scheduled` (before scheduled call)
  - `prescreen_reminder` (1h before, 15min before)
  - `missed_call` (if no answer)
- **Outcomes**: Pass (released to client) / Fail (rejected) / Needs follow-up
- **Status After**: `under_review` → `shortlisted` (if passed)

### 9. INTERVIEW REQUEST / SCHEDULING
- **Trigger**:
  - **Normal Flow**: Client sees released candidate, requests interview
  - **Direct Path**: Client browses talent pool, requests interview directly
- **Flow**:
  1. Client/recruiter selects candidate
  2. Choose interview date/time
  3. System creates interview + video room
  4. Candidate gets notification
- **Database Tables**:
  - `job_interviews` (interview type, scheduled_at, status)
  - `video_call_rooms` (call_type=client_interview)
- **API Endpoints**:
  - `POST /api/v1/interviews` (create)
  - `GET /api/v1/interviews` (list)
- **Notifications**:
  - `interview_scheduled` (immediate)
  - `interview_reminder` (24h before, 1h before, 15m before)
- **Status After**: `interview_scheduled`

### 10. INTERVIEW (VIDEO CALL)
- **Route**: `/candidate/interviews` → Click "Join"
- **Experience**:
  - Join button available 15 minutes before
  - Enter video room via Daily.co
  - Optionally see recording/transcript if shared
  - Interviewer can share screen, toggle mic/camera
- **Database**: Call recorded if enabled
- **Notifications**: `interview_completed` after call ends
- **Status After**: `interviewed`

### 11. JOB OFFER
- **Trigger**: Client/recruiter sends offer after interview
- **Offer Details Candidate Sees**:
  - Salary offered (amount + currency)
  - Salary type (hourly/monthly/yearly)
  - Benefits (array)
  - Start date
  - Additional terms
  - Expiration date
- **Candidate Actions**:
  - View offer
  - Accept offer
  - Decline offer
  - Submit counter offer (different salary)
- **Database Tables**:
  - `job_offers` (status: sent → viewed → accepted/declined/negotiating)
  - `counter_offers` (if submitted)
- **API Endpoints**:
  - `GET /api/v1/candidate/offers/:id` (view)
  - `POST /api/v1/candidate/offers/:id/accept` (accept)
  - `POST /api/v1/candidate/offers/:id/decline` (decline)
  - `POST /api/v1/candidate/offers/:id/counter` (counter)
- **Notifications**:
  - `offer_received` (critical)
  - `offer_expiring` (24h before expiry, critical)
  - `counter_response` (if counter submitted)
- **Status After**: `offer_sent` → `offer_accepted` / `offer_declined` / `negotiating`

### 12. HIRING / CONTRACT SIGNING & ONBOARDING
- **Trigger**: Candidate accepts offer
- **Contract Signing**:
  - **Route**: `/candidate/contracts/[id]` or `/candidate/placement`
  - **Flow**: E-signature via DocuSign or similar
  - **Database**: `contracts` or flag on `job_applications` (contract_signed=true)
- **Onboarding Tasks**:
  - **Route**: `/candidate/onboarding`
  - **Components**: `OnboardingTaskModal`, task checklist
  - **Task Types**:
    - Document upload (ID, tax forms)
    - Form fill (emergency contact, etc.)
    - E-signature (agreements)
    - Acknowledgment (read & confirm)
  - **Candidate Actions**: Upload documents, sign, mark complete
  - **Database Tables**:
    - `onboarding_tasks` (task records with status)
    - `onboarding_task_submissions` (uploaded files)
  - **Recruiter Actions**: Review, approve, reject, mark complete
- **Status After**: `hired` → `started` (on Day 1)
- **Final Status**: `started` (success!) or `no_show` (didn't show up)

### Candidate Application Status Flow

```
submitted → under_review → shortlisted → interview_scheduled →
interviewed → offer_sent → negotiating/offer_accepted → hired → started
      ↓         ↓             ↓              ↓              ↓
   rejected   rejected      rejected       rejected      no_show
                                                      (terminal)
withdrawn (any point)
```

### Candidate Visibility & Permissions

**Candidate CAN SEE**:
- Own profile and resume
- All jobs (active listings)
- Own applications (status, timeline, calls)
- Own offers (details, counter history)
- Own interviews (scheduled, past)
- Own onboarding tasks
- Own notifications (all types)
- Call recordings/transcripts (if shared by recruiter/client)
- Feedback (if recruiter/client chooses to share)

**Candidate CANNOT SEE**:
- Other candidates
- Internal recruiter notes
- Internal ratings/scores
- Other applications
- Unreleased application details (before passed recruiter gate)
- Why they weren't shortlisted (unless shared)
- Detailed rejection reasons (unless shared)

---

## RECRUITER WORKFLOW

### Role Overview
- **Belongs to**: One agency (ShoreAgents, etc.)
- **Manages**: Multiple clients, jobs, and candidates
- **Key Function**: Gatekeeper between candidates and clients via **Recruiter Gate**
- **Full Visibility**: All candidates, applications, jobs within agency

### Main Modules

1. **Dashboard** (`/recruiter` or `/recruiter/page`)
   - Stats: Active jobs, new applications, pending interviews, offers due
   - Quick actions: New job, new client, call candidate
   - Recent activity feed
   - Pending items

2. **Clients** (`/recruiter/clients`)
   - List all clients (companies using recruitment service)
   - Create new client
   - Edit client details
   - View client's jobs and applications
   - Add internal notes about client

3. **Talent Pool** (`/recruiter/talent` or `/recruiter/candidates`)
   - Browse ALL candidates in system (not just applicants)
   - Search & filter:
     - Keywords, skills, experience level
     - Work setup, shift, location
     - Salary range, availability
     - Assessment scores (typing WPM, DISC type)
   - View full candidate profile
   - Request interview directly (skip application process)
   - Add to shortlist/favorites
   - Add notes about candidate

4. **Jobs** (`/recruiter/jobs`)
   - List jobs (all clients)
   - Create job (on behalf of client)
   - Edit job details
   - Publish/pause/close jobs
   - Mark as filled
   - Duplicate job
   - View applications by job

5. **Applications** (`/recruiter/applications`)
   - Hub for managing applications
   - View all applications (all statuses)
   - Filters: client, job, status, released/unreleased, pre-screened, rating, date
   - Application detail page shows:
     - Full candidate profile
     - Resume + AI analysis
     - Pre-screen calls (if any) with ratings, notes, recordings, transcripts
     - Recruiter internal notes
     - Release to client toggle (THE GATE)
     - Per-call sharing toggles (share with client/candidate)
     - Client notes & feedback (if released)
     - Interviews (if scheduled)
     - Offers (if sent)
     - Timeline (all events)

6. **The Recruiter Gate** (Core Feature)
   - **Default**: All applications are `released_to_client = FALSE`
   - **Process**:
     1. Candidate applies
     2. Recruiter reviews application
     3. Recruiter may conduct pre-screen call
     4. Recruiter decides: RELEASE or REJECT
     5. If RELEASE: Set `released_to_client = TRUE`
     6. Now client can see application
   - **Per-Call Sharing**:
     - Recruiter can toggle `share_with_client` per call
     - Recruiter can toggle `share_with_candidate` per call
     - When TRUE, client/candidate sees recordings, transcripts, notes for that call
   - **Send Back**: Client or recruiter can "send back" to unreleased state

7. **Pre-Screen Calls** (Recruiter Quality Control)
   - **Types**:
     - Scheduled: Book time with candidate
     - Quick call: Call candidate now
   - **During Call**:
     - See candidate video
     - Toggle own mic/camera
     - Share screen
     - View candidate profile (side panel)
     - Take notes
   - **After Call**:
     - Rate candidate (1-5 stars)
     - Add notes (what discussed, assessment)
     - Outcome: Passed / Failed / Needs follow-up
   - **Database**: `video_call_rooms` (call_type=recruiter_prescreen)

8. **Interviews** (`/recruiter/interviews`)
   - Schedule client interviews (usually after recruiter gate passed)
   - Reschedule, cancel
   - View all interviews (calendar + list)
   - Join interview as host
   - Mark no-show
   - Add outcome/feedback
   - Database: `job_interviews`

9. **Offers** (`/recruiter/offers`)
   - Create offer (salary, benefits, start date, terms)
   - Send to candidate
   - Track status (sent → viewed → accepted/declined/negotiating)
   - Handle counter offers:
     - Accept counter → Offer updated
     - Reject counter → Decline or send new offer
     - Send revised offer → New terms
   - Withdraw offer
   - Database: `job_offers`

10. **Pipeline** (`/recruiter/pipeline`)
    - Visual kanban view of applications
    - Columns: NEW → SCREENING → SHORTLIST → INTERVIEW → OFFER → HIRED
    - Drag & drop cards between columns
    - Quick actions on cards
    - Filter by client, job, recruiter

11. **Recordings** (`/recruiter/recordings` or `/recruiter/interviews/recordings`)
    - View all recordings from pre-screens and interviews
    - Filter by candidate, job, client, date, type
    - Watch recording
    - Download video
    - View transcript
    - Share/unshare with client
    - Delete recording

12. **Placements** (`/recruiter/placements`)
    - Track hired candidates through onboarding
    - Create onboarding tasks
    - Review & approve/reject tasks
    - Mark onboarding complete
    - Confirm Day 1 started or mark no-show
    - Add placement notes

13. **Team** (`/recruiter/team`)
    - View team members (other recruiters in agency)
    - Invite new recruiter (if admin)
    - Manage roles/permissions

14. **Agency Settings**
    - Agency profile/branding
    - Contact info
    - Webhooks (if Enterprise)
    - API keys (if Enterprise)

### Recruiter Key Workflows

#### Workflow A: Accept Application & Screen
1. New application comes in
2. Recruiter views application (candidate profile, resume)
3. Recruiter schedules pre-screen call or calls candidate now
4. During call: Rate candidate, take notes
5. If PASS: Release to client (`released_to_client = TRUE`)
6. If FAIL: Reject application (candidate notified)
7. If client interviews and hires → Recruiter creates onboarding tasks

#### Workflow B: Direct Talent Pool Request
1. Client browses talent pool
2. Client finds candidate they like
3. Client requests interview (bypasses recruiter screening)
4. Recruiter schedules interview directly
5. Interview happens
6. If hire → Onboarding starts

#### Workflow C: Handle Counter Offer
1. Candidate submits counter (different salary)
2. Recruiter gets notification
3. Recruiter options:
   - Accept counter → Offer marked accepted
   - Reject → Offer marked declined or send new offer
   - Send new offer → Different terms

---

## ADMIN / AGENCY FLOW

### Admin Role Overview
- **Scope**: Platform-level oversight
- **Access**: ALL data across ALL agencies
- **Primary**: Monitoring & support
- **Secondary**: Emergency intervention

### Admin Modules

1. **Dashboard** (`/admin`)
   - Platform stats: Total agencies, recruiters, candidates, jobs, applications
   - Key metrics: Time to hire, placement rate, application funnel
   - Alerts/issues
   - Recent activity

2. **Agencies** (`/admin/agencies`)
   - List all agencies
   - Agency detail view:
     - Status (active, inactive, suspended)
     - Tier (standard, enterprise)
     - Team: Recruiters, clients
     - Stats: Jobs, applications, placements
     - Recent activity
   - Actions:
     - View/edit agency
     - Suspend/reactivate
     - Change tier
     - Add internal notes
     - View all jobs/applications/recruiters for that agency

3. **Candidates** (`/admin/candidates`)
   - View ALL candidates (across all agencies)
   - Filters: Status, profile completeness, activity, applications, location
   - Candidate detail:
     - Full profile
     - Account status, email verified, phone verified
     - All applications (across all agencies)
     - Flags/issues
     - Admin notes
   - Actions:
     - Suspend/reactivate
     - Delete (GDPR)
     - Merge duplicate accounts
     - Add notes
     - Reset password
     - Verify email

4. **Jobs** (`/admin/jobs`)
   - View ALL jobs (all agencies, all clients)
   - Filters: Agency, client, status, work type, salary, date
   - Job detail:
     - Full job data
     - Agency/client context
     - Application funnel metrics (views → applicants → screened → released → interviewed → offered → hired)
   - Actions: Moderate, close, add notes

5. **Applications** (`/admin/applications`)
   - View ALL applications (all agencies, all clients, all statuses)
   - Insight into full funnel
   - Can view unreleased applications
   - Actions: Limited (mostly viewing/notes)

6. **Interviews** (`/admin/interviews`)
   - View all interviews platform-wide
   - Monitor no-shows, completion rates

7. **Offers** (`/admin/offers`)
   - View all offers platform-wide
   - Track acceptance/decline rates
   - Monitor counter-offer activity

8. **Counter-Offers** (`/admin/counter-offers`)
   - View all counter-offer activity
   - Track negotiation patterns

9. **Leaderboard** (`/admin/leaderboard`)
   - Agency rankings (placements, speed, quality)
   - Recruiter rankings (applications handled, placements)
   - Performance metrics

10. **Insights Manager** (`/admin/insights`)
    - Platform content/blog system (separate from recruitment)
    - Create insights, manage content pipeline
    - Publishing workflow

11. **Error Monitoring** (`/admin/errors`)
    - Log errors
    - Analyze error patterns
    - Track issues

12. **Notifications** (`/admin/notifications`)
    - Broadcast notifications to users
    - View notification history

13. **Settings** (`/admin/settings`)
    - Platform configuration
    - User management
    - Billing (out of scope for this doc)

### Admin Philosophy
- **Oversight not action**: View everything, but don't usually take recruitment actions
- **Support when needed**: Help agencies/candidates resolve issues
- **Emergency override**: In rare cases, can override statuses with audit trail
- **Multi-tenant isolation**: Cannot see cross-agency data without purpose

---

## DATABASE SCHEMA OVERVIEW

### Core Tables

**candidates**
- id (uuid, primary key)
- email (unique)
- first_name, last_name, full_name
- phone, avatar_url
- username, slug
- email_verified, is_active
- created_at, updated_at

**candidate_profiles**
- id (uuid, primary key)
- candidate_id (foreign key)
- bio, position, location, location_lat/lng, location_city/province/country
- current_employer, current_position, current_salary
- expected_salary_min, expected_salary_max
- work_status, notice_period_days
- preferred_shift, preferred_work_setup
- profile_completed, profile_completion_percentage
- created_at, updated_at

**candidate_skills**
- id (uuid, primary key)
- candidate_id (foreign key)
- skill_name, proficiency (beginner/intermediate/expert)
- years, is_primary
- created_at, updated_at

**jobs**
- id (uuid, primary key)
- agency_client_id (foreign key → agency_clients)
- posted_by (foreign key → recruiter user)
- title, slug, description
- requirements, responsibilities, benefits (JSONB arrays)
- salary_min, salary_max, salary_type, currency
- work_arrangement, work_type, shift, experience_level
- status (draft, active, paused, closed, filled)
- priority, application_deadline
- views, applicants_count
- created_at, updated_at

**job_applications** (HUB TABLE)
- id (uuid, primary key)
- candidate_id, job_id (foreign keys)
- resume_id (if selected)
- status (submitted, under_review, shortlisted, interview_scheduled, interviewed, offer_sent, negotiating, offer_accepted, hired, started, rejected, withdrawn, no_show)
- reviewed_by (recruiter), reviewed_at
- recruiter_notes (text)
- released_to_client (boolean, default FALSE)
- released_at, released_by
- client_notes, client_rating, client_tags
- rejection_reason, rejected_by, rejected_date
- offer_acceptance_date
- contract_signed (boolean)
- first_day_date
- started_status (hired, started, no_show)
- created_at, updated_at

**video_call_rooms**
- id (uuid, primary key)
- daily_room_name, daily_room_url, daily_room_token
- host_user_id (recruiter or client), participant_user_id (candidate)
- agency_id, job_id, application_id (foreign keys)
- interview_id (if interview, foreign key)
- call_type (recruiter_prescreen, client_interview, etc.)
- call_mode (video, phone, audio_only)
- title, description
- notes (post-call recruiter notes), rating (1-5)
- share_with_client (boolean), share_with_candidate (boolean)
- status (created, waiting, active, ended, failed)
- created_at, started_at, ended_at, duration_seconds
- enable_recording, enable_transcription
- updated_at

**video_call_recordings**
- id (uuid, primary key)
- room_id (foreign key → video_call_rooms)
- recording_url, download_url
- duration_seconds, status (processing, ready, failed)
- shared_with_candidate (boolean)
- created_at

**video_call_transcripts**
- id (uuid, primary key)
- room_id (foreign key)
- full_text, summary (AI-generated)
- key_points (array)
- shared_with_candidate (boolean)
- created_at

**job_interviews**
- id (uuid, primary key)
- application_id (foreign key)
- interview_type (recruiter_prescreen, recruiter_round_1, ..., client_round_1, ..., client_final)
- scheduled_at (UTC timestamp), duration_minutes
- client_timezone, scheduled_at_client_local, scheduled_at_ph
- location, meeting_link
- interviewer_id, interviewer_notes
- status (scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled)
- outcome (passed, failed, pending_decision, needs_followup)
- feedback (JSONB structured), rating (1-5)
- started_at, ended_at
- created_at, updated_at

**job_offers**
- id (uuid, primary key)
- application_id (foreign key)
- salary_offered, salary_type (hourly, monthly, yearly), currency
- start_date, benefits_offered (JSONB array), additional_terms
- status (draft, sent, viewed, accepted, declined, negotiating, expired, withdrawn)
- sent_at, viewed_at, responded_at, expires_at
- candidate_response, rejection_reason
- counter_offers (JSONB array of counter history)
- created_by, created_at, updated_at

**onboarding_tasks**
- id (uuid, primary key)
- application_id (foreign key)
- title, description, task_type (document_upload, form_fill, e_sign, acknowledgment, training, information)
- is_required, due_date
- status (pending, submitted, approved, rejected, overdue)
- submitted_at, reviewed_at, reviewer_notes
- attachments (array of file URLs)
- created_at, updated_at

**application_activity_timeline**
- id (uuid, primary key)
- application_id (foreign key)
- event_type (applied, under_review, prescreen_scheduled, prescreen_completed, prescreen_passed, prescreen_failed, shortlisted, interview_scheduled, interview_completed, interview_passed, interview_failed, offer_sent, offer_viewed, counter_submitted, counter_response, offer_accepted, offer_declined, hired, onboarding_started, onboarding_completed, started, rejected, withdrawn)
- description, timestamp
- metadata (JSONB for additional context)

**agencies**
- id (uuid, primary key)
- name, slug, logo_url, website, description
- contact_name, contact_email, contact_phone
- status (active, inactive, suspended, pending)
- tier (standard, enterprise)
- verified (boolean)
- created_at, updated_at

**agency_clients** (Companies under agency)
- id (uuid, primary key)
- agency_id (foreign key)
- company_id (foreign key → companies table)
- name, industry, website, logo_url
- contact_name, contact_email, contact_phone
- status (active, inactive)
- created_at, updated_at

**agencies_recruiters** (Staff at agency)
- id (uuid, primary key)
- agency_id, user_id (foreign keys)
- role, status (active, inactive)
- created_at, updated_at

**notifications**
- id (uuid, primary key)
- recipient_id (user_id), recipient_type (candidate, recruiter, client, admin)
- type (incoming_call, missed_call, application_submitted, prescreen_scheduled, interview_scheduled, offer_received, etc.)
- title, message, action_url
- related_id (application_id, offer_id, etc.), related_type
- is_read, is_urgent
- created_at, expires_at

---

## API ENDPOINTS MAP

### CANDIDATE ENDPOINTS

**Authentication**
- `POST /api/auth/signup` - Register new candidate
- `POST /api/auth/login` - Login
- `POST /api/user/sync` - Sync user data

**Profile**
- `GET /api/user/profile` - Get own profile
- `PATCH /api/user/profile` - Update profile
- `GET /api/user/resume-for-build` - Get resume for editor

**Applications**
- `GET /api/candidate/applications` - List own applications
- `GET /api/candidate/applications/:id` - Get application detail
- `POST /api/candidate/applications` - Submit application
- `POST /api/candidate/applications/:id/withdraw` - Withdraw application
- `GET /api/v1/applications/:id/card` - Full application card (v1 API)

**Offers**
- `GET /api/candidate/offers` - List own offers
- `GET /api/candidate/offers/:id` - Get offer detail
- `POST /api/candidate/offers/:id/accept` - Accept offer
- `POST /api/candidate/offers/:id/decline` - Decline offer
- `POST /api/candidate/offers/:id/counter` - Submit counter offer
- `POST /api/candidate/offers/counter/:id` - View counter details

**Interviews**
- `GET /api/candidate/interviews` - List own interviews
- `GET /api/v1/interviews/:id` - Get interview detail
- `GET /api/v1/interviews/:id/join` - Get join token/URL

**Onboarding**
- `GET /api/candidate/onboarding/tasks` - List tasks
- `GET /api/candidate/onboarding/tasks/:id` - Get task detail
- `POST /api/candidate/onboarding/tasks/:id` - Submit task
- `POST /api/candidate/placement/confirm-day-one` - Confirm Day 1 started

**Notifications**
- `GET /api/notifications` - List notifications
- `POST /api/notifications/:id/read` - Mark read
- `POST /api/notifications/read-all` - Mark all read

**Resume**
- `POST /api/candidates/resume/process` - Upload & process resume
- `POST /api/candidates/resume/save` - Save resume
- `POST /api/candidates/resume/save-extracted` - Save extracted data
- `POST /api/candidates/resume/save-final` - Save final version

**Games**
- `POST /api/candidate/games/progress` - Save game progress (typing, DISC)
- `GET /api/user/typing-stats` - Get typing stats
- `GET /api/user/disc-stats` - Get DISC stats

### RECRUITER ENDPOINTS

**Clients**
- `GET /api/recruiter/clients` - List clients
- `POST /api/recruiter/clients` - Create client
- `GET /api/recruiter/clients/:id` - Get client
- `PATCH /api/recruiter/clients/:id` - Update client

**Talent Pool**
- `GET /api/recruiter/talent` - Search candidates (talent pool)
- `GET /api/recruiter/talent/:id` - Get candidate profile
- `POST /api/recruiter/talent/:id/request-interview` - Request interview directly

**Jobs**
- `GET /api/recruiter/jobs` - List jobs
- `POST /api/recruiter/jobs/create` - Create job
- `GET /api/recruiter/jobs/:id` - Get job
- `PATCH /api/recruiter/jobs/:id` - Update job
- `DELETE /api/recruiter/jobs/:id` - Delete job
- `POST /api/recruiter/jobs/:id/approve` - Approve job (if needed)

**Applications**
- `GET /api/recruiter/applications` - List applications
- `GET /api/recruiter/applications/:id` - Get application
- `PATCH /api/recruiter/applications/:id` - Update application status
- `POST /api/recruiter/applications/:id/release` - Release to client (GATE)
- `POST /api/recruiter/applications/:id/send-back` - Send back to recruiter
- `POST /api/recruiter/applications/:id/reject` - Reject application
- `POST /api/recruiter/applications/:id/prescreen` - Schedule pre-screen
- `POST /api/recruiter/applications/:id/quick-call` - Initiate quick call
- `POST /api/recruiter/applications/:id/hired` - Mark as hired
- `POST /api/recruiter/applications/:id/client-feedback` - Receive/update client feedback

**Interviews**
- `GET /api/recruiter/interviews` - List interviews
- `POST /api/recruiter/interviews` - Schedule interview
- `PATCH /api/recruiter/interviews/:id` - Update interview
- `POST /api/recruiter/interviews/:id/cancel` - Cancel interview

**Offers**
- `GET /api/recruiter/offers` - List offers
- `POST /api/recruiter/offers` - Create/send offer
- `GET /api/recruiter/offers/:id` - Get offer
- `PATCH /api/recruiter/offers/:id` - Update offer
- `POST /api/recruiter/offers/:id/withdraw` - Withdraw offer
- `POST /api/recruiter/offers/:id/counter/accept` - Accept counter
- `POST /api/recruiter/offers/:id/counter/reject` - Reject counter

**Video / Recordings**
- `GET /api/recruiter/video/rooms` - List video calls
- `POST /api/recruiter/video/rooms` - Create video room
- `GET /api/recruiter/video/rooms/:id` - Get room (with fresh tokens)
- `PATCH /api/recruiter/video/rooms/:id` - Update room (notes, rating, sharing)
- `GET /api/recruiter/video/recordings` - List recordings
- `GET /api/recruiter/video/transcripts/:id` - Get transcript

**Onboarding**
- `GET /api/recruiter/onboarding/templates` - List onboarding templates
- `POST /api/recruiter/onboarding/from-template` - Create tasks from template
- `GET /api/recruiter/onboarding/:applicationId/complete` - Mark complete
- `POST /api/recruiter/onboarding/tasks` - Create task
- `PATCH /api/recruiter/onboarding/tasks/:id` - Review/approve task

**Placements**
- `GET /api/recruiter/placements` - List placements
- `POST /api/recruiter/placements` - Create placement

**Pipeline**
- `GET /api/recruiter/pipeline` - Get pipeline view (kanban data)

**Settings**
- `GET /api/recruiter/profile` - Get own profile
- `PATCH /api/recruiter/profile` - Update profile
- `GET /api/recruiter/team` - List team members
- `POST /api/recruiter/team/invite` - Invite team member
- `POST /api/recruiter/team/accept` - Accept team invite
- `GET /api/recruiter/agency` - Get agency info
- `POST /api/recruiter/api-key` - Get/create API key

### ADMIN ENDPOINTS

**Agencies**
- `GET /api/admin/agencies` - List agencies
- `GET /api/admin/agencies/:id` - Get agency detail
- `PATCH /api/admin/agencies/:id` - Update agency
- `POST /api/admin/agencies/:id/suspend` - Suspend agency
- `POST /api/admin/agencies/:id/reactivate` - Reactivate agency
- `POST /api/admin/agencies/reassign-recruiter` - Reassign recruiter
- `POST /api/admin/agencies/remove-recruiter` - Remove recruiter

**Candidates**
- `GET /api/admin/candidates` - List all candidates
- `GET /api/admin/candidates/:id` - Get candidate detail
- `PATCH /api/admin/candidates/:id` - Update candidate
- `POST /api/admin/candidates/:id/suspend` - Suspend candidate
- `POST /api/admin/candidates/:id/reactivate` - Reactivate candidate

**Applications**
- `GET /api/admin/applications` - List all applications
- `GET /api/admin/applications/:id` - Get application
- `PATCH /api/admin/applications/:id` - Update application

**Jobs**
- `GET /api/admin/jobs` - List all jobs
- `POST /api/admin/jobs/create` - Create job (on behalf of client)

**Interviews**
- `GET /api/admin/interviews` - List all interviews

**Offers**
- `GET /api/admin/offers` - List all offers
- `GET /api/admin/counter-offers` - List all counter offers

**Leaderboard**
- `GET /api/admin/leaderboard` - Get leaderboard data

**Dashboard**
- `GET /api/admin/dashboard/stats` - Get dashboard stats
- `GET /api/admin/check-status` - System status check

**Notifications**
- `POST /api/admin/notifications/broadcast` - Send broadcast notification
- `POST /api/admin/notifications/batch` - Send batch notifications

**Insights**
- Multiple endpoints for insights/blog management

---

## COMPONENTS & UI STRUCTURE

### Candidate Components (`/src/components/candidate/`)

1. **CandidateSidebar.tsx**
   - Navigation menu for candidate dashboard
   - Links: Dashboard, Applications, Jobs, Interviews, Offers, Onboarding, Profile, Settings

2. **CandidateApplicationCard.tsx**
   - Card showing single application
   - Status, job title, company, timeline
   - Quick actions

3. **ApplicationPipelineTracker.tsx**
   - Visual timeline of application progress
   - Shows: submitted → under_review → shortlisted → interview → offer → hired
   - Status indicators

4. **CounterOfferDialog.tsx** / **CounterOfferModal.tsx**
   - Modal to submit counter offer
   - Input: desired salary, message
   - Actions: Submit, Cancel

5. **OnboardingTaskModal.tsx**
   - Modal for completing onboarding tasks
   - Task types: upload, form, signature, etc.
   - Upload file, submit form, sign document
   - Status: pending → submitted → approved/rejected

6. **ProfileCompletionModal.tsx**
   - Multi-step form for profile setup
   - Fields: Personal, Professional, Location, Skills, Preferences
   - Progress indicator

7. **JobDetailsModal.tsx**
   - Modal showing full job details
   - Actions: Apply, Save job, Share

### Recruiter Components (`/src/components/recruiter/`)

1. **RecruiterSidebar.tsx**
   - Navigation menu for recruiter dashboard
   - Links: Dashboard, Clients, Jobs, Applications, Pipeline, Interviews, Offers, Placements, Recordings, Team, Settings

2. **RecruiterLayoutClient.tsx**
   - Layout wrapper for recruiter pages
   - Header with notifications badge
   - Sidebar navigation

3. **OnboardingTaskManager.tsx**
   - Component for recruiter to create/manage onboarding tasks
   - Review submitted tasks (approve/reject)
   - Mark onboarding complete

4. **CounterOfferManager.tsx**
   - Component for recruiter to handle counter offers
   - Accept/reject/send new offer options

### Shared Components (`/src/components/shared/`)
- UI components (buttons, modals, cards, etc.)
- Form components
- Video call wrapper

### Page Structure

**Candidate Pages** (`/src/app/(candidate)/candidate/`)
- `/dashboard` - Application summary, quick actions
- `/applications` - List applications
- `/applications/[id]` - Application detail
- `/jobs` - Job search
- `/interviews` - Scheduled interviews
- `/offers` - Offers received
- `/onboarding` - Onboarding tasks
- `/profile` - Profile management
- `/resume/upload` - Upload resume
- `/resume/build` - Resume builder
- `/resume/analysis` - AI analysis results
- `/games` - Games hub
- `/games/typing-hero` - Typing speed game
- `/games/disc` - DISC personality test
- `/contracts/[id]` - Contract signing
- `/placement` - Placement/onboarding tracking
- `/settings` - Settings

**Recruiter Pages** (`/src/app/(recruiter)/recruiter/`)
- `/` - Dashboard
- `/clients` - Client management
- `/clients/[id]` - Client detail
- `/talent` - Talent pool (browse candidates)
- `/talent/[id]` - Candidate detail
- `/jobs` - Job list
- `/jobs/create` - Create job
- `/jobs/[id]/edit` - Edit job
- `/applications` - Application list
- `/applications/[id]` - Application detail (HUB - all related data)
- `/pipeline` - Pipeline kanban view
- `/interviews` - Interview list
- `/interviews/recordings` - Recordings list
- `/offers` - Offer management
- `/placements` - Placement tracking
- `/profile` - Recruiter profile
- `/team` - Team management
- `/settings` - Agency settings
- `/api` - API key management (if Enterprise)
- `/agency` - Agency info
- `/login` - Login page
- `/signup` - Signup page
- `/forgot-password` - Password reset

**Admin Pages** (`/src/app/(admin)/admin/`)
- `/` - Dashboard
- `/agencies` - Agency management
- `/agencies/[id]` - Agency detail
- `/candidates` - All candidates
- `/candidates/[id]` - Candidate detail
- `/jobs` - All jobs
- `/applications` - All applications
- `/interviews` - All interviews
- `/offers` - All offers
- `/counter-offers` - Counter offers
- `/leaderboard` - Agency/recruiter rankings
- `/notifications` - Notification manager
- `/insights` - Blog/insights manager
- `/errors` - Error monitoring
- `/audit-log` - Audit logging
- `/users` - User management
- `/billing` - Billing (out of scope)
- `/settings` - Platform settings

---

## KEY IMPLEMENTATION GAPS

Based on the FLOW_GAP_AUDIT.md and current codebase analysis:

### High-Risk Gaps

1. **Real-time Call Handling & Reminders**
   - **Status**: Incomplete
   - **Need**: Centralized scheduler for reminders (24h/1h/15m before interview, day 1 reminder)
   - **Need**: Missed call tracking and notifications
   - **Options**: Vercel Cron, Supabase scheduled functions, external queue
   - **Impact**: Candidates miss calls, trust issues

2. **Participant Tracking (Multi-Join & External Joiners)**
   - **Current**: `video_call_participants` table exists but needs refinement
   - **Issue**: External participants (no `user_id`) need unique key on `(room_id, email)`
   - **Impact**: Can't reliably track who attended, external participants overwrite each other

3. **Per-Call Client Feedback**
   - **Current**: Feedback is at application level, not per-call
   - **Need**: Move to `video_call_feedback` table keyed by `room_id`
   - **Impact**: Client feedback loses context (which interview? which round?)

### Medium Gaps

4. **Status Vocabulary Normalization**
   - **Issue**: UI uses aliases, DB uses canonical values, APIs sometimes differ
   - **Solution**: Standardize on DB enum values everywhere, v1 API accepts aliases but returns canonical

5. **Two Paths to Hire Not Well Signposted**
   - **Need**: UI clearly shows "Direct Talent Pool" vs "Normal Flow"
   - **Need**: Timeline/analytics differentiate between paths

6. **Analytics & Dashboard Placeholders**
   - **Current**: Some recruiter dashboard stats are placeholder
   - **Need**: Mark "coming soon" explicitly
   - **Need**: Align metrics with agreed KPIs

### Lower Gaps / Polish

7. **Admin Role Boundary Clarification**
   - **Decision Needed**: Admin oversight only vs admin can override
   - **Recommendation**: Oversight only, with emergency override + audit trail

8. **Recording & Transcript Governance**
   - **Questions**: Who can delete? Retention policy? GDPR deletion?
   - **Recommendation**: Recruiter/admin only can delete, define retention policy

9. **Sharing Rules & Revocation**
   - **Questions**: If `share_with_client` toggled off, do we revoke token access?
   - **Recommendation**: Yes, hide immediately, revoke tokens, document policy

10. **Video Call UI Consistency**
    - **Current**: Some iframe wrapper, some native Daily
    - **Recommendation**: Native Daily UI everywhere for stability, custom UI later

---

## TECHNOLOGY STACK

### Frontend
- **Framework**: Next.js 15.4.8
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 3.4.17
- **Components**: Radix UI (modular, accessible)
- **Video**: Daily.co SDK + @daily-co/daily-react
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form (likely)
- **HTTP**: Fetch API + axios (likely)

### Backend
- **Runtime**: Node.js (via Next.js)
- **Framework**: Next.js App Router (API routes)
- **Database**: Supabase PostgreSQL
- **Client**: `@supabase/supabase-js` SDK
- **Auth**: Supabase Auth
- **File Storage**: Supabase Storage (or similar)

### Video & Calls
- **Platform**: Daily.co
- **Recording**: Daily.co recording service
- **Transcription**: Daily.co transcription OR external service

### AI & ML
- **LLMs**: Claude (Anthropic SDK), OpenAI, Google Gemini
- **Resume Parsing**: AI analysis on uploaded resume
- **Chat**: HR Assistant uses Claude/OpenAI
- **Text Generation**: Insights/blog content generation

### Testing
- **E2E**: Playwright 1.57.0
- **Unit/Component**: Vitest 4.0.17
- **Testing Library**: @testing-library/react
- **Mocking**: Happy DOM, jsdom

### DevOps & Deployment
- **Hosting**: Vercel (likely, given Next.js)
- **CI/CD**: Vercel deployments (auto-deploy on git push)
- **Cron Jobs**: Vercel Cron (likely for reminders/cleanup)
- **Monitoring**: Vercel Analytics + custom error logging

### External Integrations
- **Video**: Daily.co (interviews, recordings)
- **Email**: Resend (likely)
- **Payments**: Stripe (likely, out of scope here)
- **Analytics**: Vercel Analytics
- **Storage**: Supabase Storage
- **Map API**: Google Maps (location fields)

### Key Libraries
- `@supabase/supabase-js` - Database, auth, storage
- `@daily-co/daily-js` - Video SDK
- `@anthropic-ai/sdk` - Claude AI
- `openai` - OpenAI API
- `@google/generative-ai` - Google Gemini
- `jspdf` - PDF generation for contracts
- `docx` - Word document generation
- `pdf-parse` - Resume/document parsing
- `puppeteer` - Browser automation (likely for PDF generation)
- `recharts` - Dashboard charts
- `tailwindcss` - Styling
- `framer-motion` - Animations
- `sonner` - Toast notifications
- `lucide-react` - Icons

---

## SUMMARY

### What Works Well
- **Recruiter Gate**: Solid quality control mechanism
- **Application Hub**: Unified view of all related data
- **Video Calling**: Daily.co integration established
- **Offer + Counter Flows**: Full flows implemented
- **Onboarding**: Task system working
- **Notifications**: Bell + pages + broadcast support
- **Multi-role UI**: Candidate, recruiter, admin distinct dashboards

### What Needs Work
- Real-time reminder system (critical)
- Per-call client feedback model
- Multi-participant tracking (edge cases)
- Status normalization (small fixes)
- Dashboard analytics refinement
- Recording/transcript governance policies

### Key Principles
1. **`job_applications` is the hub**: All related data hangs off it
2. **Recruiter Gate controls visibility**: Only affects Normal Application Flow
3. **Sharing is per-call**: `video_call_rooms.share_with_client/share_with_candidate`
4. **Two paths to hire**: Normal (with screening) vs Direct (talent pool)
5. **Multi-tenant isolation**: Agencies see only their data
6. **Audit trail**: Track all sensitive changes

---

This knowledge base should give developers, QA, and stakeholders a comprehensive understanding of the BPOC platform's complete recruitment flows, database structure, API endpoints, and current implementation status.
