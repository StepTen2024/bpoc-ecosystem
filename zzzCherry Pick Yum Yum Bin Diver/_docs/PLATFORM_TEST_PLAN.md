# 🎯 BPOC PLATFORM - MASTER TEST PLAN

**Date**: 2026-01-17
**Testing Agent**: Claude Code Autonomous Testing Agent
**Scope**: Complete Platform Testing (27 Phases)
**Environment**: localhost:3001

---

## 📊 EXECUTIVE SUMMARY

### Platform Scope
- **27 Phases** of candidate journey
- **50+ Database Tables**
- **100+ User Flows**
- **3 Primary Actors**: Candidate, Recruiter, Client
- **15+ Integrations**: Supabase, Daily.co, OpenAI, Google OAuth, etc.

### Test Coverage Goals
- ✅ Critical Path Coverage: 100%
- ✅ API Endpoint Coverage: 95%
- ✅ UI Component Coverage: 85%
- ✅ Integration Testing: 90%
- ✅ Database Operations: 95%

---

## 🗺️ TEST CATEGORIES

### 1. DISCOVERY & ONBOARDING TESTS (Phases 1-5)
- [ ] Landing page loads
- [ ] Terms acceptance flow
- [ ] Google OAuth signup
- [ ] Email/password signup
- [ ] Profile completion modal
- [ ] Resume upload
- [ ] Resume builder from scratch
- [ ] Resume data validation

### 2. ASSESSMENTS & GAMIFICATION (Phases 6-9)
- [ ] AI Resume Analysis execution
- [ ] Typing Hero game mechanics
- [ ] DISC personality test
- [ ] XP calculation and badges
- [ ] Gamification tracking

### 3. JOB DISCOVERY & MATCHING (Phases 10-12)
- [ ] Job browsing and filters
- [ ] AI job matching algorithm
- [ ] Job application submission
- [ ] Resume selection for application
- [ ] Application status tracking

### 4. RECRUITMENT FLOW (Phases 13-18)
- [ ] Activity timeline tracking
- [ ] Recruiter pre-screening
- [ ] Release to client
- [ ] Client feedback system
- [ ] Interview scheduling
- [ ] Video call integration (Daily.co)
- [ ] Recording and transcription

### 5. OFFER & CONTRACT (Phases 19-21)
- [ ] Offer creation
- [ ] Offer delivery
- [ ] Counter-offer negotiation
- [ ] Contract PDF generation
- [ ] E-signature system
- [ ] Document hashing and integrity

### 6. POST-HIRE (Phases 22-23)
- [ ] Onboarding task creation
- [ ] Task submission
- [ ] First day confirmation
- [ ] No-show tracking

### 7. PLATFORM FEATURES (Phases 24-27)
- [ ] Notification system
- [ ] Notification read tracking
- [ ] Chat agent conversations
- [ ] Chat memory and knowledge base
- [ ] Anonymous session tracking
- [ ] Session claiming on signup

---

## 🎯 PRIORITY MATRIX

### P0 - CRITICAL (Must Test First)
1. Account creation (Google OAuth + Email)
2. Profile completion
3. Job browsing
4. Job application
5. Recruiter pre-screening
6. Interview scheduling
7. Offer acceptance
8. Contract signing

### P1 - HIGH (Core Features)
1. Resume builder
2. AI Resume Analysis
3. DISC test
4. Typing Hero
5. AI job matching
6. Video interviews
7. Offer negotiation
8. Onboarding tasks

### P2 - MEDIUM (Enhanced Features)
1. Activity timeline
2. Client feedback
3. Notifications
4. Chat agent
5. Gamification/XP
6. Anonymous sessions

### P3 - LOW (Nice to Have)
1. Resume templates
2. Advanced filters
3. Analytics tracking
4. Knowledge base

---

## 📝 TEST SCENARIOS

### SCENARIO 1: Complete Candidate Journey (Happy Path)

