# Onboarding System Research & Extraction Strategy

**Date**: January 27, 2026  
**Objective**: Extract ShoreAgents onboarding system as standalone BPOC feature  
**Status**: ✅ Research Complete | Ready to Build
**Source Commit**: `f2675763` from ShoreAgents

---

## 🎯 Executive Summary

The **onboarding system** is currently split between ShoreAgents and BPOC. Your instinct is correct: **onboarding IS recruitment**, not agency management. It should live in BPOC (the careers platform) as the final step after hiring.

**Current Problem**:
- Hiring happens in BPOC (Step 10)
- But comprehensive onboarding happens in ShoreAgents (separate platform)  
- Candidates must switch systems after accepting a job
- Data is duplicated across platforms

**Solution**:
- Move **100% of onboarding** to BPOC
- Trigger automatically after job acceptance
- Create complete **Philippines 201 file** (employee record)
- Generate legally-compliant employment contract

---

## 📊 Current State Analysis

### What ALREADY EXISTS in BPOC

✅ **Database**: `onboarding_tasks` table (17 columns)  
✅ **UI Component**: `OnboardingTaskManager.tsx` (800 lines)  
✅ **Candidate Component**: `OnboardingTaskModal.tsx`  
✅ **Admin Panel**: `/admin/onboarding` page  
✅ **Task Types**: 6 types (document_upload, form_fill, e_sign, acknowledgment, training, information)

**Current Schema**:
```sql
onboarding_tasks (
  id, application_id, task_type, title, description,
  is_required, due_date, status, submitted_at, reviewed_at,
  reviewer_notes, attachments, form_data, signature_data,
  acknowledgment_complete, created_at, updated_at
)
```

**Production Data**: 0 onboarding tasks currently

### What EXISTS in ShoreAgents (To Extract)

✅ **Comprehensive 8-Step Wizard** with Philippines 201 file requirements  
✅ **Government ID Collection** (SSS, TIN, PhilHealth, Pag-IBIG)  
✅ **Contract Generator** (Philippines Labor Law compliant)  
✅ **Digital Signature System**  
✅ **Admin Review System** with approve/reject  
✅ **Progress Tracking** (0-100%)

**ShoreAgents Schema**:
```sql
staff_onboarding (39 fields including:
  - Personal info (first_name, middle_name, last_name, gender, civil_status, DOB)
  - Gov IDs (sss, tin, philhealth_no, pagibig_no + document URLs)
  - Documents (resume, education, medical, signature URLs)
  - 8 section statuses (PENDING, SUBMITTED, APPROVED, REJECTED)
  - Progress (completion_percent, is_complete)
  - Contract (signed, signed_at, PDF URL)
)

employment_contracts (
  contract_html, contract_pdf_url, employee details,
  salary, benefits, signatures, etc.
)
```

---

## 🔄 Integration Strategy

### Option A: Replace Current System (Recommended)
- Remove current task-based approach
- Implement full 8-step wizard from ShoreAgents
- Migrate `onboarding_tasks` table to `candidate_onboarding` schema
- Benefits: Complete, proven system with Philippines compliance

### Option B: Hybrid Approach
- Keep current `onboarding_tasks` for flexible custom tasks
- Add new `candidate_onboarding` table for structured 201 file collection
- Use both systems in parallel
- Benefits: Flexibility + Compliance

---

## 🏗️ What We're Building

### The Complete Flow

```
BPOC Platform (Recruitment)
  ↓
Step 1-9: Applications, Interviews, Assessments
  ↓
Step 10: JOB OFFER ACCEPTED ✅
  ↓
  ↓ [TRIGGER: Initialize Onboarding]
  ↓
ONBOARDING SYSTEM (8 Steps)
  ↓
  1. Personal Information
  2. Resume Upload
  3. Government IDs (SSS, TIN, PhilHealth, Pag-IBIG)  
  4. Education Documents
  5. Medical Clearance
  6. Data Privacy Consent
  7. Digital Signature
  8. Emergency Contact
  ↓
CONTRACT GENERATION (Philippines Labor Law Compliant)
  ↓
DIGITAL CONTRACT SIGNING
  ↓
201 FILE COMPLETE ✅
  ↓
Ready to Start Work
```

