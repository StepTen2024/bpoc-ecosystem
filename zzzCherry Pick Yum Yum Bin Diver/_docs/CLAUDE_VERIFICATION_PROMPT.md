# 🔍 GAME REMOVAL VERIFICATION TASK

**FOR: Claude Code / Another AI Agent**  
**TASK TYPE: Verification & Audit ONLY (DO NOT EXECUTE ANYTHING)**  
**DATE: January 22, 2026**

---

## 🎯 YOUR MISSION

We just completed a massive cleanup to remove ALL game-related code from the BPOC recruitment platform. Another agent (OpenCode) executed the removal. 

**Your job**: Go through the codebase with a **fine-tooth comb** and find ANY remaining game references, dependencies, or broken links that we might have missed.

**CRITICAL**: **DO NOT EXECUTE, MODIFY, OR FIX ANYTHING**. Just report what you find.

---

## 📋 WHAT WAS DONE (Execution Summary)

### Phase 1: Archival ✅
**32 files moved** to `/archived/games/` (30MB total):

**Frontend Routes Archived:**
```
src/app/(candidate)/candidate/games/          → archived/games/frontend/candidate-games/
src/app/career-tools/games/                   → archived/games/frontend/career-tools-games/
src/app/results/typing-hero/                  → archived/games/frontend/typing-hero-results/
```

**API Routes Archived:**
```
src/app/api/games/typing-hero/*               → archived/games/api/games/
src/app/api/games/disc/*                      → archived/games/api/games/
src/app/api/candidate/games/progress/         → archived/games/api/candidate-games/
```

**Components Archived:**
```
src/components/games/disc/*                   → archived/games/components/games/
```

**Libraries Archived:**
```
src/lib/games/typing-hero-game.ts             → archived/games/lib/games/
src/lib/story-generator.ts                    → archived/games/lib/story-generator.ts
```

**Assets Archived:**
```
public/typing hero songs/                     → archived/games/assets/typing-hero-songs/
public/bpoc-disc-songs/                       → archived/games/assets/bpoc-disc-songs/
```

### Phase 2: Dependency Removal ✅
**Files Cleaned (game references removed):**

1. **Database Layer - DELETED:**
   - `src/lib/db/assessments/index.ts` ❌ DELETED
   - `src/lib/db/assessments/queries.supabase.ts` ❌ DELETED
   - Removed functions: `getDiscAssessmentCount()`, `getTypingAssessmentCount()`, `saveDiscAssessment()`, `saveTypingAssessment()`

2. **API Endpoints - CLEANED:**
   - `src/app/api/candidate/dashboard/route.ts` - Removed disc/typing queries
   - `src/app/api/v1/candidates/route.ts` - Removed assessments field
   - `src/app/api/v1/candidates/[id]/complete/route.ts` - Removed game assessments
   - `src/app/api/v1/applications/[id]/route.ts` - Removed assessments
   - `src/app/api/chat/route.ts` - Removed game context
   - `src/app/api/recruiter/applications/route.ts` - Removed typingWpm, discType
   - `src/app/api/admin/candidates/[id]/route.ts` - Removed game assessment views
   - `src/app/api/user/games-count/route.ts` ❌ DELETED

3. **UI Components - CLEANED:**
   - `src/app/home/page.tsx` - Removed Career Games section (200+ lines), removed Gamepad2 icon
   - `src/app/(candidate)/candidate/layout.tsx` - Removed game routes from navigation
   - `src/app/(candidate)/candidate/assessments/page.tsx` ❌ DELETED (100% game-focused)
   - `src/components/shared/ui/profile-card.tsx` - Removed completedGames state & API call

4. **Anonymous Claims - CLEANED:**
   - `src/app/api/anon/claim-all/route.ts` - Removed DISC/typing migration blocks
   - `src/app/api/anon/claim/route.ts` - Removed DISC/typing migration blocks

### Phase 3: Database Migration ✅
**Migration Created:**
- `supabase/migrations/20260122_archive_game_tables.sql`

**Tables Moved to `archived_games` Schema:**
- `candidate_typing_assessments`
- `candidate_disc_assessments`  
- `candidate_cultural_assessments`
- `candidate_ultimate_assessments`
- `candidate_disc_responses`

**Indexes Dropped:**
- All game assessment indexes from public schema

---

## 🔍 WHAT YOU NEED TO VERIFY

### 1. Search for Remaining Game Imports
Look for files that still import game-related modules:

```bash
# Search patterns to check:
- Import statements: "from '@/lib/games'" or "from '@/lib/story-generator'"
- Import statements: "from './games'" or "import.*typing-hero-game"
- Component imports from archived paths
```

**Check These Patterns:**
```typescript
import { storyGenerator } from '@/lib/story-generator'
import { createGame } from '@/lib/games/typing-hero-game'
import TypingHero from '@/components/games/...'
import { saveDiscAssessment } from '@/lib/db/assessments'
```

