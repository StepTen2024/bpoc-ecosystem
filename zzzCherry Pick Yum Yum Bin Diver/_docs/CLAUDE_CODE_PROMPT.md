# 🤖 Claude Code Multi-Agent Execution Prompt

## MISSION: Complete Game Removal from BPOC Platform

You are coordinating 4 specialized agents to completely remove all game-related code from the BPOC recruitment platform. This is a strategic business decision to focus 100% on core recruitment features.

---

## 🎯 CONTEXT

**What BPOC Does**: B2B recruitment platform connecting Filipino candidates with BPO jobs
**What We're Removing**: Typing Hero, DISC personality tests, and all other career games
**Why**: Games are distracting from revenue-generating recruitment features
**Goal**: Clean, professional recruitment platform with ZERO game code

---

## 📋 MASTER PLAN

Read `/Users/stepten/Desktop/Dev Projects/bpoc-stepten/GAME_ERADICATION_PLAN.md` for complete details.

---

## 🤖 AGENT ASSIGNMENTS

### AGENT 1: ARCHIVER 🗃️
**Role**: Move all game files to archived folder

**Tasks**:
1. Create `/archived/games/` directory structure
2. Move these directories:
   - `src/app/(candidate)/candidate/games/` → `/archived/games/frontend/candidate/`
   - `src/app/career-tools/games/` → `/archived/games/frontend/career-tools/`
   - `src/app/results/typing-hero/` → `/archived/games/frontend/results/`
   - `src/app/api/games/` → `/archived/games/api/`
   - `src/components/games/` → `/archived/games/components/`
   - `src/lib/games/` → `/archived/games/lib/`
   - `src/lib/story-generator.ts` → `/archived/games/lib/`
   - `public/typing hero songs/` → `/archived/games/assets/`
   - `public/bpoc-disc-songs/` → `/archived/games/assets/`

3. Create `/archived/games/README.md` explaining what was moved and why

**Output**: Commit message "Archive: Move all game files to /archived/games/"

---

### AGENT 2: DEPENDENCY REMOVER 🔗
**Role**: Remove game imports and references from core files

**Critical Files to Update** (remove game logic but keep file):

1. **src/app/(candidate)/candidate/layout.tsx**
   - Remove game progress tracking
   - Remove game navigation links

2. **src/app/(candidate)/candidate/assessments/page.tsx**
   - Remove game assessment displays
   - Remove game score cards

3. **src/app/home/page.tsx**
   - Remove "Try Career Games" CTAs
   - Remove game feature highlights

4. **src/app/[slug]/ProfilePageClient.tsx**
   - Remove game scores from profile display
   - Remove game badges

5. **src/components/chat/ChatWidgetWrapper.tsx**
   - Remove game suggestions from chat context

6. **src/app/api/candidate/dashboard/route.ts**
   - Remove game stats from dashboard response
   - Keep: resume, applications, interviews

7. **src/app/api/v1/candidates/route.ts**
   - Remove game data from candidate serialization
   - Remove game queries

8. **src/app/api/v1/candidates/[id]/complete/route.ts**
   - Remove game completion checks

9. **src/app/api/v1/applications/[id]/route.ts**
   - Remove game scores from application data

10. **src/app/api/recruiter/applications/route.ts**
    - Remove game score filters
    - Remove game sorting options

11. **src/app/api/admin/candidates/route.ts**
    - Remove game analytics

12. **src/app/api/admin/candidates/[id]/route.ts**
    - Remove game data from admin view

13. **src/app/api/anon/claim-all/route.ts**
    - Remove game session claims

14. **src/app/api/anon/claim/route.ts**
    - Remove game session claims

**Files to DELETE completely**:
- `src/app/api/user/typing-stats/route.ts`
- `src/app/api/candidate/games/progress/route.ts`

**Database Layer**:
15. **src/lib/db/assessments/queries.supabase.ts**
    - Remove ALL these functions:
      - `getDiscAssessmentCount()`
      - `getTypingAssessmentCount()`
      - `getUltimateAssessmentCount()`
      - `getCulturalAssessmentCount()`
      - `getTotalAssessmentSessions()`
      - `hasDiscData()`
      - `hasTypingData()`
      - `saveDiscAssessment()`
      - `saveTypingAssessment()`

16. **src/lib/db/assessments/index.ts**
    - Remove game function exports

**Rules**:
- If a file has ONLY game logic → DELETE it
- If a file has mixed logic → Remove game parts, keep recruitment parts
- Update imports that reference removed files
- Fix TypeScript errors as you go

**Output**: Commit message "Remove: All game dependencies from core platform"

---

### AGENT 3: DATABASE SURGEON 🗄️
**Role**: Archive game tables and update views

**Tasks**:

1. **Create migration**: `supabase/migrations/20260122_archive_game_tables.sql`
```sql
-- Archive game assessment tables to separate schema
BEGIN;

-- Create archived schema
CREATE SCHEMA IF NOT EXISTS archived_games;

-- Move tables (preserves data for potential future use)
ALTER TABLE IF EXISTS public.candidate_typing_assessments 
  SET SCHEMA archived_games;

ALTER TABLE IF EXISTS public.candidate_disc_assessments 
  SET SCHEMA archived_games;

ALTER TABLE IF EXISTS public.candidate_cultural_assessments 
  SET SCHEMA archived_games;

ALTER TABLE IF EXISTS public.candidate_ultimate_assessments 
  SET SCHEMA archived_games;

-- Drop game-related indexes from public schema
DROP INDEX IF EXISTS public.idx_candidate_disc_assessments_candidate_finished;
DROP INDEX IF EXISTS public.idx_candidate_disc_assessments_candidate_completed;
DROP INDEX IF EXISTS public.idx_candidate_disc_assessments_candidate_created;
DROP INDEX IF EXISTS public.idx_candidate_typing_assessments_candidate_finished;
DROP INDEX IF EXISTS public.idx_candidate_typing_assessments_candidate_completed;
DROP INDEX IF EXISTS public.idx_candidate_typing_assessments_candidate_created;

COMMIT;

-- Note: Run this separately if you want to permanently delete:
-- DROP SCHEMA archived_games CASCADE;
```

