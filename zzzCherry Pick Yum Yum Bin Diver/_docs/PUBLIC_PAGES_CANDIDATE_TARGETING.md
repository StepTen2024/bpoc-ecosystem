# 🎯 PUBLIC PAGES - CANDIDATE TARGETING (NOT LOGGED IN)

## For Design Agent: Complete Frontend for Candidate-Facing Pages

---

## 🔍 ISSUE FOUND

**The 5 new tool pages DON'T have Header/Footer!**

- Home page: ✅ Has `<Header />` and `<Footer />`
- Jobs page: ✅ Has Header/Footer  
- Tools pages: ❌ **NO Header/Footer** (floating in the void!)

---

## 📋 ALL PUBLIC CANDIDATE-FACING PAGES

### ✅ Core Marketing Pages (PRIORITY 1)

| Route | File | Status | Has Header/Footer | Purpose |
|-------|------|--------|-------------------|---------|
| `/` | `src/app/page.tsx` | ✅ Working | ✅ Yes | Landing page (redirects to /home) |
| `/home` | `src/app/home/page.tsx` | ✅ Working | ✅ Yes | **SICK homepage** with tools showcase |
| `/jobs` | `src/app/jobs/page.tsx` | ✅ Working | ✅ Yes | Job listings page |
| `/jobs/[id]` | `src/app/jobs/[id]/page.tsx` | ✅ Working | ✅ Yes | Individual job details |
| `/about` | `src/app/about/page.tsx` | ✅ Working | ✅ Yes | About BPOC Careers |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | ✅ Working | ✅ Yes | How the platform works |

---

### 🛠️ FREE TOOLS (PRIORITY 1 - FIX NAV/FOOTER!)

| Route | File | Status | Has Header/Footer | Design Status |
|-------|------|--------|-------------------|---------------|
| `/tools` | `src/app/tools/page.tsx` | ✅ Working | ❌ **NO NAV/FOOTER** | ⚠️ Basic white page |
| `/tools/typing-test` | `src/app/tools/typing-test/page.tsx` | ✅ WORKS | ❌ **NO NAV/FOOTER** | ✅ **SICK dark theme** |
| `/tools/email-signature` | `src/app/tools/email-signature/page.tsx` | ✅ WORKS | ❌ **NO NAV/FOOTER** | ✅ **SICK dark theme** |
| `/tools/salary-calculator` | `src/app/tools/salary-calculator/page.tsx` | ✅ WORKS | ❌ **NO NAV/FOOTER** | ✅ **SICK dark theme** |
| `/tools/linkedin-optimizer` | `src/app/tools/linkedin-optimizer/page.tsx` | ✅ WORKS | ❌ **NO NAV/FOOTER** | ⏳ Needs dark reskin |
| `/tools/skills-gap` | `src/app/tools/skills-gap/page.tsx` | ✅ WORKS | ❌ **NO NAV/FOOTER** | ⏳ Needs dark reskin |

**ACTION NEEDED**: Add Header/Footer to ALL tool pages!

---

### 📝 Resume Builder (PRIORITY 2)

| Route | File | Status | Has Header/Footer | Purpose |
|-------|------|--------|-------------------|---------|
| `/try-resume-builder` | `src/app/try-resume-builder/page.tsx` | ✅ Working | ✅ Yes | Free resume builder CTA/demo |

---

### 💼 Job Features (PRIORITY 2)

| Route | File | Status | Has Header/Footer | Purpose |
|-------|------|--------|-------------------|---------|
| `/jobs/interview-prep` | `src/app/jobs/interview-prep/page.tsx` | ✅ Working | ✅ Yes | Interview preparation tips |
| `/jobs/job-matching` | `src/app/jobs/job-matching/page.tsx` | ✅ Working | ✅ Yes | AI job matching feature |
| `/talent-search` | `src/app/talent-search/page.tsx` | ✅ Working | ✅ Yes | Talent search (public view) |

---

### 📚 Content Pages (PRIORITY 3)

| Route | File | Status | Has Header/Footer | Purpose |
|-------|------|--------|-------------------|---------|
| `/insights` | `src/app/insights/page.tsx` | ✅ Working | ✅ Yes | Blog/insights listing |
| `/insights/[slug]` | `src/app/insights/[slug]/page.tsx` | ✅ Working | ✅ Yes | Individual blog post |
| `/author/[slug]` | `src/app/author/[slug]/page.tsx` | ✅ Working | ✅ Yes | Author profile page |