**Steps:**
1. Discover BPOC via ad
2. Land on homepage
3. Sign up with Google OAuth
4. Complete profile (all fields)
5. Upload resume
6. Get AI analysis
7. Play Typing Hero
8. Complete DISC test
9. Browse jobs
10. See AI-matched jobs
11. Apply to 3 jobs
12. [Recruiter] Review application
13. [Recruiter] Shortlist candidate
14. [Recruiter] Release to client
15. [Client] Provide positive feedback
16. [Recruiter] Schedule interview
17. [Candidate] Join video interview
18. [Recruiter] Create offer
19. [Candidate] Accept offer
20. [Candidate] Sign contract
21. [Candidate] Complete onboarding tasks
22. [Candidate] Confirm first day
23. Mark as "started"

**Expected Duration**: ~45 minutes
**Test Type**: E2E
**Priority**: P0

---

### SCENARIO 2: Offer Negotiation Flow

**Steps:**
1. [Setup] Candidate has pending offer
2. [Candidate] View offer
3. [Candidate] Submit counter-offer
4. [Recruiter] Review counter
5. [Recruiter] Accept counter
6. [System] Update offer
7. [Candidate] Sign updated contract

**Expected Duration**: ~5 minutes
**Test Type**: E2E
**Priority**: P1

---

### SCENARIO 3: Interview Rescheduling

**Steps:**
1. [Setup] Interview scheduled
2. [Candidate] Request reschedule
3. [Recruiter] Approve reschedule
4. [System] Update video room
5. [System] Send notifications
6. [Candidate] Confirm new time

**Expected Duration**: ~3 minutes
**Test Type**: E2E
**Priority**: P1

---

### SCENARIO 4: Application Rejection Paths

**Test Cases:**
1. **Rejected by Recruiter** (pre-screen)
   - Status: submitted → rejected
   - rejected_by: "recruiter"
   - Timeline activity created
   - Notification sent to candidate

2. **Rejected by Client**
   - Status: shortlisted → rejected
   - rejected_by: "client"
   - Client feedback captured
   - Timeline activity created

3. **Candidate Withdraws**
   - Status: * → withdrawn
   - Reason captured
   - Timeline activity

**Expected Duration**: ~10 minutes
**Test Type**: Unit + Integration
**Priority**: P1

---

### SCENARIO 5: No-Show Scenarios

**Test Cases:**
1. **Interview No-Show**
   - Candidate doesn't join video call
   - Status marked: "no_show"
   - Timeline updated
   - Follow-up triggered

2. **First Day No-Show**
   - started_status: "no_show"
   - Timeline activity
   - HR alerted

**Expected Duration**: ~5 minutes
**Test Type**: E2E
**Priority**: P2

---

## 🧪 API ENDPOINT TESTING

### Authentication APIs
- [ ] `POST /api/auth/signup` - Email signup
- [ ] `POST /api/auth/callback` - OAuth callback
- [ ] `POST /api/user/sync` - User database sync

### Profile APIs
- [ ] `GET /api/candidate/profile`
- [ ] `PATCH /api/candidate/profile`
- [ ] `POST /api/candidate/profile/avatar`

### Resume APIs
- [ ] `POST /api/candidate/resume/upload`
- [ ] `POST /api/candidates/resume/save-extracted`
- [ ] `POST /api/candidates/resume/save-final`
- [ ] `GET /api/resume/[slug]`

### AI Analysis APIs
- [ ] `POST /api/candidates/ai-analysis/analyze`
- [ ] `POST /api/candidates/ai-analysis/save`
- [ ] `GET /api/candidate/ai-analysis`

### Assessment APIs
- [ ] `POST /api/assessments/typing/start`
- [ ] `POST /api/assessments/typing/complete`
- [ ] `POST /api/assessments/disc/start`
- [ ] `POST /api/assessments/disc/complete`

### Job APIs
- [ ] `GET /api/jobs`
- [ ] `GET /api/jobs/[id]`
- [ ] `POST /api/jobs/apply`
- [ ] `GET /api/candidate/applications`
- [ ] `GET /api/job-matches`

