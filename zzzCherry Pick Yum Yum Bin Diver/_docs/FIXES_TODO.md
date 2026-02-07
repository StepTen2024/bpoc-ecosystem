# Remaining Fixes - TODO List

## ✅ DONE
1. **Profile page bottom save button** - Fixed, now shows when editing
2. **Hydration error on home page** - Fixed, particles now client-side only
3. **Password validation** - Removed strict requirements

## 🔄 IN PROGRESS

### 1. Profile Completion Status
**Issue**: Dashboard shows "Complete Your Profile" even when 100% complete

**Added logging**: 
- Profile save now logs `profile_completed: true`
- Dashboard now logs `completed_data` value received from API

**Next step**: 
- Test Fred Nurk profile save
- Check browser console logs
- Verify `completed_data` is actually `true` in the API response

**If still not working:**
- Check Supabase `candidate_profiles` table directly
- Verify `profile_completed` column is set to `true`

---

### 2. Share Function (Facebook/LinkedIn)
**Issue**: You said share buttons don't generate proper links

**Current code**: Looks correct!
- Facebook: `https://www.facebook.com/sharer/sharer.php?u={resume_url}`
- LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url={resume_url}`
- URLs built from `window.location.href`

**Verification needed**:
- Test on localhost:3001/resume/fred-nurk-20
- Click "Share on Facebook" - should open Facebook share dialog
- Click "Share on LinkedIn" - should open LinkedIn share dialog

**If not working:**
- Check browser console for errors
- Verify `resumeUrl` is being generated correctly
- Check if pop-up blockers are preventing window.open()

---

## 🆕 TO DO

### 3. Auto-populate Phone & Location in Resume Builder
**Issue**: Resume asks for phone/location even though it's in profile

**Location**: `/candidate/resume/build` page

**Fix needed**:
```typescript
// When resume builder loads, check if user has profile data
useEffect(() => {
  const loadUserProfile = async () => {
    if (user?.id) {
      const res = await fetch(`/api/user/profile?userId=${user.id}`)
      const data = await res.json()
      
      // Pre-fill phone and location if they exist
      if (data.user.phone && !resumePayload.phone) {
        setResumePayload(prev => ({ ...prev, phone: data.user.phone }))
      }
      
      if (data.user.location && !resumePayload.location) {
        setResumePayload(prev => ({ ...prev, location: data.user.location }))
      }
      
      // Also pre-fill profile photo
      if (data.user.avatar_url && !profileImage) {
        setProfileImage(data.user.avatar_url)
      }
    }
  }
  
  loadUserProfile()
}, [user?.id])
```

**Files to modify:**
- `src/app/(candidate)/candidate/resume/build/page.tsx` - Add useEffect to load profile data

---

### 4. BPO-Specific AI Analysis Prompts
**Issue**: AI analysis is generic, should be BPO-focused

**Location**: `/api/candidates/ai-analysis`

**Current prompt**: Generic resume analysis

**New prompt needed**:
```
You are analyzing a resume for the BPO (Business Process Outsourcing) industry in the Philippines.

CONTEXT:
- Target roles: Customer Service, Sales, Admin, Technical Support, Web Development, Graphic Design, Virtual Assistant
- Industry: Remote/virtual work for international clients
- Required skills: English proficiency, communication, client-facing experience, tech tools (Zendesk, Salesforce, etc.)

DO NOT expect C-suite experience. Focus on:
1. BPO-relevant skills and tools
2. Measurable KPIs (call handling time, customer satisfaction scores, sales targets, WPM for typing, etc.)
3. Remote work experience
4. English communication skills
5. Client-facing roles
6. Achievements with numbers (e.g., "Handled 50+ calls per day", "Achieved 95% customer satisfaction")

SCORING:
- ATS Score (0-100): Keyword matching for BPO roles, proper formatting
- Content Quality (0-100): Quantifiable achievements, relevant experience
- Presentation (0-100): Grammar, clarity, professional structure