### 2. Search for Game Database Queries
Look for direct database queries to game tables:

```sql
-- Search for these table names in .ts/.tsx files:
candidate_typing_assessments
candidate_disc_assessments
candidate_cultural_assessments
candidate_ultimate_assessments
candidate_disc_responses
```

**Check Patterns:**
```typescript
.from('candidate_typing_assessments')
.from('candidate_disc_assessments')
supabase.from('candidate_typing_assessments')
```

### 3. Search for Game-Related Routes
Look for navigation links or route references:

```typescript
// Search for these route patterns:
'/candidate/games'
'/candidate/games/typing-hero'
'/candidate/games/disc'
'/career-tools/games'
'/api/games/typing-hero'
'/api/games/disc'
'/results/typing-hero'
```

**Check:**
- Link components: `<Link href="/candidate/games/...">`
- Router pushes: `router.push('/candidate/games')`
- Fetch calls: `fetch('/api/games/...')`
- API route handlers in non-archived files

### 4. Search for Game-Related Text/UI
Look for user-facing text that mentions games:

```bash
# Search for these keywords (case-insensitive):
"typing hero"
"typing game"
"career games"
"play game"
"disc test"
"disc personality"
"disc assessment"
"personality game"
"typing speed"
"WPM test"
```

**Check:**
- Button labels
- Page titles
- Navigation menu items
- CTA copy
- Footer links

### 5. Search for Game-Related State/Props
Look for React state or props related to games:

```typescript
// Search for these patterns:
useState.*game
useState.*typing
useState.*disc
completedGames
typingStats
discStats
typingWpm
discType
gameProgress
```

### 6. Check for Broken TypeScript Imports
Look for files that will fail to compile:

```bash
# Files that might have broken imports:
- Any file importing from deleted paths
- Any file using deleted types (GameStats, DifficultyLevel, etc.)
- Any file calling deleted functions (saveTypingAssessment, etc.)
```

### 7. Check for Orphaned API Handlers
Look for API route handlers that reference game endpoints:

```typescript
// Middleware or route configs mentioning:
/api/games/*
typing-hero
disc-personality
```

### 8. Check for Game References in Config Files
Search these files:

```bash
- package.json (scripts mentioning games)
- .env files (game-related env vars)
- next.config.js (rewrites/redirects to game routes)
- middleware.ts (game route handling)
- Any sitemap or robots.txt generation
```

### 9. Check for Supabase RLS Policies
Look in Supabase dashboard or migration files:

```sql
-- Policies that might reference:
candidate_typing_assessments
candidate_disc_assessments
```

### 10. Check for Anonymous Session Handling
Look for code that handles game channels:

```typescript
// Search for:
channel === 'typing-hero'
channel === 'disc-personality'
channel: 'typing-hero'
```

---

## 📊 EXPECTED FINDINGS

