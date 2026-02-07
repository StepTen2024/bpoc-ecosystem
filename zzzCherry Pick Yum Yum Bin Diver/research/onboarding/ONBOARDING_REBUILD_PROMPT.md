# 🎯 REBUILD ONBOARDING SYSTEM - ONE-SHOT AGENT PROMPT

## CONTEXT & OBJECTIVE

You are building a **Philippines recruitment & onboarding system** for BPO outsourcing. This system handles the complete flow from **job acceptance → contract signing → 201 file creation**.

**Current State**: Onboarding is split across two systems:
- **ShoreAgents (Internal)**: Full 8-step onboarding wizard for staff
- **BPOC (Careers Platform)**: Task-based onboarding API for candidates

**Goal**: Consolidate into a single, complete onboarding system within BPOC that creates a complete 201 file (Philippines employee record).

---

## 🏗️ SYSTEM ARCHITECTURE

### Database Schema

```sql
-- Main Onboarding Table (One record per hire)
CREATE TABLE candidate_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  job_application_id UUID NOT NULL REFERENCES job_applications(id),
  
  -- Personal Information
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  gender TEXT,  -- Male, Female, Non-Binary, Prefer not to say
  civil_status TEXT,  -- Single, Married, Widowed, Separated
  date_of_birth DATE NOT NULL,
  contact_no TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,  -- Full address for contract
  
  -- Government IDs (Philippines Required)
  sss TEXT,  -- Social Security System (XX-XXXXXXX-X)
  tin TEXT,  -- Tax Identification Number (XXX-XXX-XXX-XXX)
  philhealth_no TEXT,  -- PhilHealth No (XX-XXXXXXXXX-X)
  pagibig_no TEXT,  -- Pag-IBIG No (XXXX-XXXX-XXXX)
  
  -- Document URLs (Stored in Supabase Storage)
  sss_doc_url TEXT,
  tin_doc_url TEXT,
  philhealth_doc_url TEXT,
  pagibig_doc_url TEXT,
  valid_id_url TEXT,
  
  -- Education
  education_level TEXT,  -- High School, College, Masters, etc.
  education_doc_url TEXT,  -- Diploma/Transcript
  
  -- Medical Clearance
  medical_cert_url TEXT,
  medical_notes TEXT,
  
  -- Data Privacy Consent
  accepts_data_privacy BOOLEAN DEFAULT FALSE,
  data_privacy_signed_at TIMESTAMP,
  
  -- Resume
  resume_url TEXT,
  
  -- Digital Signature
  signature_url TEXT,  -- Base64 or Supabase Storage URL
  signature_date TIMESTAMP,
  
  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_relationship TEXT,
  emergency_contact_phone TEXT,
  
  -- Section Status Tracking
  personal_info_status TEXT DEFAULT 'PENDING',  -- PENDING, SUBMITTED, APPROVED, REJECTED
  gov_id_status TEXT DEFAULT 'PENDING',
  education_status TEXT DEFAULT 'PENDING',
  medical_status TEXT DEFAULT 'PENDING',
  data_privacy_status TEXT DEFAULT 'PENDING',
  resume_status TEXT DEFAULT 'PENDING',
  signature_status TEXT DEFAULT 'PENDING',
  emergency_contact_status TEXT DEFAULT 'PENDING',
  
  -- Section Feedback (For rejections)
  personal_info_feedback TEXT,
  gov_id_feedback TEXT,
  education_feedback TEXT,
  medical_feedback TEXT,
  signature_feedback TEXT,
  emergency_contact_feedback TEXT,
  
  -- Overall Progress
  completion_percent INTEGER DEFAULT 0,  -- 0-100
  is_complete BOOLEAN DEFAULT FALSE,  -- All sections approved
  
  -- Contract Data
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_signed_at TIMESTAMP,
  contract_pdf_url TEXT,  -- Generated contract PDF
  
  -- Job Details (For Contract Generation)
  position TEXT,
  contact_type TEXT,  -- FULL_TIME, PART_TIME, PROJECT_BASED
  assigned_client TEXT,
  start_date DATE,
  work_schedule TEXT,  -- e.g., "Mon-Fri 9AM-6PM"
  basic_salary DECIMAL,
  de_minimis DECIMAL,  -- Tax-exempt benefits
  total_monthly_gross DECIMAL,
  hmo_offer TEXT,  -- Health insurance details
  paid_leave TEXT,  -- Leave policy
  probationary_period TEXT,  -- e.g., "6 months"
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding Tasks (Flexible task system)
CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id),
  candidate_id UUID REFERENCES candidates(id),
  
  task_type TEXT NOT NULL,  -- document_upload, form_fill, e_sign, acknowledgment
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT TRUE,
  due_date TIMESTAMP,
  
  status TEXT DEFAULT 'pending',  -- pending, submitted, approved, rejected
  submitted_at TIMESTAMP,
  submitted_data JSONB,  -- Flexible storage for task data
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Employment Contracts
CREATE TABLE employment_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_onboarding_id UUID NOT NULL REFERENCES candidate_onboarding(id),
  
  contract_html TEXT NOT NULL,  -- Full contract HTML
  contract_pdf_url TEXT,  -- Signed PDF
  
  employee_name TEXT NOT NULL,
  employee_address TEXT NOT NULL,
  position TEXT NOT NULL,
  contact_type TEXT NOT NULL,
  assigned_client TEXT,
  start_date DATE NOT NULL,
  work_schedule TEXT,
  basic_salary DECIMAL,
  de_minimis DECIMAL,
  total_monthly_gross DECIMAL,
  hmo_offer TEXT,
  paid_leave TEXT,
  probationary_period TEXT,
  
  signed_at TIMESTAMP,
  signed_by_candidate BOOLEAN DEFAULT FALSE,
  signed_by_employer BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📋 8-STEP ONBOARDING WIZARD

### Step 1: Personal Information
**Fields** (All Required):
- First Name (text input)
- Middle Name (optional text input)
- Last Name (text input)
- Gender (dropdown: Male, Female, Non-Binary, Prefer not to say)
- Civil Status (dropdown: Single, Married, Widowed, Separated)
- Date of Birth (date picker, must be 18+)
- Contact Number (text input, format: +63 XXX XXX XXXX)
- Email (pre-filled from candidate signup)
- Complete Address (textarea, for contract)

**Validation**:
- Age must be 18+
- Phone number must match Philippines format
- All required fields must be filled

**API Endpoint**: `POST /api/onboarding/personal-info`

---

### Step 2: Resume Upload
**Fields**:
- Resume File (file upload, PDF/DOCX, max 5MB)

**Validation**:
- File type: PDF or DOCX
- File size: < 5MB
- File must be uploaded

**API Endpoint**: `POST /api/onboarding/resume`

---

### Step 3: Government IDs & Documents (Philippines 201 File)
**Fields** (All Required):
- SSS Number (text input, format: XX-XXXXXXX-X)
- SSS Document (file upload, image/PDF)
- TIN Number (text input, format: XXX-XXX-XXX-XXX)
- TIN Document (file upload, image/PDF)
- PhilHealth Number (text input, format: XX-XXXXXXXXX-X)
- PhilHealth Document (file upload, image/PDF)
- Pag-IBIG Number (text input, format: XXXX-XXXX-XXXX)
- Pag-IBIG Document (file upload, image/PDF)
- Valid ID (file upload, image/PDF)

**Validation**:
- ID numbers match Philippines government formats
- All documents must be uploaded
- File size: < 5MB each
- File type: JPG, PNG, PDF

**API Endpoint**: `POST /api/onboarding/gov-ids`

> **CRITICAL**: These IDs are required by Philippines labor law for the 201 file (employee record).

---

### Step 4: Education
**Fields**:
- Highest Education Level (dropdown: High School, College, Bachelor's, Master's, Doctorate)
- Educational Document (file upload, Diploma/Transcript, PDF/image, max 5MB)

**Validation**:
- Education level selected
- Document uploaded

**API Endpoint**: `POST /api/onboarding/education`

---

### Step 5: Medical Clearance
**Fields**:
- Medical Certificate (file upload, PDF/image, max 5MB)
- Medical Notes (optional textarea)

**Validation**:
- Medical certificate uploaded

**API Endpoint**: `POST /api/onboarding/medical`

---

### Step 6: Data Privacy Consent (Philippines Data Privacy Act of 2012)
**Fields**:
- Data Privacy Agreement (display full text)
- Acceptance Checkbox (required)
- Signature (digital signature pad OR upload)

**Validation**:
- Checkbox must be checked
- Signature must be provided

**API Endpoint**: `POST /api/onboarding/data-privacy`

**Full Text** (to display):
```
DATA PRIVACY CONSENT

