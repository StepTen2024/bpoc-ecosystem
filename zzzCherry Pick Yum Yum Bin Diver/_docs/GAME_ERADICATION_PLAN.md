# 🔥 GAME ERADICATION PLAN - Complete Removal

**Goal**: Remove ALL game-related code, routes, APIs, database dependencies from the core BPOC recruitment platform.

**Status**: Ready for execution  
**Risk Level**: Medium (will require database schema updates)  
**Estimated Time**: 2-3 hours with automated agents

---

## 📦 PHASE 1: ARCHIVE (Move to /archived/games/)

### 1.1 Frontend Game Routes (24 files)
```bash
# Candidate game routes
src/app/(candidate)/candidate/games/
├── typing-hero/page.tsx
├── typing-hero/loading.tsx
├── disc/page.tsx
├── disc/new-page.tsx
├── page.tsx
└── layout.tsx

# Career tools game routes  
src/app/career-tools/games/
├── typing-hero/page.tsx
├── disc-personality/page.tsx
├── disc-personality/layout.tsx
└── page.tsx

# Results page
src/app/results/typing-hero/[username]/page.tsx
```

**Action**: Move entire directories to `/archived/games/frontend/`

### 1.2 Game API Routes (10 files)
```bash
src/app/api/games/
├── typing-hero/
│   ├── load-user-story/route.ts
│   ├── save-story/route.ts
│   ├── session/route.ts
│   ├── generate-complete-story/route.ts
│   └── ai-assessment/route.ts
├── disc/
│   ├── session/route.ts
│   ├── answer/route.ts
│   └── personalized/route.ts
└── /api/candidate/games/progress/route.ts
```

**Action**: Move to `/archived/games/api/`

### 1.3 Game Components (5 files)
```bash
src/components/games/
├── disc/
│   ├── ResultsDashboard.tsx
│   ├── SpiritReveal.tsx
│   ├── IntroScreen.tsx
│   └── QuestionCard.tsx
```

**Action**: Move to `/archived/games/components/`

### 1.4 Game Libraries (2 files)
```bash
src/lib/
├── games/typing-hero-game.ts
└── story-generator.ts
```

**Action**: Move to `/archived/games/lib/`

### 1.5 Game Assets
```bash
public/
├── typing hero songs/
└── bpoc-disc-songs/
```

**Action**: Move to `/archived/games/assets/`

---

## 🗑️ PHASE 2: REMOVE DEPENDENCIES

### 2.1 Files With Game References (Remove/Update)

**High Priority - Remove Game Logic**:
1. `src/app/(candidate)/candidate/layout.tsx` - Remove game progress tracking
2. `src/app/(candidate)/candidate/assessments/page.tsx` - Remove game assessment displays
3. `src/app/home/page.tsx` - Remove game CTAs
4. `src/app/[slug]/ProfilePageClient.tsx` - Remove game scores from profiles
5. `src/components/chat/ChatWidgetWrapper.tsx` - Remove game-related chat prompts

**API Endpoints - Remove Game Data**:
6. `src/app/api/candidate/dashboard/route.ts` - Remove game stats
7. `src/app/api/v1/candidates/route.ts` - Remove game data from candidate objects
8. `src/app/api/v1/candidates/[id]/complete/route.ts` - Remove game completion checks
9. `src/app/api/v1/applications/[id]/route.ts` - Remove game scores from applications
10. `src/app/api/recruiter/applications/route.ts` - Remove game filters
11. `src/app/api/admin/candidates/route.ts` - Remove game analytics
12. `src/app/api/admin/candidates/[id]/route.ts` - Remove game data

**Anonymous Session Claims**:
13. `src/app/api/anon/claim-all/route.ts` - Remove game session claims
14. `src/app/api/anon/claim/route.ts` - Remove game session claims

**Dedicated Game Stats Endpoint - DELETE COMPLETELY**:
15. `src/app/api/user/typing-stats/route.ts` - DELETE