### Should Exist (These are OK):
✅ Files in `/archived/games/` - These are intentionally preserved  
✅ Migration file: `supabase/migrations/20260122_archive_game_tables.sql`  
✅ Documentation: `GAME_REMOVAL_COMPLETE.md`, `GAME_ERADICATION_PLAN.md`  
✅ LSP errors in archived files (expected, they're not part of active codebase)

### Should NOT Exist (Report These):
❌ Import statements from game modules in active files  
❌ Database queries to game tables in active files  
❌ Routes pointing to `/candidate/games` or `/api/games`  
❌ Links to game pages in navigation  
❌ Game-related text in UI (buttons, CTAs, etc.)  
❌ State variables for game data in active components  
❌ API handlers for game endpoints  
❌ TypeScript errors in non-archived files  

---

## 📝 REPORT FORMAT

Create a detailed report with this structure:

```markdown
# GAME REMOVAL VERIFICATION REPORT
Date: [timestamp]
Verified by: Claude Code / [Agent Name]

## EXECUTIVE SUMMARY
- Total files scanned: X
- Issues found: X
- Critical issues: X
- Minor issues: X
- Clean files: X

## CRITICAL ISSUES (Must Fix)
1. [File path]
   - Line X: [Specific issue]
   - Impact: [What breaks]
   - Recommendation: [How to fix]

## MINOR ISSUES (Should Fix)
1. [File path]
   - Line X: [Specific issue]
   - Impact: [Cosmetic/minor]
   - Recommendation: [How to fix]

## ORPHANED REFERENCES (Clean Up)
List of dead references that don't break anything but should be removed

## VERIFIED CLEAN
List of key files that were checked and are clean

## BUILD VERIFICATION
- npm run build: [PASS/FAIL]
- TypeScript: [PASS/FAIL]
- Key routes tested: [Results]

## RECOMMENDATIONS
1. [Priority 1 fixes]
2. [Nice-to-have cleanups]
3. [Future considerations]
```

---

## 🚫 CRITICAL RULES

**DO NOT:**
- ❌ Execute any code changes
- ❌ Fix any issues you find
- ❌ Run git commands
- ❌ Modify any files
- ❌ Delete anything
- ❌ Run database migrations
- ❌ Touch the archived/ folder

**ONLY:**
- ✅ Read files
- ✅ Search for patterns
- ✅ Analyze code
- ✅ Create a report
- ✅ Document findings

---

## 🔧 SEARCH COMMANDS YOU CAN USE

```bash
# Find remaining game imports
grep -r "from '@/lib/games'" src --include="*.ts" --include="*.tsx"
grep -r "story-generator" src --include="*.ts" --include="*.tsx"
grep -r "typing-hero-game" src --include="*.ts" --include="*.tsx"

# Find game database queries
grep -r "candidate_typing_assessments" src --include="*.ts" --include="*.tsx"
grep -r "candidate_disc_assessments" src --include="*.ts" --include="*.tsx"

# Find game routes
grep -r "/candidate/games" src --include="*.ts" --include="*.tsx"
grep -r "/api/games/" src --include="*.ts" --include="*.tsx"

# Find game-related text
grep -ri "typing hero" src --include="*.ts" --include="*.tsx"
grep -ri "career games" src --include="*.ts" --include="*.tsx"
grep -ri "disc test" src --include="*.ts" --include="*.tsx"

# Find game state variables
grep -r "completedGames\|typingStats\|discStats" src --include="*.ts" --include="*.tsx"

# Check TypeScript errors
npm run type-check

# Test build
npm run build
```

---

## 📂 KEY FILES TO AUDIT

### High Priority:
1. `src/app/(candidate)/candidate/layout.tsx` - Navigation
2. `src/app/home/page.tsx` - Homepage CTAs
3. `src/app/[slug]/ProfilePageClient.tsx` - Profile display
4. `src/components/chat/ChatWidgetWrapper.tsx` - Chat context
5. All files in `src/app/api/` - API routes
6. `src/lib/db/` - Database queries
7. `middleware.ts` - Route handling

### Medium Priority:
8. All candidate dashboard files
9. All recruiter dashboard files  
10. All admin panel files
11. Navigation components
12. Footer components

### Low Priority:
13. Test files
14. Config files
15. Documentation

---

## 🎯 SUCCESS CRITERIA

Your audit is complete when you've verified:

✅ **No active imports** from game modules  
✅ **No database queries** to game tables  
✅ **No routes** pointing to game pages  
✅ **No UI text** mentioning games  
✅ **Build passes** with no errors  
✅ **TypeScript compiles** cleanly  
✅ **No broken links** in navigation  

---

## 💡 TIPS FOR THOROUGH AUDITING

1. **Use regex searches** for flexible pattern matching
2. **Check case-insensitive** (GAME vs game vs Game)
3. **Look for variations** (typing-hero vs typingHero vs typing_hero)
4. **Check imports at file tops** (often missed)
5. **Check dynamic routes** (e.g., `[slug]` could be game-related)
6. **Test critical user flows** (signup, login, apply to job)
7. **Check console for errors** when loading pages
8. **Look for 404s** in navigation

---

## 📞 QUESTIONS TO ANSWER IN REPORT

1. Are there any files that will fail to compile?
2. Are there any broken navigation links?
3. Are there any API calls to deleted endpoints?
4. Are there any database queries that will fail?
5. Are there any UI components showing game data?
6. Are there any environment variables we should remove?
7. Are there any unused imports we should clean up?
8. Is the build completely clean (no warnings)?

---

## 🎉 WHAT A SUCCESSFUL REPORT LOOKS LIKE

If the removal was perfect, your report should say:

```
✅ VERIFICATION COMPLETE - ZERO ISSUES FOUND

Scanned: 565 active source files
Game references found: 0
Build status: PASSING
TypeScript: NO ERRORS

The game removal was executed flawlessly. 
The codebase is clean and ready for production.

Minor suggestions:
- [Optional cleanup items]
```

---

## 🚀 START YOUR AUDIT

Begin with:
1. Read this entire prompt carefully
2. Review the branch: `remove-games-complete`
3. Scan all commits to understand what was changed
4. Run systematic searches using the patterns above
5. Test key user flows if possible
6. Compile your findings into the report format
7. Present a clear, actionable report

---

**Branch**: `remove-games-complete`  
**Commits**: 11 commits from `e4025bc` to `606455c`  
**Status**: Awaiting verification  

**Remember**: **AUDIT ONLY - DO NOT EXECUTE ANY CHANGES**

**Go find those sneaky motherfucking game references! 🔍**
