# 🚀 START HERE - Game Removal Execution

## 📋 Pre-Flight Checklist

Before starting the game removal:

1. **Backup your database**
```bash
pg_dump $DATABASE_URL > backups/pre_game_removal_$(date +%Y%m%d).sql
```

2. **Create feature branch**
```bash
git checkout -b remove-games-complete
git push -u origin remove-games-complete
```

3. **Commit current state**
```bash
git add .
git commit -m "Pre-game-removal checkpoint"
```

---

## 🤖 OPTION 1: Use Claude Code Multi-Agent (RECOMMENDED)

### Step 1: Open Claude Code
```bash
# If you have Claude Code CLI:
claude-code --agents=4

# Or use the web interface at claude.ai/code
```

### Step 2: Load the Context
Copy and paste this prompt:

```
I need you to execute a multi-agent plan to remove all game-related code from a recruitment platform.

Context files:
1. Read: /Users/stepten/Desktop/Dev Projects/bpoc-stepten/GAME_ERADICATION_PLAN.md
2. Read: /Users/stepten/Desktop/Dev Projects/bpoc-stepten/CLAUDE_CODE_PROMPT.md

Execute the plan with 4 sequential agents:
- Agent 1: Archiver (moves files to /archived/)
- Agent 2: Dependency Remover (cleans imports)
- Agent 3: Database Surgeon (archives tables)
- Agent 4: Verification Bot (validates everything)

After each agent completes, show me:
1. What you did
2. Files modified count
3. Any issues encountered

Wait for my approval before starting each agent.

Ready? Start with Agent 1.
```

### Step 3: Review Each Agent's Work
After each agent completes:
1. Review the changes in git
2. Check for any issues
3. Approve next agent OR provide corrections

### Step 4: Final Verification
```bash
npm run build
npm run type-check
git status
```

---

## 🛠️ OPTION 2: Manual Execution (If No Claude Code)

I can execute each phase manually right here. Just say:

**"Execute Phase 1"** - I'll archive all game files  
**"Execute Phase 2"** - I'll remove dependencies  
**"Execute Phase 3"** - I'll handle database cleanup  
**"Execute Phase 4"** - I'll verify everything  

---

## 📊 What Gets Removed

### Frontend (24 files)
- `/candidate/games/*` - All candidate game routes
- `/career-tools/games/*` - All career tool game routes
- `/results/typing-hero/*` - Game results pages
- `/components/games/*` - Game components

### Backend (15 files)
- `/api/games/*` - All game API endpoints
- Game functions in assessments DB layer

### Database
- `candidate_typing_assessments` → archived_games schema
- `candidate_disc_assessments` → archived_games schema
- `candidate_cultural_assessments` → archived_games schema
- `candidate_ultimate_assessments` → archived_games schema

### Assets
- `public/typing hero songs/`
- `public/bpoc-disc-songs/`

---

## ⏱️ Estimated Timeline

- **Agent 1 (Archiver)**: 30 minutes
- **Agent 2 (Dependencies)**: 45 minutes
- **Agent 3 (Database)**: 30 minutes
- **Agent 4 (Verification)**: 15 minutes
- **Your Review**: 30 minutes

**Total: ~2.5 hours**

---

## 🎯 Success Looks Like

After completion:
```
✅ npm run build → SUCCESS (no errors)
✅ No game routes accessible
✅ No TypeScript errors
✅ All recruitment features work
✅ Clean git history with clear commits
✅ Database has games in archived schema only
```

---

## 🚨 If Something Breaks

### Rollback Plan
```bash
# Undo all changes
git reset --hard HEAD

# Or undo last commit
git reset --soft HEAD~1

# Restore database
psql $DATABASE_URL < backups/pre_game_removal_*.sql
```

---

## 📝 Post-Removal Tasks

After successful removal:

1. **Update documentation**
   - Remove games from README
   - Update API docs
   - Update onboarding guides

2. **Deploy to staging**
```bash
git push origin remove-games-complete
# Create PR for review
```

3. **QA Testing**
   - Test candidate registration (should skip games)
   - Test job applications (no game requirements)
   - Test recruiter dashboard (no game filters)
   - Test admin panel (no game analytics)

4. **Merge to main**
```bash
git checkout main
git merge remove-games-complete
git tag -a v2.0-no-games -m "Games completely removed"
git push origin main --tags
```

---

## 🎉 What You Get After This

1. **50% fewer routes** - Faster builds, simpler navigation
2. **Cleaner database** - Only recruitment-focused tables
3. **Mental clarity** - No more "is this a game or business feature?"
4. **Faster development** - Focus 100% on revenue features
5. **Simpler onboarding** - New devs don't need to understand games
6. **Better performance** - Lighter queries, no game joins

---

## 💬 Which Option Do You Want?

**A) Claude Code Multi-Agent** (copy the prompt to Claude Code)  
**B) Manual Execution Here** (I do it step-by-step)  
**C) Hybrid** (Claude Code for archiving, I handle dependencies)

Just tell me which approach you prefer and we'll get started! 🚀