### Recruiter APIs
- [ ] `GET /api/recruiter/applications`
- [ ] `GET /api/recruiter/applications/[id]`
- [ ] `PATCH /api/recruiter/applications/status`
- [ ] `POST /api/recruiter/applications/[id]/release`
- [ ] `POST /api/recruiter/interviews`

### Client APIs (v1)
- [ ] `POST /api/v1/interviews`
- [ ] `POST /api/v1/applications/[id]/feedback`
- [ ] `GET /api/v1/applications/[id]/card`

### Offer APIs
- [ ] `POST /api/offers/create`
- [ ] `POST /api/offers/[offerId]/send`
- [ ] `POST /api/candidate/offers/counter`
- [ ] `POST /api/offers/[offerId]/sign`

### Contract APIs
- [ ] `POST /api/contracts/[applicationId]/generate`
- [ ] `GET /api/contracts/[applicationId]/pdf`
- [ ] `POST /api/contracts/[applicationId]/sign`

### Video Call APIs
- [ ] `POST /api/video/rooms/create`
- [ ] `POST /api/video/rooms/[roomId]/join`
- [ ] `POST /api/video/webhook` (Daily.co)
- [ ] `GET /api/video/recordings`

### Notification APIs
- [ ] `GET /api/candidate/notifications`
- [ ] `POST /api/notifications/[id]/read`
- [ ] `POST /api/notifications/broadcast`

### Chat APIs
- [ ] `POST /api/chat`
- [ ] `GET /api/chat/conversations`
- [ ] `POST /api/chat/embeddings`

### Anonymous Session APIs
- [ ] `POST /api/anon/session`
- [ ] `POST /api/anon/claim-all`

---

## 🗄️ DATABASE TESTING

### Data Integrity Tests
- [ ] Foreign key constraints
- [ ] Unique constraints (email, slug, etc.)
- [ ] Enum validations
- [ ] Required field validations
- [ ] Default value assignments
- [ ] Timestamp auto-updates

### Transaction Tests
- [ ] Multi-table inserts (application + timeline)
- [ ] Cascade deletes
- [ ] Rollback on errors
- [ ] Concurrent updates
- [ ] Race conditions

### Performance Tests
- [ ] Query optimization (EXPLAIN ANALYZE)
- [ ] Index usage
- [ ] N+1 query detection
- [ ] Slow query identification
- [ ] Connection pooling

---

## 🎨 UI/UX TESTING

### Component Testing
- [ ] SignupModal (Terms + Form)
- [ ] ProfileCompletionModal
- [ ] ResumeBuilder
- [ ] TypingHeroGame
- [ ] DISCAssessment
- [ ] JobCard
- [ ] ApplicationCard
- [ ] InterviewScheduler
- [ ] OfferCard
- [ ] ContractViewer
- [ ] E-SignaturePad
- [ ] ChatWidget
- [ ] NotificationBell

### Responsive Testing
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px)
- [ ] Large Desktop (1440px)

### Accessibility Testing
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] ARIA labels
- [ ] Color contrast
- [ ] Focus states

---

## 🔌 INTEGRATION TESTING

### Google OAuth
- [ ] Login flow
- [ ] Signup flow
- [ ] Token refresh
- [ ] Error handling

### Supabase
- [ ] Auth integration
- [ ] Database queries
- [ ] Storage uploads
- [ ] Real-time subscriptions
- [ ] Row-level security (RLS)

### Daily.co Video
- [ ] Room creation
- [ ] Token generation
- [ ] Participant join
- [ ] Recording start/stop
- [ ] Transcription webhook
- [ ] Room expiration

### OpenAI
- [ ] Resume analysis
- [ ] Job matching
- [ ] Chat completions
- [ ] Embedding generation

### Google Places
- [ ] Autocomplete
- [ ] Place details
- [ ] Geocoding

---

## 📊 TEST METRICS

### Code Coverage Targets
- Statements: 80%
- Branches: 75%
- Functions: 85%
- Lines: 80%

