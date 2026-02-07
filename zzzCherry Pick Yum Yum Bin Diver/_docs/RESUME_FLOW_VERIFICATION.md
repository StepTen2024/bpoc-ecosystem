# Resume Builder Flow - Supabase Verification

## Database Tables Used

### 1. **candidate_resumes** 
**Purpose**: Stores extracted resume data and final resume JSON

**Columns:**
- `id` - UUID primary key
- `candidate_id` - FK to candidates table
- `extracted_data` - JSONB (raw extracted data from OCR/parser)
- `final_resume_data` - JSONB (final structured resume after AI enhancement)
- `file_url` - Original uploaded file URL
- `file_name` - Original file name
- `created_at`, `updated_at`

**When it's written:**
- Step 1: After resume upload → `/api/candidates/resume/save-extracted` saves `extracted_data`
- Step 3: After AI analysis → `/api/candidates/resume/save-final` saves `final_resume_data`

### 2. **candidate_work_experience**
**Purpose**: Stores individual job positions from resume

**Columns:**
- `id` - UUID primary key
- `candidate_id` - FK to candidates
- `company_name`
- `position`
- `start_date`, `end_date`
- `is_current`
- `description`
- `responsibilities` - TEXT array
- `achievements` - TEXT array

**When it's written:**
- After resume extraction → parsed from resume jobs section
- Saved via `/api/candidates/resume/save-extracted` sync

### 3. **candidate_education**
**Purpose**: Stores education history

**Columns:**
- `id` - UUID
- `candidate_id` - FK
- `institution_name`
- `degree`
- `field_of_study`
- `start_date`, `end_date`
- `gpa`
- `honors` - TEXT array

**When it's written:**
- After resume extraction → parsed from education section
- Saved during sync process

### 4. **candidate_skills**
**Purpose**: Stores skills extracted from resume

**Columns:**
- `id` - UUID
- `candidate_id` - FK
- `skill_name`
- `category` - (technical, soft, language, tool, etc.)
- `proficiency_level` - (beginner, intermediate, advanced, expert)
- `years_experience`

**When it's written:**
- After resume extraction
- Skills categorized and saved via sync

### 5. **candidate_ai_analysis**
**Purpose**: Stores AI analysis scores and recommendations

**Columns:**
- `id` - UUID
- `candidate_id` - FK
- `resume_id` - FK to candidate_resumes
- `ats_score` - INTEGER (0-100)
- `content_quality_score` - INTEGER (0-100)
- `presentation_score` - INTEGER (0-100)
- `overall_score` - INTEGER (0-100)
- `strengths` - TEXT array
- `improvements` - TEXT array
- `recommendations` - JSONB
- `keyword_matches` - JSONB
- `created_at`

**When it's written:**
- Step 2: After "Start AI Analysis" clicked
- Route: `/api/candidates/ai-analysis`

### 6. **candidate_truth** (VIEW)
**Purpose**: Aggregated view combining all candidate data

**Includes:**
- Profile info
- Work experience
- Education
- Skills
- Resume scores
- AI analysis

**When it's accessed:**
- When displaying candidate summary
- For job matching algorithms
- For recruiter candidate views

---

## Resume Upload Flow - Step by Step

### **Step 1: Upload Resume**
**User Action**: Upload PDF/DOCX file

**What Happens:**
1. File uploaded to Supabase Storage → `candidate` bucket under `resumes/` folder
2. CloudConvert API converts to text/JSON
3. OCR extraction using AI
4. Data saved to `candidate_resumes.extracted_data`
5. Sync process creates records in:
   - `candidate_work_experience` (from jobs section)
   - `candidate_education` (from education section)
   - `candidate_skills` (from skills section)

**API Routes:**
- `POST /api/candidates/resume/process` - Upload & extract
- `POST /api/candidates/resume/save-extracted` - Save extracted data

**Verification:**
```sql
-- Check if resume was extracted
SELECT id, candidate_id, file_name, created_at 
FROM candidate_resumes 
WHERE candidate_id = 'USER_ID';

-- Check extracted jobs
SELECT company_name, position, start_date, end_date
FROM candidate_work_experience
WHERE candidate_id = 'USER_ID';

-- Check extracted education
SELECT institution_name, degree, field_of_study
FROM candidate_education
WHERE candidate_id = 'USER_ID';

-- Check extracted skills
SELECT skill_name, category, proficiency_level
FROM candidate_skills
WHERE candidate_id = 'USER_ID';
```

---

### **Step 2: AI Analysis**
**User Action**: Click "Start AI Analysis"

**What Happens:**
1. Calls `/api/candidates/ai-analysis`
2. AI analyzes resume for:
   - ATS compatibility (keyword matching, formatting)
   - Content quality (achievements, quantifiable results)
   - Presentation (grammar, structure, clarity)
3. Generates scores and recommendations
4. Saves to `candidate_ai_analysis` table

**AI Prompt Focus for BPO Industry:**
```
Context: This is a resume for the BPO (Business Process Outsourcing) industry in the Philippines.
Common roles: Customer Service, Sales, Admin, Web Development, Graphic Design, Virtual Assistant, Technical Support.

Analyze for:
1. BPO-relevant skills (communication, tools like Zendesk, Salesforce, etc.)
2. Virtual work experience (remote, work-from-home)
3. English proficiency indicators
4. Client-facing experience
5. Measurable KPIs (call handling time, customer satisfaction, sales targets)

DO NOT expect C-suite experience. Focus on practical BPO skills.
```