---

## 📋 The 8-Step Wizard

### Step 1: Personal Information
- First/Middle/Last Name, Gender, Civil Status
- Date of Birth (18+ validation)
- Contact Number (+63 format)
- Email, Complete Address

### Step 2: Resume Upload
- PDF/DOCX, max 5MB
- Pre-filled if uploaded during BPOC application

### Step 3: Government IDs (CRITICAL for 201 File)
- **SSS Number** (XX-XXXXXXX-X) + Document
- **TIN Number** (XXX-XXX-XXX-XXX) + Document  
- **PhilHealth Number** (XX-XXXXXXXXX-X) + Document
- **Pag-IBIG Number** (XXXX-XXXX-XXXX) + Document
- **Valid ID** (National ID, Passport, Driver's License)

> **Why Critical**: Philippines labor law **requires** these IDs for every employee's 201 file. Without them, employment is not legal.

### Step 4: Education
- Highest education level
- Upload diploma/transcript

### Step 5: Medical Clearance
- Upload medical certificate
- Optional medical notes

### Step 6: Data Privacy Consent
- **Philippines Data Privacy Act of 2012** compliance
- Display full consent agreement
- Checkbox + Digital Signature required

### Step 7: Digital Signature
- Canvas drawing pad OR upload signature image
- Saved as PNG/Base64
- Used for contract signing

### Step 8: Emergency Contact
- Name, relationship, phone number
- Required for workplace safety

---

## 📄 Contract Generator

**Philippines Labor Law Compliance**:

**Section 1**: Parties (Employer: ShoreAgents/BPOC, Employee: [Name])  
**Section 2**: Nature of Employment (Position, Client, Schedule, Probation)  
**Section 3**: Duties and Responsibilities  
**Section 4**: Compensation & Benefits
- Basic Salary + De Minimis (tax-exempt benefits)
- HMO, Paid Leave, 13th Month Pay
- SSS, PhilHealth, Pag-IBIG contributions

**Section 5**: Confidentiality & Data Protection  
**Section 6**: Termination (30-day notice, just causes)  
**Section 7**: General Provisions (Governing law: Philippines)

**Output**:
- HTML contract (for preview)
- PDF contract (for download + storage)
- Digital signature placeholder

---

## 🔗 BPOC Integration Points

### Where Onboarding Fits

**BPOC Step 10 ("Workplace")**: Job Offer Acceptance

**Current Flow**:
```
Recruiter sends offer → Candidate accepts → Status: "hired" → ???
```

**New Flow**:
```
Recruiter sends offer
  ↓
Candidate accepts
  ↓
Status: "hired"
  ↓
🚀 TRIGGER: Create onboarding record
  ↓
Send email: "Complete your onboarding!"
  ↓
Candidate dashboard banner: "⚠️ Onboarding incomplete"
  ↓
Candidate clicks "Start Onboarding"
  ↓
8-Step Wizard Modal opens
  ↓
Auto-filled with BPOC data (name, email, phone, resume)
  ↓
Candidate completes 8 steps
  ↓
HR reviews and approves
  ↓
Contract generated
  ↓
Candidate signs digitally
  ↓
✅ 201 File Complete
  ↓
Ready to start on [start_date]
```

### Data Pre-Fill Logic

**From BPOC `candidates` table**:
- `first_name` → `onboarding.firstName`
- `last_name` → `onboarding.lastName`
- `email` → `onboarding.email`
- `birthday` → `onboarding.dateOfBirth`
- `gender` → `onboarding.gender`  
- `phone` → `onboarding.contactNo`
- `resume_url` → `onboarding.resumeUrl`

**Why Pre-Fill?**:
- Reduces data entry by 50%
- Improves completion rate (fewer abandoned forms)
- Ensures data consistency

---

## 🚀 Implementation Plan

### Phase 1: Database Schema (2 hours)
- [ ] Create `candidate_onboarding` table (39 columns)
- [ ] Create `employment_contracts` table
- [ ] Keep existing `onboarding_tasks` for flexible tasks
- [ ] Create storage buckets: `onboarding-documents/`, `contracts/`
- [ ] Set up RLS policies

### Phase 2: Backend APIs (8 hours)
- [ ] `POST /api/onboarding/initialize` - Create onboarding record
- [ ] `GET /api/onboarding?candidateId=X` - Get status
- [ ] `POST /api/onboarding/personal-info` - Step 1
- [ ] `POST /api/onboarding/resume` - Step 2
- [ ] `POST /api/onboarding/gov-ids` - Step 3
- [ ] `POST /api/onboarding/education` - Step 4
- [ ] `POST /api/onboarding/medical` - Step 5
- [ ] `POST /api/onboarding/data-privacy` - Step 6
- [ ] `POST /api/onboarding/signature` - Step 7
- [ ] `POST /api/onboarding/emergency-contact` - Step 8
- [ ] `POST /api/onboarding/documents/upload` - File uploads
- [ ] `POST /api/onboarding/generate-contract` - Contract HTML + PDF
- [ ] `POST /api/onboarding/sign-contract` - Digital signing

### Phase 3: Frontend Wizard (12 hours)
- [ ] `OnboardingWizard.tsx` - Main 8-step wizard modal
- [ ] 8 step components (reusable form fields)
- [ ] `FileUploadComponent.tsx` - Drag-and-drop uploader
- [ ] `SignaturePad.tsx` - HTML5 Canvas signature
- [ ] Progress bar and navigation
- [ ] Auto-save every 30 seconds

### Phase 4: Admin Panel (4 hours)
- [ ] List page: Pending onboarding reviews
- [ ] Review modal: Approve/reject with feedback
- [ ] Dashboard stats: "10 pending onboardings"

### Phase 5: Integration (2 hours)
- [ ] Trigger on job acceptance (Step 10)
- [ ] Pre-fill with BPOC candidate data
- [ ] Dashboard banner for incomplete onboarding
- [ ] Email notifications

### Phase 6: Testing (4 hours)
- [ ] End-to-end wizard flow
- [ ] File uploads to Supabase Storage
- [ ] Contract generation and PDF creation
- [ ] Admin approve/reject flow
- [ ] Mobile responsiveness

**Total Estimated Time**: 32 hours (4 working days)

---

## 📦 Files Retrieved from ShoreAgents

1. **`ONBOARDING_RESEARCH_SUMMARY.md`** (601 lines) - Executive summary
2. **`ONBOARDING_REBUILD_PROMPT.md`** (805 lines) - Complete implementation guide
3. **`onboarding-research-task.md`** (29 lines) - Project task

**Source Commit**: `f267576325c80560b7447d7410a23958492ebbb0`  
**Date**: Jan 27, 2026 10:56 AM  
**Repository**: StepTen2024/shoreagents-software

---

## 🎯 Next Steps

### Recommended Approach

1. **Review** this document and the full rebuild prompt
2. **Decide** on hybrid vs replace approach
3. **Assign** to development team or AI agent
4. **Build** using the 6-phase implementation plan
5. **Test** end-to-end with real candidate
6. **Deploy** to production

Timeline: 3-5 days for complete implementation

---

## 📚 Additional Documentation

See full implementation details in:
- `./ONBOARDING_REBUILD_PROMPT.md` - Complete technical spec (805 lines)
- ShoreAgents `/research/onboarding/` - Original research files

**Philippines Compliance References**:
- Labor Code of the Philippines (PD 442)
- Data Privacy Act of 2012 (RA 10173)
- DOLE 201 File Requirements (DO 174-17)