### 2.2 Database Layer - Remove Game Queries
```bash
src/lib/db/assessments/
├── queries.supabase.ts  # Remove ALL game-related functions
└── index.ts             # Remove game exports
```

**Functions to DELETE**:
- `getDiscAssessmentCount()`
- `getTypingAssessmentCount()`
- `getUltimateAssessmentCount()`
- `getCulturalAssessmentCount()`
- `getTotalAssessmentSessions()`
- `hasDiscData()`
- `hasTypingData()`
- `saveDiscAssessment()`
- `saveTypingAssessment()`

---

## 🗄️ PHASE 3: DATABASE CLEANUP

### 3.1 Tables to DROP (or Archive)

**Game Assessment Tables**:
```sql
-- These tables store ONLY game data, safe to drop
DROP TABLE IF EXISTS candidate_typing_assessments CASCADE;
DROP TABLE IF EXISTS candidate_disc_assessments CASCADE;
DROP TABLE IF EXISTS candidate_cultural_assessments CASCADE;
DROP TABLE IF EXISTS candidate_ultimate_assessments CASCADE;

-- Or archive to separate schema
CREATE SCHEMA IF NOT EXISTS archived_games;
ALTER TABLE candidate_typing_assessments SET SCHEMA archived_games;
ALTER TABLE candidate_disc_assessments SET SCHEMA archived_games;
ALTER TABLE candidate_cultural_assessments SET SCHEMA archived_games;
ALTER TABLE candidate_ultimate_assessments SET SCHEMA archived_games;
```

### 3.2 View to UPDATE
```sql
-- Update candidate_truth view to remove game columns
-- File: scripts/sql/create_candidate_truth_view.sql

-- REMOVE these columns:
- typing_wpm
- typing_accuracy  
- typing_completed_at
- disc_type
- disc_dominance
- disc_influence
- disc_steadiness
- disc_conscientiousness
- disc_completed_at
```

### 3.3 Indexes to DROP
```sql
-- From: supabase_performance_indexes.sql
DROP INDEX IF EXISTS idx_candidate_disc_assessments_candidate_finished;
DROP INDEX IF EXISTS idx_candidate_disc_assessments_candidate_completed;
DROP INDEX IF EXISTS idx_candidate_disc_assessments_candidate_created;
DROP INDEX IF EXISTS idx_candidate_typing_assessments_candidate_finished;
DROP INDEX IF EXISTS idx_candidate_typing_assessments_candidate_completed;
DROP INDEX IF EXISTS idx_candidate_typing_assessments_candidate_created;
```

### 3.4 Seed Data to REMOVE
```bash
# File: scripts/seed-marco-test-data.sql
# DELETE sections:
- Line 163-216: candidate_typing_assessments inserts
- Line 219-258: candidate_disc_assessments inserts
```

---

## 🔗 PHASE 4: NAVIGATION & LINKS

### 4.1 Remove from Navigation Menus
- Candidate sidebar: Remove "Games" link
- Career tools: Remove games section
- Admin panel: Remove game analytics
- Recruiter dashboard: Remove game score filters

### 4.2 Remove CTAs
- Homepage: Remove "Try Career Games" buttons
- Candidate dashboard: Remove game widgets
- Profile pages: Remove game badges/scores

---

## 📊 PHASE 5: TYPES & INTERFACES

### 5.1 TypeScript Types to Remove
```typescript
// Remove from candidate types
interface Candidate {
  // DELETE:
  typing_wpm?: number;
  typing_accuracy?: number;
  disc_type?: string;
  game_scores?: any;
}
```

### 5.2 Enums to Keep/Update
```sql
-- Keep SessionStatus enum but remove game-specific values if needed
-- Currently: 'started', 'in_progress', 'completed', 'abandoned'
-- These are generic enough to keep for other features
```

---

