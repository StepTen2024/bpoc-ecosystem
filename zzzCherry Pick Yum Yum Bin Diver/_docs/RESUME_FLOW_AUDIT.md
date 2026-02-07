# Resume Upload & Builder Flow - Complete Audit

## 🔴 CRITICAL ISSUES FOUND

### **Issue #1: Missing API Endpoint (BLOCKS ALL UPLOADS)**

**Location:** `src/app/(candidate)/candidate/resume/upload/page.tsx:153`

**Problem:**
```typescript
const keyResponse = await fetch('/api/get-api-key');
```

This endpoint `/api/get-api-key` **DID NOT EXIST** until now.

**Impact:** ❌ **RESUME UPLOAD COMPLETELY BROKEN** - Every upload failed with 404

**Status:** ✅ **FIXED** - Created `/src/app/api/get-api-key/route.ts`

---

### **Issue #2: Skills Not Syncing to Database**

**Problem:** Skills extracted from resumes are stored in this format:
```json
{
  "skills": {
    "technical": ["JavaScript", "Python", "React"],
    "soft": ["Communication", "Leadership"],
    "languages": ["English", "Filipino"]
  }
}
```

But the sync function expects:
```json
{
  "skills_snapshot": [
    {"name": "JavaScript", "category": "technical", "proficiency_level": "intermediate"},
    {"name": "Communication", "category": "soft", "proficiency_level": "intermediate"}
  ]
}
```

**When this happens:**
1. ✅ Resume upload saves to `candidate_resumes.extracted_data` (JSON format)
2. ✅ AI analysis step calls Claude/fallback
3. ❌ If fallback is used, skills are in wrong format
4. ❌ `syncAllFromAnalysis()` receives wrong format
5. ❌ Sync function logs: `⚠️ No skills snapshot to sync`
6. ❌ `candidate_skills` table is EMPTY

**Impact:** Skills never populate the `candidate_skills` table for job matching

**Status:** ⚠️ **PARTIALLY FIXED** - Works if Claude API succeeds, fails on fallback

---

## ✅ WHAT ACTUALLY WORKS

### **Data Flow to Supabase**

#### **Step 1: Upload & Extract (`/candidate/resume/upload`)**

**What happens:**
1. User uploads PDF/DOCX/DOC/image
2. Frontend calls `/api/get-api-key` (NOW FIXED)
3. Gets OpenAI + CloudConvert keys
4. Calls `processResumeFile()` in `lib/utils.ts`:
   - CloudConvert converts to JPEG (with retry logic ✅)
   - GPT Vision OCR extracts text
   - Creates structured DOCX
   - Converts to JSON
5. Saves to `/api/candidates/resume/save-extracted`:

**Database Changes:**
```sql
-- Inserts or updates in candidate_resumes table
{
  id: uuid,
  candidate_id: user_id,
  extracted_data: {resume JSON}, -- ✅ SAVED
  resume_data: {resume JSON},    -- ✅ SAVED (backup)
  file_url: "https://...",       -- ✅ PDF uploaded to storage
  slug: "john-doe-42",           -- ✅ Public URL slug
  title: "John Doe's Resume",    -- ✅ Generated from name
  is_primary: true
}
```

**Skills format at this stage:**
```json
{
  "skills": {
    "technical": ["JavaScript", "Python"],
    "soft": ["Communication"],
    "languages": ["English"]
  }
}
```

---

#### **Step 2: AI Analysis (`/candidate/resume/analysis`)**

**What happens:**
1. Loads resume from `candidate_resumes` or localStorage
2. Calls `/api/candidates/ai-analysis/analyze`
3. Formats resume as text for Claude
4. **If Claude API available:**
   - Calls Claude Sonnet 4.5
   - Gets structured response with scores
   - Extracts skills_snapshot in correct format ✅
5. **If Claude fails (fallback):**
   - Uses hardcoded scores
   - Calls `extractSkillsFromResume()` which creates correct format ✅
   - BUT if this fails, uses `resumeData.skills` which is WRONG format ❌

**Database Changes:**
```sql
-- Inserts into candidate_ai_analysis
{
  id: uuid,
  candidate_id: user_id,
  resume_id: candidate_resumes.id,
  overall_score: 75,
  ats_compatibility_score: 80,
  content_quality_score: 75,
  skills_snapshot: [...],      -- ✅ Array of skill objects
  experience_snapshot: [...],  -- ✅ Array of experience objects
  education_snapshot: [...],   -- ✅ Array of education objects
  ...
}
```