Return JSON with scores, strengths array, improvements array, and recommendations.
```

**Files to modify:**
- `src/app/api/candidates/ai-analysis/route.ts` - Update system prompt

---

### 5. AI "Improve" Button Prompts (Resume Builder)
**Issue**: Unknown what prompts are being used for "Improve Summary", "Optimize ATS", etc.

**Location**: Resume builder AI helper panel

**Prompts needed for each button:**

**"Improve Summary":**
```
Rewrite this professional summary for a BPO role. Keep it to 2-3 sentences. Focus on:
- Key BPO skills (communication, customer service, etc.)
- Years of experience
- Measurable achievements

Do NOT make things up. Only enhance what's already there.

Current summary: {current_text}
```

**"Optimize ATS":**
```
Add BPO-relevant keywords to improve ATS scoring. Only add keywords that are true based on the existing resume.

Common BPO keywords: Customer Service, Technical Support, Sales, Inbound/Outbound, CRM, Zendesk, Salesforce, KPI, English fluency, Remote work, Virtual Assistant

Current text: {current_text}
```

**"Enhance Job Description":**
```
Improve this job description by adding measurable achievements where possible.

Examples:
- "Handled customer calls" → "Handled 50+ customer calls daily with 95% satisfaction rating"
- "Managed emails" → "Processed 100+ support emails per day with 2-hour average response time"

Only add details that seem realistic based on the role. Do NOT invent fake numbers.

Current description: {current_text}
```

**Files to check:**
- `src/components/resume/AIHelperPanel.tsx` - Find AI improvement functions
- `src/app/api/resume/ai-improve/route.ts` (or similar) - Update prompts

---

### 6. Add "Save & Return to Dashboard" Button
**Issue**: Resume builder only has small back button top-left

**Location**: Resume builder page bottom

**Fix**: Add sticky bottom bar with:
- "Save Resume" button (primary)
- "Save & Return to Dashboard" button (secondary)

```tsx
{/* Bottom Action Bar */}
<div className="sticky bottom-0 left-0 right-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-xl border-t border-white/10 p-4">
  <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
    <p className="text-sm text-gray-400">
      {lastSaved ? `Last saved: ${lastSaved}` : 'Unsaved changes'}
    </p>
    <div className="flex gap-3">
      <Button 
        onClick={() => router.push('/candidate/dashboard')}
        variant="outline"
      >
        Return to Dashboard
      </Button>
      <Button 
        onClick={handleSave}
        className="bg-gradient-to-r from-cyan-500 to-blue-600"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Save Resume
      </Button>
    </div>
  </div>
</div>
```

**Files to modify:**
- `src/app/(candidate)/candidate/resume/build/page.tsx` - Add bottom sticky bar

---

### 7. PDF Export Extra Page Issue
**Issue**: PDF export adds an extra blank page

**Likely cause**: Page height calculation or margin issue in PDF generation

**Files to check:**
- PDF generation route (probably using Puppeteer or similar)
- Check page size settings and margins

**Typical fix:**
```css
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
  }
}
```

---

## Testing Checklist

After each fix:

1. **Profile Completion**
   - Save Fred Nurk's profile
   - Check console log shows `profile_completed: true`
   - Navigate to dashboard
   - Check console log shows `completed_data: true`
   - Verify banner disappears

2. **Share Function**
   - Go to /resume/fred-nurk-20
   - Click "Share on Facebook"
   - Should open Facebook share dialog with resume URL
   - Click "Share on LinkedIn"
   - Should open LinkedIn share dialog

3. **Auto-populate**
   - Go to resume builder
   - Check if phone field is pre-filled from profile
   - Check if location field is pre-filled from profile
   - Check if profile photo is pre-filled

4. **AI Analysis**
   - Upload new resume
   - Click "Start AI Analysis"
   - Check scores make sense for BPO industry
   - Verify strengths/improvements are BPO-relevant

5. **Resume Builder AI**
   - Click "Improve Summary"
   - Verify it doesn't make stuff up
   - Click "Optimize ATS"
   - Verify keywords are BPO-relevant

6. **Bottom Bar**
   - Verify sticky bar shows at bottom
   - Click "Return to Dashboard"
   - Should navigate back

7. **PDF Export**
   - Download PDF
   - Check if extra page still appears

---

**PRIORITY ORDER:**
1. Profile completion (critical UX issue)
2. Auto-populate phone/location (reduces friction)
3. BPO AI prompts (core value prop)
4. Bottom navigation bar (UX improvement)
5. Share function (likely already works)
6. PDF extra page (minor cosmetic issue)