---

### 📄 Legal/Support Pages (PRIORITY 4)

| Route | File | Status | Has Header/Footer | Purpose |
|-------|------|--------|-------------------|---------|
| `/contact-support` | `src/app/contact-support/page.tsx` | ✅ Working | ✅ Yes | Contact/support form |
| `/privacy-policy` | `src/app/privacy-policy/page.tsx` | ✅ Working | ✅ Yes | Privacy policy |
| `/terms-and-conditions` | `src/app/terms-and-conditions/page.tsx` | ✅ Working | ✅ Yes | Terms & conditions |
| `/cookie-policy` | `src/app/cookie-policy/page.tsx` | ✅ Working | ✅ Yes | Cookie policy |
| `/data-security` | `src/app/data-security/page.tsx` | ✅ Working | ✅ Yes | Data security info |

---

### 🔗 Public Profiles (PRIORITY 3)

| Route | File | Status | Has Header/Footer | Purpose |
|-------|------|--------|-------------------|---------|
| `/profile/[slug]` | `src/app/profile/[slug]/page.tsx` | ✅ Working | ✅ Yes | Public candidate profile |
| `/resume/[slug]` | `src/app/resume/[slug]/page.tsx` | ✅ Working | ✅ Yes | Public resume view |

---

### 🧪 Demo/Other (PRIORITY 4)

| Route | File | Status | Has Header/Footer | Purpose |
|-------|------|--------|-------------------|---------|
| `/hr-assistant-demo` | `src/app/(main)/hr-assistant-demo/page.tsx` | ✅ Working | ✅ Yes | HR Assistant chat demo |
| `/reset-password` | `src/app/reset-password/page.tsx` | ✅ Working | ✅ Yes | Password reset page |
| `/developer/docs` | `src/app/developer/docs/page.tsx` | ✅ Working | ✅ Yes | Developer docs/API |

---

## 🎯 SUMMARY

### Total Public Pages: **29 pages**

**Breakdown**:
- ✅ **23 pages** have Header/Footer
- ❌ **6 pages** missing Header/Footer (all `/tools/*` pages!)

---

## 🚨 IMMEDIATE ACTION NEEDED

### 1. Add Header/Footer to Tools Pages (CRITICAL!)

All 6 tool pages need Header and Footer components added:

**Files to modify**:
```
src/app/tools/page.tsx
src/app/tools/typing-test/page.tsx
src/app/tools/email-signature/page.tsx
src/app/tools/salary-calculator/page.tsx
src/app/tools/linkedin-optimizer/page.tsx
src/app/tools/skills-gap/page.tsx
```

**Pattern to add** (at top of each file):
```tsx
import Header from '@/components/shared/layout/Header'
// ... other imports

export default function ToolPage() {
  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* Existing tool content */}
      </div>
      
      {/* Footer will be added by layout */}
    </>
  )
}
```

**Reference**: Check `/src/app/home/page.tsx` line 317 to see how Header is imported and used.

---

### 2. Finish Reskinning Last 2 Tools

**LinkedIn Optimizer** and **Skills Gap Analyzer** still have the ugly white design:
- Change `bg-gray-50` → `bg-black`
- Add dark gradients and glows
- Match the sick homepage aesthetic

**Reference**: Look at `/src/app/tools/typing-test/page.tsx` for the correct dark pattern.

---

### 3. Reskin Tools Index Page (Optional but Recommended)

The `/tools` index page is still basic white cards. Should match homepage style:
- Dark background
- Gradient cards
- Glow effects
- Smooth animations

---

## 📐 LAYOUT STRUCTURE

### Current Layout System

**File**: `src/app/layout.tsx` (root layout)

**Most pages follow this pattern**:
```tsx
'use client'

import Header from '@/components/shared/layout/Header'
// ... imports

export default function PageName() {
  return (
    <>
      <Header />
      
      <main>
        {/* Page content */}
      </main>
      
      {/* Footer added by root layout automatically */}
    </>
  )
}
```

**Tool pages are missing this structure!**