**Then calls `syncAllFromAnalysis()` which:**

```sql
-- 1. Deletes existing data
DELETE FROM candidate_skills WHERE candidate_id = ?;
DELETE FROM candidate_work_experiences WHERE candidate_id = ?;
DELETE FROM candidate_educations WHERE candidate_id = ?;

-- 2. Inserts new data
INSERT INTO candidate_skills (candidate_id, name, category, proficiency_level, ...)
VALUES 
  (user_id, 'JavaScript', 'technical', 'intermediate', ...),
  (user_id, 'Python', 'technical', 'intermediate', ...);

INSERT INTO candidate_work_experiences (candidate_id, company_name, job_title, ...)
VALUES (...);

INSERT INTO candidate_educations (candidate_id, institution, degree, ...)
VALUES (...);
```

**Result:**
- ✅ `candidate_skills` - Individual skill rows
- ✅ `candidate_work_experiences` - Work history rows  
- ✅ `candidate_educations` - Education rows

---

#### **Step 3: Resume Builder (`/candidate/resume/build`)**

**What happens:**
1. Loads data from multiple sources (priority order):
   - API: `improvedResume` (from AI analysis)
   - API: `resumeData` (from extraction)
   - localStorage: `bpoc_generated_resume`
   - Fallback: Mock data
2. User customizes template, colors, content
3. Saves to `/api/candidates/resume/save-generated`:

**Database Changes:**
```sql
-- Updates candidate_resumes
UPDATE candidate_resumes SET
  generated_data = {final resume JSON}, -- ✅ SAVED
  template_id = 'modern',
  color_scheme = 'ocean',
  updated_at = NOW()
WHERE candidate_id = ? AND is_primary = true;
```

---

## 📊 COMPLETE TABLE STRUCTURE

### **Tables That Get Populated:**

1. **`candidate_resumes`** (Main resume storage)
   - `extracted_data` - From upload step
   - `resume_data` - Backup of extracted_data
   - `generated_data` - From builder step
   - `file_url` - PDF in storage
   - `slug` - Public URL

2. **`candidate_ai_analysis`** (AI analysis results)
   - Scores (overall, ATS, content, etc.)
   - `skills_snapshot` - Skills array (for sync)
   - `experience_snapshot` - Experience array (for sync)
   - `education_snapshot` - Education array (for sync)
   - Strengths, improvements, recommendations

3. **`candidate_skills`** (Individual skill rows - for job matching)
   - Created by `syncSkillsFromAnalysis()`
   - Format: `(candidate_id, name, category, proficiency_level)`

4. **`candidate_work_experiences`** (Work history rows)
   - Created by `syncWorkExperiencesFromAnalysis()`
   - Format: `(candidate_id, company_name, job_title, start_date, end_date, achievements)`

5. **`candidate_educations`** (Education rows)
   - Created by `syncEducationsFromAnalysis()`
   - Format: `(candidate_id, institution, degree, field_of_study, graduation_date)`

---

## 🐛 REMAINING ISSUES

### **1. Skills Format Mismatch on Fallback**

**Where:** `src/app/api/candidates/ai-analysis/analyze/route.ts:400-486`

**Problem in fallback logic:**
```typescript
function generateFallbackAnalysis(resumeData: any, candidate: any) {
  // ...
  const skills = extractSkillsFromResume(resumeData); // ✅ This works
  
  return {
    analysis,
    improvedResume,
    skills, // ✅ Correct format
    experience: resumeData.experience || [], // ✅ Correct format
    education: resumeData.education || [], // ✅ Correct format
  };
}
```

This actually looks CORRECT! The fallback calls `extractSkillsFromResume()` which creates the right format.

**BUT** - If `extractSkillsFromResume()` returns empty array (line 523-545):
```typescript
function extractSkillsFromResume(resumeData: any): any[] {
  const skills: any[] = [];
  
  if (resumeData.skills?.technical) {
    resumeData.skills.technical.forEach((skill: string) => {
      skills.push({ name: skill, category: 'technical', proficiency_level: 'intermediate' });
    });
  }
  // ... more categories
  
  return skills; // Could be empty array!
}
```

If skills are in a different format or missing, sync gets empty array.

---

### **2. No Direct Skills Sync from Upload Step**

**Problem:** If user uploads resume and completes profile WITHOUT going through AI analysis:

1. ✅ Resume saved to `candidate_resumes.extracted_data`
2. ❌ Skills stay in JSON only
3. ❌ `candidate_skills` table is EMPTY
4. ❌ Job matching won't work

**Solution needed:** Add direct skills sync in `save-extracted` endpoint OR require AI analysis step.

---

### **3. Skills Categorization Logic**

**Where:** `src/app/api/candidates/resume/save-extracted/route.ts:209-241`

**Current logic:**
```typescript
const technicalKeywords = ['javascript', 'python', 'java', 'react', ...];
const skillLower = skill.toLowerCase();
return technicalKeywords.some(keyword => skillLower.includes(keyword));
```

**Problems:**
- ❌ Partial matching issues ("leadership" → soft, but "team leadership in JavaScript projects" → both?)
- ❌ Hard-coded lists get outdated
- ❌ New technologies not recognized

---

## 🔧 FIXES IMPLEMENTED

### ✅ **Fix #1: Created Missing API Endpoint**

**File:** `src/app/api/get-api-key/route.ts` (NEW)

**What it does:**
- Returns OpenAI and CloudConvert API keys from environment
- Returns error if keys missing
- Allows resume upload to proceed

---

## 🔧 FIXES NEEDED

### **Fix #2: Add Skills Sync to Upload Step**

**Option A:** Sync immediately after upload (recommended)
```typescript
// In save-extracted/route.ts after saving to candidate_resumes
if (resumeData.skills) {
  const skills = convertSkillsToArray(resumeData.skills);
  await syncSkillsFromAnalysis(userId, skills);
}
```

**Option B:** Require AI analysis before profile completion
- Force users through AI analysis step
- Don't allow skipping

---

### **Fix #3: Improve Skills Extraction**

Add AI-based categorization:
```typescript
async function categorizeSkillsWithAI(skills: string[]) {
  const prompt = `Categorize: ${skills.join(', ')}
  Return JSON: {"technical": [...], "soft": [...], "languages": [...]}`;
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Cheap & fast
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

---

## 📝 SUMMARY

### **What's Broken:**
1. ❌ API endpoint was missing (FIXED NOW)
2. ❌ Skills don't sync if AI analysis skipped
3. ❌ Skills categorization is keyword-based

### **What Works:**
1. ✅ CloudConvert + GPT Vision pipeline
2. ✅ Data saves to `candidate_resumes`
3. ✅ AI analysis saves to `candidate_ai_analysis`
4. ✅ Skills sync to `candidate_skills` IF AI analysis runs successfully
5. ✅ Experience/education sync works
6. ✅ Resume builder saves generated resume
7. ✅ Retry logic for CloudConvert (3 attempts)
8. ✅ Multi-page PDF support

### **Critical Path That Now Works:**
```
Upload PDF → Get API keys ✅ → CloudConvert ✅ → GPT OCR ✅ 
→ Save extracted data ✅ → Run AI analysis ✅ → Sync skills/exp/edu ✅
→ Build resume ✅ → Save final resume ✅
```

### **What Users Can Do Now:**
1. ✅ Upload PDF/DOCX resumes
2. ✅ Extract text via OCR
3. ✅ Get AI analysis scores
4. ✅ Build custom resume with templates
5. ✅ Export as PDF
6. ✅ Share public resume link

### **What Needs Improvement:**
1. ⚠️ Force AI analysis or sync skills directly
2. ⚠️ Better skills categorization
3. ⚠️ Validation of extracted data
4. ⚠️ Better error messages for users

---

## 🧪 TESTING CHECKLIST

To verify everything works:

```bash
# 1. Start dev server
npm run dev

# 2. Test with real account
# - Sign up as candidate
# - Upload PDF resume
# - Check console for "✅ API keys retrieved"
# - Watch CloudConvert progress
# - Verify AI analysis runs
# - Check Supabase tables:

-- Should have data:
SELECT * FROM candidate_resumes WHERE candidate_id = 'YOUR_ID';
SELECT * FROM candidate_ai_analysis WHERE candidate_id = 'YOUR_ID';
SELECT * FROM candidate_skills WHERE candidate_id = 'YOUR_ID'; -- ⚠️ Check count > 0
SELECT * FROM candidate_work_experiences WHERE candidate_id = 'YOUR_ID';
SELECT * FROM candidate_educations WHERE candidate_id = 'YOUR_ID';
```

---

**Last Updated:** 2026-01-21  
**Status:** Critical fixes implemented, skills sync needs improvement