### Performance Benchmarks
- Page load: <2s
- API response: <500ms
- Database query: <100ms
- Video call join: <3s

### Reliability Targets
- Uptime: 99.9%
- Error rate: <0.1%
- Test pass rate: >95%

---

## 🚀 EXECUTION PLAN

### Phase 1: Setup (Day 1)
- [x] Install testing infrastructure
- [x] Create test helpers and utilities
- [x] Set up test database
- [ ] Create test data seeding script
- [ ] Configure CI/CD integration

### Phase 2: Unit Tests (Day 2-3)
- [ ] Test all API routes
- [ ] Test database operations
- [ ] Test utility functions
- [ ] Test validation logic

### Phase 3: Integration Tests (Day 4-5)
- [ ] Test external integrations
- [ ] Test multi-step workflows
- [ ] Test error handling
- [ ] Test edge cases

### Phase 4: E2E Tests (Day 6-7)
- [ ] Test complete candidate journey
- [ ] Test recruiter workflows
- [ ] Test client interactions
- [ ] Test cross-actor scenarios

### Phase 5: Performance Tests (Day 8)
- [ ] Load testing
- [ ] Stress testing
- [ ] Spike testing
- [ ] Soak testing

### Phase 6: Security Tests (Day 9)
- [ ] Authentication bypass attempts
- [ ] SQL injection tests
- [ ] XSS vulnerability checks
- [ ] CSRF protection validation
- [ ] Data exposure tests

### Phase 7: Report & Fix (Day 10)
- [ ] Generate comprehensive report
- [ ] Prioritize issues
- [ ] Create fix tickets
- [ ] Retest critical failures

---

## 🎯 SUCCESS CRITERIA

### Must Have (Blockers)
- ✅ Account creation works
- ✅ Job application submits successfully
- ✅ Recruiter can review applications
- ✅ Interviews can be scheduled
- ✅ Offers can be created and accepted
- ✅ Contracts can be signed

### Should Have (High Priority)
- ✅ AI analysis generates results
- ✅ Assessments score correctly
- ✅ Job matching returns relevant jobs
- ✅ Video calls connect properly
- ✅ Notifications deliver
- ✅ Timeline tracks accurately

### Nice to Have (Enhancement)
- ✅ Gamification updates
- ✅ Chat agent responds intelligently
- ✅ Anonymous sessions claim properly
- ✅ Advanced filtering works

---

## 📝 TEST DATA REQUIREMENTS

### Users Needed
- 10 Test Candidates (various profiles)
- 5 Test Recruiters
- 3 Test Clients
- 2 Test Admins

### Jobs Needed
- 20 Test Jobs (various roles, salaries, locations)
- Mix of statuses (active, paused, closed)
- Different agencies

### Applications Needed
- 50 Test Applications
- Various statuses (submitted, reviewing, shortlisted, etc.)
- Different dates for timeline testing

### Additional Data
- 30 Resumes (uploaded files)
- 20 DISC assessments
- 20 Typing test results
- 10 Scheduled interviews
- 5 Active offers
- 3 Signed contracts

---

## 🔧 TOOLS & FRAMEWORKS

### Testing Stack
- **E2E**: Playwright
- **Unit**: Vitest
- **Component**: Testing Library
- **API**: Supertest (if needed)
- **Performance**: k6 or Artillery
- **Security**: OWASP ZAP

### CI/CD
- GitHub Actions
- Automated test runs on PR
- Nightly full test suite
- Coverage reporting

---

## 📊 REPORTING

### Daily Reports
- Tests run count
- Pass/fail rate
- New issues found
- Issues fixed
- Coverage delta

### Weekly Reports
- Overall progress
- Critical blockers
- Performance trends
- Recommendations

### Final Report
- Executive summary
- Detailed findings
- Risk assessment
- Remediation plan
- Test artifacts

---

**Status**: READY TO EXECUTE
**Next Step**: Generate test files and run smoke tests