---

## 🎨 DESIGN CONSISTENCY

### Pages that look SICK:
- ✅ `/home` - Dark, gradients, animations, perfect
- ✅ `/tools/typing-test` - Dark, yellow/orange theme, perfect
- ✅ `/tools/email-signature` - Dark, purple/pink theme, perfect
- ✅ `/tools/salary-calculator` - Dark, green theme, perfect

### Pages that need work:
- ⏳ `/tools` - White, basic cards (should be dark like homepage)
- ⏳ `/tools/linkedin-optimizer` - White, basic (needs dark blue theme)
- ⏳ `/tools/skills-gap` - White, basic (needs dark red theme)

---

## 📊 PRIORITY LEVELS EXPLAINED

### Priority 1 - CRITICAL (Do Now!)
- Homepage, Jobs, Tools pages
- These drive the most traffic
- Need perfect design + nav/footer

### Priority 2 - HIGH (Do Soon)
- Resume builder, job features
- Important conversion pages
- Should be polished

### Priority 3 - MEDIUM (Do Later)
- Content pages, profiles
- Nice to have consistency
- Can be basic for now

### Priority 4 - LOW (Do Eventually)
- Legal pages, support
- Just need to be functional
- Design less important

---

## ✅ ACCEPTANCE CRITERIA

When complete, ALL 29 public pages should:
- ✅ Have Header component with working navigation
- ✅ Have Footer component with links
- ✅ Match the dark aesthetic (if candidate-facing)
- ✅ Be mobile responsive
- ✅ Have smooth animations (where appropriate)
- ✅ Work without login

---

## 🎯 FOR DESIGN AGENT: YOUR TASKS

### Task 1: Add Header/Footer to All Tool Pages (CRITICAL!)
Add Header component to these 6 files:
1. `src/app/tools/page.tsx`
2. `src/app/tools/typing-test/page.tsx`
3. `src/app/tools/email-signature/page.tsx`
4. `src/app/tools/salary-calculator/page.tsx`
5. `src/app/tools/linkedin-optimizer/page.tsx`
6. `src/app/tools/skills-gap/page.tsx`

**Pattern**: Import Header at top, add `<Header />` before the main content.

### Task 2: Finish Reskinning Tools (HIGH PRIORITY!)
Reskin these 2 tools to match the dark theme:
1. `src/app/tools/linkedin-optimizer/page.tsx` → Blue/indigo theme
2. `src/app/tools/skills-gap/page.tsx` → Red/rose theme

**Reference**: `RESKIN_ALL_TOOLS_PROMPT.md` has exact specs.

### Task 3: Polish Tools Index Page (MEDIUM PRIORITY)
Reskin `/tools` page to match homepage aesthetic:
- Dark background with gradients
- Tool cards with hover effects
- Smooth animations

### Task 4: Verify All Pages (FINAL CHECK)
Test all 29 pages:
- ✅ Header shows correctly
- ✅ Footer shows correctly
- ✅ Navigation works
- ✅ Design is consistent
- ✅ Mobile responsive

---

## 📝 NOTES

### Why Tools Pages Don't Have Nav/Footer?
- They're brand new (I just built them today)
- I focused on functionality first
- Design agent is adding the UI layer now

### Why Some Pages Still White?
- Design agent is working through them
- 3/5 tools are done (typing test, email signature, salary calc)
- 2/5 still need reskinning (LinkedIn, skills gap)

### Where's the Header/Footer Code?
- **Header**: `src/components/shared/layout/Header.tsx`
- **Footer**: `src/components/shared/layout/Footer.tsx`
- **Root Layout**: `src/app/layout.tsx` (adds footer automatically)

---

## 🎉 END GOAL

**All 29 public pages should**:
1. Look SICK (dark theme, gradients, animations)
2. Have working Header with navigation
3. Have Footer with links
4. Be fully responsive
5. Work for non-logged-in users (candidates)

**Then we can move to recruiter pages!**

---

**Reference Files**:
- Homepage example: `src/app/home/page.tsx`
- Tool example (SICK): `src/app/tools/typing-test/page.tsx`
- Reskin guide: `RESKIN_ALL_TOOLS_PROMPT.md`
- Layout structure: `src/app/layout.tsx`