## ✅ PHASE 6: VERIFICATION

### 6.1 Build Check
```bash
npm run build
# Should complete with no errors
```

### 6.2 Route Check
```bash
# These should 404:
curl http://localhost:3001/candidate/games
curl http://localhost:3001/api/games/typing-hero/session
curl http://localhost:3001/career-tools/games
```

### 6.3 Database Check
```sql
-- Should return 0 references:
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name LIKE '%game%' 
   OR table_name LIKE '%typing%' 
   OR table_name LIKE '%disc%'
   AND table_schema = 'public';
```

### 6.4 Import Check
```bash
# Should return no results:
grep -r "from.*games" src --include="*.ts" --include="*.tsx"
grep -r "story-generator" src --include="*.ts" --include="*.tsx"
grep -r "typing-hero-game" src --include="*.ts" --include="*.tsx"
```

---

## 🚨 BREAKING CHANGES

### What Will Break:
1. **Candidate Profiles**: Game scores won't display (GOOD)
2. **Anonymous Claims**: Game sessions won't be claimable (GOOD)
3. **Recruiter Filters**: Can't filter by typing WPM (GOOD - they shouldn't)
4. **Admin Analytics**: No game completion stats (GOOD)
5. **Chat AI**: Won't suggest games (GOOD)

### What Won't Break:
1. ✅ Job applications
2. ✅ Resume uploads & AI analysis
3. ✅ Video interviews
4. ✅ Offers & contracts
5. ✅ Recruiter-candidate matching
6. ✅ Payments & subscriptions
7. ✅ All core recruitment features

---

## 🤖 AUTOMATION STRATEGY

### Use Multi-Agent Approach:

**Agent 1: Archiver**
- Move all game files to `/archived/games/`
- Update gitignore to exclude archived folder from builds

**Agent 2: Dependency Remover**  
- Remove game imports from 15 core files
- Remove game-related functions
- Update TypeScript types

**Agent 3: Database Surgeon**
- Create migration to archive game tables
- Update candidate_truth view
- Drop game indexes

**Agent 4: Verification Bot**
- Run build checks
- Test all critical routes
- Verify no broken imports

---

## 📝 EXECUTION ORDER

```
1. Git branch: git checkout -b remove-games
2. Archive files (Agent 1) → 30 mins
3. Remove dependencies (Agent 2) → 45 mins  
4. Database cleanup (Agent 3) → 30 mins
5. Build & verify (Agent 4) → 15 mins
6. Manual QA test → 30 mins
7. Commit & push → 5 mins

Total: ~2.5 hours
```

---

## 🎯 SUCCESS CRITERIA

- [ ] No game routes accessible
- [ ] No game API endpoints
- [ ] `npm run build` succeeds
- [ ] All core recruitment features work
- [ ] Database has no active game tables in public schema
- [ ] No TypeScript errors related to game types
- [ ] Candidate profiles don't show game scores
- [ ] Recruiter dashboard doesn't reference games

---

## 💾 ROLLBACK PLAN

If something breaks:
```bash
git checkout main
# Restore archived files if needed
git checkout HEAD~1 -- src/
# Restore database
psql -d $DATABASE_URL -f backups/pre_game_removal.sql
```

---

## 🚀 POST-REMOVAL BENEFITS

1. **Faster builds**: ~50% reduction in routes
2. **Cleaner codebase**: No game logic mixing with recruitment
3. **Simpler database**: Fewer tables to maintain
4. **Focus**: Team can focus 100% on revenue-generating features
5. **Performance**: Lighter candidate queries without game joins
6. **Mental clarity**: No more "should this be a game feature?"

---

**Ready to execute?** 

I recommend:
1. **YES** - Spin up Claude Code with multi-agent mode
2. Give it this plan as context
3. Let it execute Phase 1-3 automatically
4. You and I review Phase 4-6 together

Want me to create the prompt for Claude Code agents?