**Verification:**
```sql
-- Check AI analysis scores
SELECT 
  ats_score, 
  content_quality_score, 
  presentation_score, 
  overall_score,
  strengths,
  improvements
FROM candidate_ai_analysis
WHERE candidate_id = 'USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

---

### **Step 3: Resume Builder**
**User Action**: Build/edit resume with AI enhancements

**What Happens:**
1. Load extracted data from `candidate_resumes.extracted_data`
2. Pre-fill resume fields (jobs, education, skills)
3. User can:
   - Edit content
   - Change layout (Modern, Executive, Creative, Minimal)
   - Change colors (primary/secondary)
   - Add profile photo (from `candidate.avatar_url` or upload new headshot)
   - Use AI to improve sections
4. Save to `candidate_resumes.final_resume_data`

**Profile Photo Logic:**
- **First check**: Use `candidate.avatar_url` (already uploaded in profile)
- **If no photo**: Allow upload to `candidate` bucket under `headshots/` folder
- **Save to**: `candidate.avatar_url` for profile, embedded in resume JSON

**AI Enhancement Prompts:**
Each "Improve" button should:
- Improve Summary: Rewrite professional summary for BPO industry
- Optimize ATS: Add relevant keywords for BPO jobs
- Enhance Job Description: Add measurable achievements

**Verification:**
```sql
-- Check final resume data
SELECT final_resume_data 
FROM candidate_resumes 
WHERE candidate_id = 'USER_ID';

-- Check if photo is set
SELECT avatar_url 
FROM candidates 
WHERE id = 'USER_ID';
```

---

### **Step 4: Save & Share**
**User Action**: Click "Save Resume"

**What Happens:**
1. Final resume JSON saved to `candidate_resumes.final_resume_data`
2. Generates public URL: `/resume/{slug}-{id}`
3. User can:
   - Download PDF
   - Share on social media (needs fix - see below)
   - View public resume page

**Issues to Fix:**
1. **Share function not working** - Social share buttons don't generate proper links
2. **PDF export adds extra page** - Pagination issue in PDF generation

**Verification:**
```sql
-- Check if resume is saved
SELECT 
  id,
  candidate_id,
  final_resume_data IS NOT NULL as has_final_data,
  created_at,
  updated_at
FROM candidate_resumes
WHERE candidate_id = 'USER_ID';
```

---

## Current Issues & Fixes Needed

### ✅ **VERIFIED WORKING:**
1. Resume extraction saves to Supabase `candidate_resumes`
2. Jobs, education, skills sync to respective tables
3. AI analysis saves scores
4. Resume builder loads extracted data
5. PDF export works (with minor pagination issue)

### ❌ **NEEDS FIXING:**

#### 1. **Profile Completion Status**
**Issue**: Dashboard still shows "Complete Your Profile" even when 100% complete

**Fix**: Check that `profile_completed` flag is being read correctly
```sql
-- Verify profile completion flag
SELECT profile_completed 
FROM candidate_profiles 
WHERE candidate_id = 'FRED_NURK_ID';
```

If it's `false`, the issue is in the profile save. If it's `true`, the issue is in the dashboard display logic.

#### 2. **Share Function**
**Issue**: Social share buttons don't generate proper links

**Fix Location**: `/resume/[slug]` page - share button onClick handlers

**Expected Behavior:**
- Facebook: `https://facebook.com/sharer/sharer.php?u={resume_url}`
- LinkedIn: `https://linkedin.com/sharing/share-offsite/?url={resume_url}`
- Twitter: `https://twitter.com/intent/tweet?url={resume_url}&text=Check out my resume!`

#### 3. **Auto-populate Phone & Location**
**Issue**: Resume builder asks for phone/location even though it's in profile

**Fix**: Pre-fill from `candidate.phone` and `candidate_profiles.location`

#### 4. **AI Analysis Prompts for BPO**
**Current**: Generic resume analysis
**Needed**: BPO-industry specific prompts

**Fix Location**: `/api/candidates/ai-analysis` - Update system prompt

#### 5. **Back Button in Resume Builder**
**Issue**: Only way back is top-left button
**Fix**: Add "Save & Return to Dashboard" button at bottom

---

## Verification Checklist

Run these SQL queries in Supabase to verify Fred Nurk's data:

```sql
-- 1. Check candidate exists
SELECT * FROM candidates WHERE email = 'fred.nurk@test.com';

-- 2. Check profile completion
SELECT profile_completed, location, birthday, work_status 
FROM candidate_profiles 
WHERE candidate_id = (SELECT id FROM candidates WHERE email = 'fred.nurk@test.com');

-- 3. Check resume extracted
SELECT id, file_name, extracted_data IS NOT NULL, final_resume_data IS NOT NULL 
FROM candidate_resumes 
WHERE candidate_id = (SELECT id FROM candidates WHERE email = 'fred.nurk@test.com');

-- 4. Check work experience
SELECT company_name, position, start_date, end_date 
FROM candidate_work_experience 
WHERE candidate_id = (SELECT id FROM candidates WHERE email = 'fred.nurk@test.com');

-- 5. Check education
SELECT institution_name, degree 
FROM candidate_education 
WHERE candidate_id = (SELECT id FROM candidates WHERE email = 'fred.nurk@test.com');

-- 6. Check skills
SELECT skill_name, category 
FROM candidate_skills 
WHERE candidate_id = (SELECT id FROM candidates WHERE email = 'fred.nurk@test.com');

-- 7. Check AI analysis
SELECT ats_score, content_quality_score, overall_score 
FROM candidate_ai_analysis 
WHERE candidate_id = (SELECT id FROM candidates WHERE email = 'fred.nurk@test.com');
```

---

**Next Steps:**
1. Run the SQL verification queries
2. Fix profile completion status display
3. Fix share function links
4. Update AI prompts for BPO industry
5. Add auto-populate for phone/location in resume builder
6. Add "Save & Return" button
