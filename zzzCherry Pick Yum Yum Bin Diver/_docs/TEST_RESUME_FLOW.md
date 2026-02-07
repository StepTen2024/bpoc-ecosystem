# Resume Flow Testing Guide

## ✅ CRITICAL FIXES APPLIED

### Fix #1: Created Missing API Endpoint
**File:** `src/app/api/get-api-key/route.ts`
- Returns OpenAI and CloudConvert API keys
- Handles missing keys gracefully
- **Status:** ✅ FIXED

### Fix #2: Added Immediate Skills Sync
**File:** `src/app/api/candidates/resume/save-extracted/route.ts`
- Added `convertSkillsToSyncFormat()` helper function
- Skills now sync to `candidate_skills` table immediately after upload
- Doesn't wait for AI analysis step
- **Status:** ✅ FIXED

### Fix #3: CloudConvert Retry Logic
**File:** `src/lib/utils.ts`
- Already had retry logic for uploads (3 attempts)
- Already had retry logic for downloads (3 attempts)
- Timeout set to 5 minutes (30 checks × 10 seconds)
- **Status:** ✅ ALREADY WORKING

---

## 🧪 HOW TO TEST

### Prerequisites
```bash
# 1. Make sure environment variables are set
OPENAI_API_KEY=sk-...
CLOUDCONVERT_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 2. Start the dev server
npm run dev
```

### Test Scenario 1: Email Sign-Up + Resume Upload

```bash
# 1. Go to http://localhost:3001
# 2. Click "Sign Up" as Candidate
# 3. Use test email: testcandidate@bpoc.io
# 4. Complete sign-up
# 5. Navigate to Resume Upload: /candidate/resume/upload
```

**Expected Results:**
```
✅ File upload button visible
✅ Can drag-and-drop or click to upload
✅ Console shows: "🔑 API keys obtained successfully"
✅ Console shows CloudConvert progress: "📤 Step 1: Converting file..."
✅ Console shows GPT OCR: "🤖 Step 2: Performing GPT Vision OCR..."
✅ Progress bar animates through all steps
✅ Redirects to /candidate/resume/analysis
```

**Database Verification:**
```sql
-- Check resume was saved
SELECT 
  id, 
  candidate_id, 
  slug, 
  title,
  extracted_data->>'name' as name,
  extracted_data->'skills' as skills
FROM candidate_resumes 
WHERE candidate_id = 'YOUR_USER_ID';

-- Check skills were synced immediately
SELECT 
  id,
  candidate_id,
  name,
  category,
  proficiency_level
FROM candidate_skills 
WHERE candidate_id = 'YOUR_USER_ID';
-- ✅ Should have rows! (NEW FIX)
```

---

### Test Scenario 2: AI Analysis + Skills Sync

```bash
# 1. After upload, you're at /candidate/resume/analysis
# 2. Click "Start AI Analysis"
```

**Expected Results:**
```
✅ Pacman loader appears
✅ Progress bar shows 0% → 100%
✅ Console shows: "🤖 Starting AI analysis..."
✅ Console shows: "🔄 Syncing to structured tables..."
✅ Console shows: "✅ Synced X skills to candidate_skills table"
✅ Analysis results display with scores
✅ "Continue to Resume Builder" button appears
```

**Database Verification:**
```sql
-- Check AI analysis was saved
SELECT 
  id,
  candidate_id,
  overall_score,
  ats_compatibility_score,
  skills_snapshot,
  experience_snapshot
FROM candidate_ai_analysis 
WHERE candidate_id = 'YOUR_USER_ID'
ORDER BY created_at DESC 
LIMIT 1;

-- Check skills table (should be updated with AI-extracted skills)
SELECT COUNT(*) as skill_count
FROM candidate_skills 
WHERE candidate_id = 'YOUR_USER_ID';
-- ✅ Should have rows (either from upload sync OR AI sync)

-- Check experience table
SELECT COUNT(*) as exp_count
FROM candidate_work_experiences 
WHERE candidate_id = 'YOUR_USER_ID';
-- ✅ Should have rows if resume had work history

-- Check education table
SELECT COUNT(*) as edu_count
FROM candidate_educations 
WHERE candidate_id = 'YOUR_USER_ID';
-- ✅ Should have rows if resume had education
```

---

### Test Scenario 3: Resume Builder

```bash
# 1. After analysis, click "Continue to Resume Builder"
# 2. You're at /candidate/resume/build
```

**Expected Results:**
```
✅ Resume preview appears with extracted data
✅ Can change template (Modern, Executive, Creative, Minimal)
✅ Can change colors
✅ Can edit name, email, phone inline
✅ Can add/edit experience, education, skills
✅ Click "Save Resume" button
✅ Console shows: "💾 Saving to database..."
✅ Toast notification: "Resume saved!"
```

**Database Verification:**
```sql
-- Check generated resume was saved
SELECT 
  id,
  generated_data,
  template_id,
  color_scheme,
  updated_at
FROM candidate_resumes 
WHERE candidate_id = 'YOUR_USER_ID' 
AND is_primary = true;

-- generated_data should have final customized resume
```

---

## 🔍 WHAT TO CHECK FOR ISSUES

### Issue #1: API Keys Not Working
**Symptoms:**
- Error: "API keys not configured"
- Upload immediately goes to demo mode
- No CloudConvert logs

**Fix:**
```bash
# Check .env.local file
cat .env.local | grep -E "OPENAI|CLOUDCONVERT"

# Should show:
OPENAI_API_KEY=sk-...
CLOUDCONVERT_API_KEY=...
```