I hereby consent to the collection, use, processing, storage, and disclosure of my personal information by ShoreAgents 
in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) for the following purposes:

1. Employment and HR management
2. Payroll and benefits administration
3. Compliance with legal and regulatory requirements
4. Communication regarding employment matters
5. Background verification and reference checks

I understand that:
- My data will be kept confidential and secure
- I have the right to access, correct, or delete my personal information
- I can withdraw consent at any time, subject to legal obligations
- My data may be shared with authorized third parties (government agencies, clients) as necessary

By signing below, I acknowledge that I have read, understood, and agree to this Data Privacy Consent.
```

---

### Step 7: Digital Signature
**Fields**:
- Signature Canvas (draw signature) OR
- Signature Upload (upload image of signature, PNG/JPG)
- Clear Button (to redraw)

**Validation**:
- Signature must be provided (either drawn or uploaded)

**API Endpoint**: `POST /api/onboarding/signature`

**Implementation Notes**:
- Use HTML5 Canvas for drawing
- Convert to Base64 or upload to Supabase Storage
- Save as PNG with transparent background

---

### Step 8: Emergency Contact
**Fields**:
- Emergency Contact Name (text input, required)
- Relationship (dropdown: Parent, Spouse, Sibling, Friend, Other)
- Phone Number (text input, Philippines format, required)

**Validation**:
- All fields required
- Phone number must be valid

**API Endpoint**: `POST /api/onboarding/emergency-contact`

---

## 📄 PHILIPPINES EMPLOYMENT CONTRACT GENERATOR

After all 8 steps are complete, generate a **Philippines Labor Law-compliant employment contract**.

### Contract Template Structure

**Section 1: Parties to the Contract**
- Employer: ShoreAgents (address: Business Center 26, Philexcel Business Park, Clark Freeport, 2023)
- Employee: [Full Name] (address: [Complete Address from Step 1])

**Section 2: Nature of Employment**
- Employment Type: [Full-Time / Part-Time / Project-Based]
- Client: [Assigned Client Name]
- Position: [Job Title]
- Start Date: [Start Date]
- Work Schedule: [Work Schedule]
- Probationary Period: [e.g., "6 months"]

**Section 3: Duties and Responsibilities**
- Standard BPO duties
- Confidentiality obligations
- Performance expectations

**Section 4: Compensation and Benefits**
| Item | Amount |
|------|--------|
| Basic Salary | PHP [basic_salary] |
| De Minimis Benefits | PHP [de_minimis] |
| **Total Monthly Gross** | **PHP [total_monthly_gross]** |

- HMO: [hmo_offer]
- Paid Leave: [paid_leave]
- Government Benefits: SSS, PhilHealth, Pag-IBIG, 13th Month Pay

**Section 5: Confidentiality and Data Protection**
- Philippines Data Privacy Act compliance
- Non-disclosure obligations

**Section 6: Termination**
- Just causes (per Labor Code of the Philippines)
- Notice periods (30 days)
- Clearance and final pay procedures

**Section 7: General Provisions**
- Governing law: Philippines labor law
- Dispute resolution
- Amendments

**Acknowledgment**
- Digital signature placeholder
- Contract signing date

### Contract Generation Logic

```typescript
interface ContractData {
  employeeName: string
  employeeAddress: string
  contactType: string  // FULL_TIME, PART_TIME, PROJECT_BASED
  assignedClient: string
  position: string
  startDate: Date
  workSchedule: string
  basicSalary: number
  deMinimis: number
  totalMonthlyGross: number
  hmoOffer: string
  paidLeave: string
  probationaryPeriod: string
}