2. **Update**: `scripts/sql/create_candidate_truth_view.sql`
   - Remove these columns from the view:
     - `typing_wpm`
     - `typing_accuracy`
     - `typing_completed_at`
     - `disc_type`
     - `disc_dominance`
     - `disc_influence`
     - `disc_steadiness`
     - `disc_conscientiousness`
     - `disc_completed_at`

3. **Update**: `scripts/seed-marco-test-data.sql`
   - Remove lines 163-216 (typing assessments)
   - Remove lines 219-258 (disc assessments)

4. **Update**: `supabase_performance_indexes.sql`
   - Remove game assessment index creation blocks

**Output**: Commit message "Database: Archive game tables to archived_games schema"

---

### AGENT 4: VERIFICATION BOT ✅
**Role**: Verify complete removal and ensure nothing broke

**Checks**:

1. **Build Check**
```bash
npm run build
# Must succeed with 0 errors
```

2. **Import Check**
```bash
# Should return empty:
grep -r "from.*games" src --include="*.ts" --include="*.tsx" | grep -v "archived"
grep -r "story-generator" src --include="*.ts" --include="*.tsx" | grep -v "archived"
grep -r "typing-hero-game" src --include="*.ts" --include="*.tsx" | grep -v "archived"
grep -r "candidate_typing_assessments" src --include="*.ts" --include="*.tsx"
grep -r "candidate_disc_assessments" src --include="*.ts" --include="*.tsx"
```

3. **Route Check** (should not exist)
```bash
# Check these routes return 404 or don't exist:
- /candidate/games
- /candidate/games/typing-hero
- /candidate/games/disc
- /api/games/typing-hero/session
- /api/games/disc/session
- /career-tools/games
```

4. **File Structure Check**
```bash
# Should not exist:
ls src/app/api/games/
ls src/components/games/
ls src/lib/games/

# Should exist:
ls archived/games/
```

5. **TypeScript Check**
```bash
npm run type-check
# Must pass with 0 errors
```

6. **Generate Report**: Create `VERIFICATION_REPORT.md` with:
   - ✅ All checks passed
   - ❌ Any issues found
   - 📊 Stats: Files moved, functions removed, routes deleted

**Output**: Commit message "Verify: Game removal complete and verified"

---

## 🚨 CRITICAL RULES FOR ALL AGENTS

1. **DO NOT TOUCH** these core features:
   - Job applications
   - Resume uploads & AI analysis
   - Video interviews
   - Offers & contracts
   - Payments
   - User authentication
   - Recruiter dashboard (except game filters)

2. **SAFE TO DELETE**:
   - Anything with "game" in the path
   - Anything with "typing-hero" in the name
   - Anything with "disc" related to personality tests
   - story-generator.ts

3. **UPDATE, DON'T DELETE**:
   - Dashboard routes (remove game data)
   - Profile pages (remove game scores)
   - Navigation components (remove game links)
   - API v1 endpoints (remove game fields)

4. **Version Control**:
   - Each agent creates ONE commit with clear message
   - Tag final state: `git tag -a v2.0-no-games -m "Games removed"`

5. **Error Handling**:
   - If you can't determine if code is game-related → Flag for human review
   - If removing code causes TypeScript errors → Fix them
   - If you break a test → Fix the test or delete it

---

## 📤 DELIVERABLES

Each agent reports back with:
1. ✅ Tasks completed
2. 📝 Commit hash
3. ⚠️ Issues encountered (if any)
4. 🔍 Files modified count

Final deliverable: Clean codebase with ZERO game code in active directories.

---

## 🎯 EXECUTION ORDER

```
1. AGENT 1 (Archiver) runs first → Creates archived folder structure
2. AGENT 2 (Dependency Remover) runs second → Cleans imports and references
3. AGENT 3 (Database Surgeon) runs third → Archives database tables
4. AGENT 4 (Verification Bot) runs last → Validates everything works

Total estimated time: 2 hours
```

---

## 💡 AGENT COORDINATION

- **Agents work sequentially** (not parallel) to avoid conflicts
- Each agent waits for previous agent's commit before starting
- Agents communicate through commit messages
- Final verification ensures all work is consistent

---

## ✅ SUCCESS CRITERIA

- [ ] All game files in `/archived/games/`
- [ ] No game imports in `src/`
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Game routes return 404
- [ ] Core recruitment features work perfectly
- [ ] Database has game tables in `archived_games` schema only

---

## 🚀 START EXECUTION

**Command for Claude Code**:
```
Execute GAME_ERADICATION_PLAN.md using 4 sequential agents as defined in CLAUDE_CODE_PROMPT.md
```

Each agent should report progress and wait for approval before next agent starts.

**Ready? Let's clean this codebase! 🔥**