---

### Issue #2: Skills Not Syncing
**Symptoms:**
- Resume uploads successfully
- AI analysis completes
- But `candidate_skills` table is empty

**Debug:**
```sql
-- Check what's in extracted_data
SELECT extracted_data->'skills' as skills_json
FROM candidate_resumes 
WHERE candidate_id = 'YOUR_USER_ID';

-- Check console logs for:
"🔄 Syncing skills immediately to candidate_skills table..."
"✅ Synced X skills immediately"

-- OR

"⚠️ No skills found in resume data"
```

**Expected:** With new fix, skills should sync even if AI analysis is skipped!

---

### Issue #3: CloudConvert Fails
**Symptoms:**
- Upload starts but fails during conversion
- Error: "CloudConvert conversion failed"

**Debug:**
```javascript
// Check console logs for:
"❌ CloudConvert conversion failed: Invalid CloudConvert API key"
// → API key is wrong

"❌ CloudConvert conversion failed: rate limit exceeded"
// → Too many requests, wait 5 minutes

"❌ CloudConvert conversion failed: timeout"
// → File too large or CloudConvert slow
```

**Fix:**
- Verify CloudConvert API key in dashboard
- Check CloudConvert usage limits
- Try smaller file

---

## 📊 COMPLETE DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        STEP 1: UPLOAD                           │
└─────────────────────────────────────────────────────────────────┘
                                ↓
                     [User uploads PDF/DOCX]
                                ↓
                  GET /api/get-api-key ← ✅ NEW FIX
                                ↓
              [CloudConvert: PDF → JPEG]
                                ↓
              [GPT Vision OCR: JPEG → Text]
                                ↓
                [Create structured JSON]
                                ↓
        POST /api/candidates/resume/save-extracted
                                ↓
        ┌───────────────────────────────────┐
        │   candidate_resumes table         │
        │   - extracted_data: {...}         │
        │   - file_url: https://...         │
        │   - slug: john-doe-42             │
        └───────────────────────────────────┘
                                ↓
           🔄 IMMEDIATE SKILLS SYNC ← ✅ NEW FIX
                                ↓
        ┌───────────────────────────────────┐
        │   candidate_skills table          │
        │   - JavaScript (technical)        │
        │   - Python (technical)            │
        │   - Communication (soft)          │
        └───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      STEP 2: AI ANALYSIS                        │
└─────────────────────────────────────────────────────────────────┘
                                ↓
              POST /api/candidates/ai-analysis/analyze
                                ↓
              [Claude Sonnet 4.5 analyzes resume]
                                ↓
        ┌───────────────────────────────────┐
        │   candidate_ai_analysis table     │
        │   - overall_score: 85             │
        │   - skills_snapshot: [...]        │
        │   - experience_snapshot: [...]    │
        │   - education_snapshot: [...]     │
        └───────────────────────────────────┘
                                ↓
              syncAllFromAnalysis()
                                ↓
        ┌───────────────────────────────────────────────────────┐
        │  candidate_skills (UPDATED with AI-extracted skills)  │
        │  candidate_work_experiences (NEW ROWS)                │
        │  candidate_educations (NEW ROWS)                      │
        └───────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STEP 3: RESUME BUILDER                       │
└─────────────────────────────────────────────────────────────────┘
                                ↓
              [User customizes template & colors]
                                ↓
        POST /api/candidates/resume/save-generated
                                ↓
        ┌───────────────────────────────────┐
        │   candidate_resumes (UPDATE)      │
        │   - generated_data: {...}         │
        │   - template_id: modern           │
        │   - color_scheme: ocean           │
        └───────────────────────────────────┘
```

---

## ✅ SUCCESS CRITERIA

After testing, you should see:

### Database Tables Populated:
- ✅ `candidate_resumes` - 1 row per user (is_primary = true)
- ✅ `candidate_ai_analysis` - 1+ rows per analysis session
- ✅ `candidate_skills` - Multiple rows (3-20+ skills) ← **CRITICAL CHECK**
- ✅ `candidate_work_experiences` - Rows if resume had work history
- ✅ `candidate_educations` - Rows if resume had education

### Console Logs Should Show:
```
✅ API keys retrieved successfully
✅ Step 1 Complete: File converted to JPEG
✅ Step 2 Complete: Text extracted via GPT OCR
✅ Step 3 Complete: Organized DOCX created
✅ Step 4 Complete: JSON extracted
✅ Step 5 Complete: Final resume built
✅ Resume saved to your profile!
🔄 Syncing skills immediately to candidate_skills table...
✅ Synced 8 skills immediately
```

---

## 🐛 KNOWN LIMITATIONS

1. **Max file size: 10MB** (frontend) / **100MB** (CloudConvert)
2. **CloudConvert timeout: 5 minutes** for conversion
3. **Skills categorization:** Uses keyword matching (can be improved with AI)
4. **Duplicate resumes:** Re-uploading creates new file in storage (could be optimized)

---

## 📝 NEXT STEPS IF ISSUES FOUND

If tests reveal issues:

1. **Check environment variables** first
2. **Check Supabase RLS policies** - User must have access to their own data
3. **Check console logs** for specific error messages
4. **Check database directly** with SQL queries above
5. **Report specific error** with:
   - User ID
   - Error message
   - Console logs
   - Database state

---

**Created:** 2026-01-21  
**Status:** Ready for testing with all critical fixes applied