function generateContractHTML(data: ContractData): string {
  // Returns full HTML contract with:
  // - All 7 sections
  // - Formatted currency (PHP X,XXX.XX)
  // - Formatted dates
  // - Government-mandated clauses
  // - Digital signature placeholder
}
```

**Generate PDF**:
- Use `@react-pdf/renderer` or `puppeteer`
- Save to Supabase Storage: `contracts/[candidate_id]_[timestamp].pdf`
- Return URL for candidate to download

---

## 🔄 HIRING → ONBOARDING FLOW

### Trigger Point: Job Acceptance

When a candidate accepts a job offer in BPOC Step 10 (Workplace):

1. **Job Application Status**: `hired`
2. **Create Onboarding Record**: 
   - `POST /api/onboarding/initialize`
   - Body: `{ candidateId, jobApplicationId, position, salary, startDate, etc. }`
3. **Pre-fill Data from BPOC**:
   - First Name, Last Name → from `candidates.first_name`, `candidates.last_name`
   - Email → from `candidates.email`
   - Phone → from `candidate_profiles.phone`
   - Birthday → from `candidates.birthday`
   - Gender → from `candidates.gender`
   - Resume → from `candidates.resume_url`
4. **Send Email Notification**:
   - Subject: "Complete Your Onboarding - [Company Name]"
   - Body: Link to onboarding page (`/candidate/onboarding`)
5. **Dashboard Banner**: Show persistent banner on candidate dashboard:
   - "⚠️ Complete your onboarding to start on [start_date]"
   - Button: "Start Onboarding"

### Onboarding Page UI

**Header**:
- Title: "Welcome to [Company Name]! 🎉"
- Subtitle: "Complete the following steps to finalize your employment"

**Progress Bar**:
- Shows 8 steps
- Each step: Pending (gray), In Progress (orange), Submitted (cyan), Approved (green), Rejected (red)
- Overall completion: "X of 8 steps complete"

**Step Cards**:
- Icon for each step (User, Briefcase, CreditCard, GraduationCap, Stethoscope, Shield, PenTool, Users)
- Step name and description
- Status badge
- "Complete" button (if pending or rejected)
- "Resubmit" button (if rejected with feedback)

**Admin Review Modal** (For recruiters/HR):
- View submitted data
- Approve or Reject each section
- Add feedback if rejected

---

## 🎨 UI/UX REQUIREMENTS

### Onboarding Wizard Modal

**Design**:
- Large modal overlay
- Progress bar at top (Step X of 8)
- Form fields with icons
- "Save Draft" button (auto-saves progress)
- "I'll Do This Later" button (saves and exits)
- "Next" button (validates and proceeds)
- "Submit" button (final step)

**Features**:
- **Auto-save**: Save progress every 30 seconds
- **Persistent state**: Load saved data if user returns
- **Validation**: Client-side validation before API call
- **Loading states**: Show spinners during API calls
- **Error handling**: Display API errors clearly
- **Success feedback**: Toast notification after save

### File Upload Component

**Requirements**:
- Drag-and-drop support
- File type validation (PDF, JPG, PNG, DOCX)
- File size validation (max 5MB)
- Preview uploaded files
- Delete button to remove
- Upload to Supabase Storage: `onboarding-documents/[candidate_id]/[filename]`

### Signature Pad Component

**Requirements**:
- HTML5 Canvas for drawing
- Touch support for mobile
- "Clear" button to redraw
- Convert to Base64 PNG
- Preview signature before save

---

## 🔗 API ENDPOINTS

### 1. Initialize Onboarding
```http
POST /api/onboarding/initialize
Authorization: Bearer [token]
Content-Type: application/json

