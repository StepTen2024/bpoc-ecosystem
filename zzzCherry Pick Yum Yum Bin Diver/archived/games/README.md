# 🎮 Archived Games - BPOC Platform

**Date Archived**: January 22, 2026  
**Reason**: Strategic focus shift to core recruitment features

---

## 📋 What's In This Archive

This folder contains ALL game-related code that was removed from the BPOC recruitment platform. The decision was made to focus 100% on revenue-generating recruitment features rather than gamification.

### Games Removed:
1. **Typing Hero** - Typing speed/accuracy game with personalized stories
2. **DISC Personality Test** - Personality assessment game
3. **Cultural Fit Assessment** - Cultural alignment game
4. **Ultimate Assessment** - Comprehensive skills game

---

## 📁 Archive Structure

```
archived/games/
├── frontend/
│   ├── candidate-games/        # Candidate-facing game routes
│   ├── career-tools-games/     # Career tools game routes
│   └── typing-hero-results/    # Public results pages
├── api/
│   ├── games/                  # All game API endpoints
│   └── candidate-games/        # Candidate game progress API
├── components/
│   └── games/                  # React game components
├── lib/
│   ├── games/                  # Game engines (Phaser)
│   └── story-generator.ts      # AI story generation
├── assets/
│   ├── typing-hero-songs/      # Game music files
│   └── bpoc-disc-songs/        # DISC game music
└── database/
    └── migrations/             # Game table schemas (for reference)
```

---

## 🗄️ Database Tables Archived

The following tables were moved to the `archived_games` schema:
- `candidate_typing_assessments`
- `candidate_disc_assessments`
- `candidate_cultural_assessments`
- `candidate_ultimate_assessments`

**Note**: Data is preserved in case we ever want to restore or migrate to a separate games platform.

---

## 🔄 How to Restore (If Needed)

If you ever want to bring games back (e.g., as a separate platform):

### 1. Restore Files
```bash
# Copy files back to src/
cp -r archived/games/frontend/candidate-games src/app/(candidate)/candidate/games
cp -r archived/games/api/games src/app/api/games
cp -r archived/games/components/games src/components/games
cp -r archived/games/lib/* src/lib/
```

### 2. Restore Database Tables
```sql
-- Move tables back to public schema
ALTER TABLE archived_games.candidate_typing_assessments SET SCHEMA public;
ALTER TABLE archived_games.candidate_disc_assessments SET SCHEMA public;
ALTER TABLE archived_games.candidate_cultural_assessments SET SCHEMA public;
ALTER TABLE archived_games.candidate_ultimate_assessments SET SCHEMA public;
```

### 3. Restore Dependencies
```bash
# Re-install game-specific packages (if any)
npm install phaser
```

### 4. Update Routes
- Add game routes back to navigation
- Update candidate dashboard to show games
- Re-enable game API endpoints

---

## 💡 Future: Separate Games Platform?

If games are revived, consider creating:
- **games.bpoc.io** - Dedicated games subdomain
- Separate Next.js app
- Main platform pulls results via API
- Clean separation of concerns

---

## 📊 Impact of Removal

### Before:
- 599 source files
- ~40 game-related routes
- Mixed recruitment + gamification logic
- Complex candidate onboarding with game requirements

### After:
- ~560 source files (6.5% reduction)
- Pure recruitment focus
- Simplified candidate flow
- Faster builds and deploys

---

## 🎯 What Was Kept (Non-Game Features)

The following were NOT removed (these are core recruitment):
- ✅ Resume uploads & AI analysis
- ✅ Job applications & matching
- ✅ Video interviews
- ✅ Offers & contracts
- ✅ Recruiter dashboards
- ✅ Admin panels
- ✅ Payments & subscriptions

---

## 📝 Technical Notes

### Dependencies Removed:
- Phaser game engine (if no other use)
- Game-specific libraries
- Story generation AI prompts

### API Endpoints Removed:
- `POST /api/games/typing-hero/session`
- `POST /api/games/disc/answer`
- `GET /api/candidate/games/progress`
- All other `/api/games/*` endpoints

### Database Views Updated:
- `candidate_truth` view - removed game score columns
- Removed game-related indexes

---

## 🚀 Contact

If you need to access this archived code or have questions:
- **Email**: stephen@bpoc.io
- **Location**: `/archived/games/` in main repo
- **Branch**: `remove-games-complete`

---

**This archive represents a strategic pivot to focus on what makes BPOC successful: Connecting great Filipino talent with great BPO opportunities. 🎯**