{
  "candidateId": "uuid",
  "jobApplicationId": "uuid",
  "position": "Customer Service Representative",
  "contactType": "FULL_TIME",
  "assignedClient": "ABC Corp",
  "startDate": "2026-02-01",
  "workSchedule": "Mon-Fri 9AM-6PM",
  "basicSalary": 25000,
  "deMinimis": 1500,
  "totalMonthlyGross": 26500,
  "hmoOffer": "HMO coverage after 6 months",
  "paidLeave": "15 days vacation leave + 10 sick leave",
  "probationaryPeriod": "6 months"
}

Response:
{
  "success": true,
  "onboardingId": "uuid",
  "message": "Onboarding initialized"
}
```

### 2. Get Onboarding Status
```http
GET /api/onboarding?candidateId=[uuid]
Authorization: Bearer [token]

Response:
{
  "onboarding": {
    "id": "uuid",
    "candidateId": "uuid",
    "completionPercent": 50,
    "isComplete": false,
    "personalInfoStatus": "APPROVED",
    "govIdStatus": "SUBMITTED",
    "resumeStatus": "APPROVED",
    ...all sections
  }
}
```

### 3. Submit Section
```http
POST /api/onboarding/[section]
Authorization: Bearer [token]
Content-Type: application/json

// Example: Personal Info
{
  "firstName": "Juan",
  "middleName": "Dela",
  "lastName": "Cruz",
  "gender": "Male",
  "civilStatus": "Single",
  "dateOfBirth": "1995-01-15",
  "contactNo": "+63 917 123 4567",
  "email": "juan@example.com",
  "address": "123 Main St, Makati, Metro Manila"
}

Response:
{
  "success": true,
  "message": "Personal information saved successfully",
  "status": "SUBMITTED"
}
```

### 4. Upload Document
```http
POST /api/onboarding/documents/upload
Authorization: Bearer [token]
Content-Type: multipart/form-data

Form Data:
- file: [binary]
- documentType: "sss_doc" | "tin_doc" | "philhealth_doc" | etc.
- candidateId: "uuid"

Response:
{
  "success": true,
  "documentUrl": "https://supabase.co/storage/onboarding-documents/[candidate_id]/sss.pdf"
}
```

### 5. Admin: Review Section
```http
PATCH /api/admin/onboarding/[onboardingId]/[section]
Authorization: Bearer [admin_token]
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED",
  "feedback": "Please resubmit TIN document with clearer photo"
}

Response:
{
  "success": true,
  "message": "Section updated"
}
```

### 6. Generate Contract
```http
POST /api/onboarding/generate-contract
Authorization: Bearer [token]
Content-Type: application/json

{
  "onboardingId":  "uuid"
}

Response:
{
  "success": true,
  "contractHtml": "<div>...</div>",
  "contractPdfUrl": "https://supabase.co/storage/contracts/[candidate_id]_contract.pdf"
}
```

### 7. Sign Contract
```http
POST /api/onboarding/sign-contract
Authorization: Bearer [token]
Content-Type: application/json

{
  "onboardingId": "uuid",
  "signature": "base64_encoded_signature",
  "acceptsTerms": true
}

Response:
{
  "success": true,
  "contractSigned": true,
  "message": "Contract signed successfully"
}
```

---

## 📊 COMPLETION LOGIC

### Progress Calculation

```typescript
const sections = [
  'personalInfoStatus',
  'govIdStatus',
  'resumeStatus',
  'educationStatus',
  'medicalStatus',
  'dataPrivacyStatus',
  'signatureStatus',
  'emergencyContactStatus'
]

// Each section = 12.5% (8 sections total)
let totalProgress = 0
sections.forEach(section => {
  if (onboarding[section] === 'SUBMITTED' || onboarding[section] === 'APPROVED') {
    totalProgress += 12.5
  }
})

const completionPercent = Math.min(Math.round(totalProgress), 100)
```

### Mark as Complete

Only an **admin/recruiter** can mark onboarding as complete:
- All 8 sections must be `APPROVED`
- Contract must be signed
- Then: `isComplete = true`, `completionPercent = 100`

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Database & API Setup
- [ ] Create database tables (candidate_onboarding, onboarding_tasks, employment_contracts)
- [ ] Create Supabase Storage bucket: `onboarding-documents`
- [ ] Create Supabase Storage bucket: `contracts`
- [ ] Set up bucket policies (private, authenticated access only)

### Phase 2: Backend APIs
- [ ] `POST /api/onboarding/initialize` - Create onboarding record
- [ ] `GET /api/onboarding?candidateId=X` - Fetch onboarding status
- [ ] `POST /api/onboarding/personal-info` - Submit Step 1
- [ ] `POST /api/onboarding/resume` - Submit Step 2
- [ ] `POST /api/onboarding/gov-ids` - Submit Step 3
- [ ] `POST /api/onboarding/education` - Submit Step 4
- [ ] `POST /api/onboarding/medical` - Submit Step 5
- [ ] `POST /api/onboarding/data-privacy` - Submit Step 6
- [ ] `POST /api/onboarding/signature` - Submit Step 7
- [ ] `POST /api/onboarding/emergency-contact` - Submit Step 8
- [ ] `POST /api/onboarding/documents/upload` - Upload files to Supabase Storage
- [ ] `POST /api/onboarding/generate-contract` - Generate contract HTML and PDF
- [ ] `POST /api/onboarding/sign-contract` - Sign contract
- [ ] `PATCH /api/admin/onboarding/[id]/[section]` - Admin review/approve

### Phase 3: Frontend Components
- [ ] `OnboardingWizard.tsx` - Main wizard modal
- [ ] `OnboardingStep1_PersonalInfo.tsx`
- [ ] `OnboardingStep2_Resume.tsx`
- [ ] `OnboardingStep3_GovIDs.tsx`
- [ ] `OnboardingStep4_Education.tsx`
- [ ] `OnboardingStep5_Medical.tsx`
- [ ] `OnboardingStep6_DataPrivacy.tsx`
- [ ] `OnboardingStep7_Signature.tsx`
- [ ] `OnboardingStep8_EmergencyContact.tsx`
- [ ] `FileUploadComponent.tsx` - Reusable file uploader
- [ ] `SignaturePad.tsx` - Canvas signature component
- [ ] `ContractPreview.tsx` - Display generated contract
- [ ] `OnboardingProgressBar.tsx` - Progress indicator

### Phase 4: Admin Panel
- [ ] `AdminOnboardingList.tsx` - List all onboarding records
- [ ] `AdminOnboardingReview.tsx` - Review/approve sections
- [ ] Dashboard stats: "Pending Onboarding", "Incomplete Onboarding"

### Phase 5: Integration
- [ ] Trigger onboarding on job acceptance (Step 10)
- [ ] Send email notification on onboarding creation
- [ ] Show banner on candidate dashboard if onboarding incomplete
- [ ] Pre-fill data from BPOC candidate profile

### Phase 6: Testing
- [ ] Test full wizard flow (8 steps)
- [ ] Test file uploads to Supabase Storage
- [ ] Test contract generation and PDF creation
- [ ] Test admin review/approval flow
- [ ] Test mobile responsiveness
- [ ] Test validation and error handling

---

## 🎯 SUCCESS CRITERIA

1. ✅ Candidate can complete all 8 onboarding steps
2. ✅ All Philippines 201 file documents are collected (SSS, TIN, PhilHealth, Pag-IBIG)
3. ✅ Contract is generated with Philippines labor law compliance
4. ✅ Candidate can digitally sign the contract
5. ✅ Admin can review and approve each section
6. ✅ System tracks progress (0-100%)
7. ✅ All data is stored securely in Supabase
8. ✅ Onboarding is triggered automatically after job acceptance

---

## 📦 DELIVERABLES

1. **Database Migration SQL** - Create all tables
2. **Backend API Routes** - All 13 endpoints
3. **Frontend Components** - 8 wizard steps + admin panel
4. **Contract Template** - Philippines labor law compliant
5. **Email Templates** - Onboarding notification
6. **Documentation** - API docs and user guide

---

## 🎓 PHILIPPINES LABOR LAW COMPLIANCE NOTES

**201 File Requirements** (per DOLE):
- SSS, TIN, PhilHealth, Pag-IBIG numbers
- Birth certificate or valid ID
- Educational credentials
- Employment history (resume)
- Medical certificate
- NBI clearance (optional)
- Emergency contact information

**Employment Contract Must Include**:
- Parties (Employer and Employee)
- Job description
- Compensation and benefits
- Work schedule
- Probationary period (max 6 months)
- Termination conditions
- Government-mandated benefits (SSS, PhilHealth, Pag-IBIG, 13th month pay)
- Confidentiality and data privacy clauses

---

**END OF PROMPT**

This is a production-ready, comprehensive prompt for an AI agent to build the complete onboarding system in one shot. All business logic, technical specs, and Philippines compliance requirements are included.
