# 🚀 BPOC.GAMES - QUICK START GUIDE

**Get from zero to deployed Game 1 in 20 weeks**

---

## 📋 PRE-FLIGHT CHECKLIST

### Accounts You Need

- [x] **GitHub** - Code repository
- [x] **Vercel** - Frontend hosting (already have)
- [x] **Supabase** - Database + Auth (already have)
- [x] **Railway** - Backend microservices (get account)
- [x] **Upstash** - Serverless Redis (free tier)
- [ ] **Cloudflare** - CDN (optional for MVP)
- [ ] **Amplitude** - Analytics (optional for MVP)

### Tools to Install

```bash
# Node.js 20+
node --version  # v20.x.x

# pnpm (fast package manager)
npm install -g pnpm

# Turbo (monorepo)
pnpm install -g turbo

# Vercel CLI
pnpm install -g vercel

# Railway CLI
curl -fsSL https://railway.app/install.sh | sh
```

---

## 🎯 THE 20-WEEK ROADMAP

### **Phase 1: Foundation (Week 1-2)**

**Goal:** Set up monorepo, infrastructure, core architecture

```bash
# Week 1: Monorepo Setup
- [ ] Create monorepo structure (Turborepo)
- [ ] Set up Next.js app (apps/web)
- [ ] Configure TypeScript, ESLint, Tailwind
- [ ] Install Phaser.js 4
- [ ] Set up shadcn/ui components

# Week 2: Infrastructure
- [ ] Set up Supabase project
- [ ] Create database schema (game_sessions, game_events)
- [ ] Enable TimescaleDB extension
- [ ] Set up Upstash Redis
- [ ] Configure Vercel deployment
- [ ] Configure Railway deployment (for later)
```

**Deliverable:** Empty Next.js app that deploys to Vercel ✅

---

### **Phase 2: Game 1 - Pattern Master (Week 3-5)**

**Goal:** Build first playable game end-to-end

```bash
# Week 3: Game Core
- [ ] Create Phaser game structure (PreloadScene, MenuScene, GameScene, ResultsScene)
- [ ] Implement pattern generation logic
- [ ] Add sprite assets (shapes: circle, square, triangle, star, heart)
- [ ] Build answer selection UI
- [ ] Add sound effects (correct, wrong, levelup, gameover)

# Week 4: Integration
- [ ] Create React wrapper component (PatternMasterGame.tsx)
- [ ] Implement EventBridge (Phaser ↔ React communication)
- [ ] Build event tracking system
- [ ] Create API endpoints (/api/games/pattern-master/start, events, complete)
- [ ] Integrate Supabase Auth

# Week 5: Polish & Test
- [ ] Add game HUD (score, lives, timer)
- [ ] Implement adaptive difficulty
- [ ] Add pause/resume functionality
- [ ] Test on mobile devices
- [ ] Optimize performance (lazy loading, code splitting)
- [ ] Write unit tests
```

**Deliverable:** Pattern Master playable on games.bpoc.io ✅

---

### **Phase 3: Analytics & Leaderboard (Week 6-7)**

**Goal:** Make gameplay data useful

```bash
# Week 6: Analytics
- [ ] Set up TimescaleDB hypertable (game_events)
- [ ] Create analytics API endpoints
- [ ] Build player dashboard (stats, history)
- [ ] Add event visualization (charts)
- [ ] Implement basic scoring algorithm

# Week 7: Leaderboard
- [ ] Set up Redis sorted sets (leaderboard)
- [ ] Create leaderboard API endpoints
- [ ] Build leaderboard UI (global, friends, weekly)
- [ ] Add real-time updates (Supabase Realtime)
- [ ] Implement anti-cheat detection (server-side validation)
```

**Deliverable:** Players can see stats and compete on leaderboard ✅

---

### **Phase 4: Game 2 - Resource Rush (Week 8-12)**

**Goal:** Build strategic decision-making game

```bash
# Week 8-9: Game Design
- [ ] Design game mechanics (resource management)
- [ ] Create sprite assets (resources, projects, UI elements)
- [ ] Build game state machine
- [ ] Implement resource allocation logic
- [ ] Add random events (trade-offs)

# Week 10-11: Implementation
- [ ] Create Phaser scenes (MenuScene, GameScene, ResultsScene)
- [ ] Build UI overlays (resource meters, project cards)
- [ ] Implement decision tracking
- [ ] Add sound effects and music
- [ ] Create React wrapper

# Week 12: Integration & Polish
- [ ] Connect to backend APIs
- [ ] Implement multi-trait scoring (decision-making, strategy, risk)
- [ ] Test and optimize
- [ ] Mobile optimization
```

**Deliverable:** Resource Rush deployed and playable ✅

---

### **Phase 5: Game 3 - Innovation Lab (Week 13-17)**

**Goal:** Build creativity assessment game

```bash
# Week 13-14: Physics Setup
- [ ] Integrate Phaser Matter.js (physics engine)
- [ ] Create draggable objects (ropes, levers, wheels)
- [ ] Build sandbox environment
- [ ] Implement goal detection (success conditions)

# Week 15-16: Gameplay
- [ ] Design 10 challenge levels (increasing difficulty)
- [ ] Add hint system
- [ ] Implement solution tracking (multiple approaches)
- [ ] Build creativity scoring algorithm
- [ ] Add replay functionality

# Week 17: Polish & Test
- [ ] Optimize physics performance
- [ ] Mobile touch controls
- [ ] Tutorial/onboarding
- [ ] Test on multiple devices
```

**Deliverable:** Innovation Lab deployed and playable ✅

---

### **Phase 6: Admin Dashboard (Week 18-19)**

**Goal:** Analytics for internal team

```bash
# Week 18: Dashboard Core
- [ ] Create admin Next.js app (apps/admin-dashboard)
- [ ] Build authentication (admin-only)
- [ ] Create analytics queries (TimescaleDB)
- [ ] Design dashboard UI (charts, tables)

# Week 19: Advanced Analytics
- [ ] Player performance reports
- [ ] Game completion funnels
- [ ] A/B test results
- [ ] Top 1% identification algorithm
- [ ] Export data to CSV (recruiter reports)
```

**Deliverable:** Admin can see all game analytics ✅

---

### **Phase 7: Polish & Launch (Week 20)**

**Goal:** Production-ready MVP

```bash
# Final Week Checklist:
- [ ] Performance audit (Lighthouse 95+)
- [ ] Security audit (OWASP top 10)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] 3G network testing
- [ ] Load testing (simulate 1000 concurrent users)
- [ ] Set up monitoring (Sentry, Vercel Analytics)
- [ ] Write documentation
- [ ] Create marketing materials
- [ ] Soft launch to 100 beta users
- [ ] Fix critical bugs
- [ ] Public launch! 🚀
```

**Deliverable:** BPOC.GAMES live at games.bpoc.io ✅

---

## 🏗️ ARCHITECTURE VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE CDN                           │
│              (DDoS Protection, R2 Storage)                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  VERCEL EDGE NETWORK                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         apps/web (Next.js 15)                       │   │
│  │                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │   Games      │  │  Leaderboard │  │Dashboard │ │   │
│  │  │ - Pattern    │  │  - Global    │  │ - Stats  │ │   │
│  │  │ - Resource   │  │  - Weekly    │  │ - History│ │   │
│  │  │ - Innovation │  │  - Friends   │  │ - Badges │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │        Phaser.js Game Engine                 │  │   │
│  │  │  - WebGL renderer                            │  │   │
│  │  │  - Physics (Matter.js)                       │  │   │
│  │  │  - Audio system                              │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │        Next.js API Routes                    │  │   │
│  │  │  - /api/auth/*                               │  │   │
│  │  │  - /api/games/*                              │  │   │
│  │  │  - /api/leaderboard/*                        │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  RAILWAY (Microservices)                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     apps/analytics-api (Node.js + Express)          │   │
│  │                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │Event Processor│ │Scoring Engine│ │Anti-Cheat│ │   │
│  │  │- Batch events │ │- Calculate   │ │- Detect  │ │   │
│  │  │- Aggregate   │ │- Multi-trait │ │- Flag    │ │   │
│  │  │- Clean data  │ │- ML predict  │ │- Block   │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │        Python ML Service                     │  │   │
│  │  │  - Talent prediction model                   │  │   │
│  │  │  - Pattern recognition scoring               │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE                                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │ TimescaleDB  │  │   Realtime   │     │
│  │              │  │              │  │              │     │
│  │- game_sessions│ │- game_events │ │- Leaderboard │     │
│  │- leaderboards│  │  (time-series)│ │  updates    │     │
│  │- auth.users  │  │- Compression │  │- Live games │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Supabase Auth                          │  │
│  │  - JWT tokens                                        │  │
│  │  - Social logins (Google, Facebook)                 │  │
│  │  - Row-level security (RLS)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 UPSTASH REDIS (Serverless)                  │
│                                                             │
│  - Leaderboards (sorted sets)                              │
│  - Rate limiting (per IP/user)                             │
│  - Session cache                                           │
│  - Real-time counters                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 HOW A GAME WORKS (Pattern Master Flow)

### 1. Player Visits Game Page

```
User → https://games.bpoc.io/pattern-master
       ↓
Next.js SSR → Render shell page (fast!)
       ↓
Browser → Download Phaser.js + game assets
       ↓
Phaser → Initialize game (PreloadScene)
       ↓
Display → Main menu (MenuScene)
```

### 2. Player Starts Game

```
Player clicks "Start"
       ↓
React → Call API: POST /api/games/pattern-master/start
       ↓
API → Create session in Postgres
       ↓
API → Return session_id
       ↓
Phaser → Start GameScene with session_id
       ↓
EventBridge.emit('game:start', { session_id })
       ↓
React → Track event: POST /api/games/pattern-master/events
```

### 3. Gameplay Loop

```
Phaser → Generate pattern sequence
       ↓
Display → Show shapes + answer options
       ↓
Player → Clicks answer
       ↓
Phaser → Validate answer (client-side for UX)
       ↓
EventBridge.emit('game:decision', {
  session_id,
  correct: true/false,
  response_time_ms: 1234,
  pattern_difficulty: 5
})
       ↓
React → Track event: POST /api/games/events
       ↓
API → Store event in TimescaleDB (game_events table)
       ↓
Redis → Update leaderboard (if high score)
       ↓
Phaser → Update UI (score, level, lives)
       ↓
Repeat until game over
```

### 4. Game Over

```
Phaser → Player loses all lives OR completes all levels
       ↓
EventBridge.emit('game:complete', {
  session_id,
  final_score,
  final_level
})
       ↓
React → Call API: POST /api/games/pattern-master/complete
       ↓
API → Calculate final score from ALL events (server-side validation)
       ↓
API → Update game_sessions.completed_at, final_score
       ↓
API → Check if new high score
       ↓
Redis → Update leaderboard (ZADD)
       ↓
API → Return results + leaderboard position
       ↓
Phaser → Show ResultsScene (score, rank, replay button)
```

### 5. Behind the Scenes (Analytics)

```
TimescaleDB → Every game event stored with timestamp
       ↓
Analytics API (Railway) → Runs hourly jobs
       ↓
Aggregate events → Calculate player metrics:
  - Average response time
  - Learning curve (improvement over sessions)
  - Risk tolerance (patterns in decisions)
  - Strategic thinking (planning depth)
       ↓
Scoring Engine → Multi-trait score (cognitive, behavioral, creative)
       ↓
Store in player_scores table
       ↓
Admin Dashboard → Show insights, identify top 1%
       ↓
BPOC Recruitment API → Fetch top players for job matching
```

---

## 🔐 SECURITY FLOW (Anti-Cheat)

### Problem: Client Can Lie

```
❌ Hacker modifies client code:
   - Changes score to 99999
   - Skips levels
   - Reduces difficulty
   - Sends fake events
```

### Solution: Server Validates Everything

```
✅ Server-side validation:

1. Start Game:
   POST /api/games/start
   → Server creates session with timestamp

2. During Game:
   POST /api/games/events (for EACH action)
   → Server stores EVERY event with timestamp
   → Server never trusts client scores

3. End Game:
   POST /api/games/complete { session_id }
   → Server fetches ALL events for this session
   → Server recalculates score from events:

     function calculateScore(events: GameEvent[]): number {
       let score = 0

       // Check each event is valid
       for (const event of events) {
         // Validate response time (not too fast = bot)
         if (event.response_time_ms < 100) {
           flagAsCheat(event.player_id)
           break
         }

         // Validate sequence (events are in order)
         if (event.timestamp < previousEvent.timestamp) {
           flagAsCheat(event.player_id)
           break
         }

         // Calculate score from valid events
         if (event.event_data.correct) {
           score += 100
         }
       }

       return score
     }

   → Server returns VALIDATED score
   → Server updates leaderboard with VALIDATED score
```

**Key Principle:** Client is for UX (fast feedback), Server is for truth (validation).

---

## 📊 DATA FLOW (Track Everything)

### What Gets Tracked

```typescript
// Every single action:
{
  event_id: 'uuid',
  session_id: 'uuid',
  player_id: 'uuid',
  game_type: 'pattern_master',
  event_type: 'decision', // start, click, decision, pause, complete, error
  timestamp: '2026-01-23T10:30:45.123Z',
  response_time_ms: 1234,
  event_data: {
    level: 5,
    correct: true,
    pattern_sequence: ['circle', 'square', 'triangle'],
    player_answer: 'circle',
    streak: 3,
    accuracy: 0.87,
    time_remaining: 5.2
  },
  metadata: {
    device: 'iPhone 15',
    browser: 'Safari 17',
    screen_size: '390x844',
    connection: '4g'
  }
}
```

### What You Learn

```
From 1000 events in one session:

Cognitive:
- Average response time: 1.2s (fast thinker)
- Accuracy: 87% (good pattern recognition)
- Learning curve: 20% improvement over session (learns quickly)

Behavioral:
- Pause frequency: 2 times (focused, not distracted)
- Streak length: Max 15 (persistent)
- Risk-taking: Moderate (balanced decisions)

Creative:
- Solution diversity: N/A for Pattern Master (but tracked in Innovation Lab)

Overall:
- This player is in top 10% for analytical thinking
- Fast learner, focused, balanced risk-taker
- Great fit for: Data analyst, QA tester, project coordinator
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Before First Deploy

```bash
# 1. Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] UPSTASH_REDIS_REST_URL
- [ ] UPSTASH_REDIS_REST_TOKEN
- [ ] NEXT_PUBLIC_VERCEL_URL (auto-populated)

# 2. Database Setup
- [ ] Run migrations (pnpm db:migrate)
- [ ] Enable TimescaleDB extension
- [ ] Enable RLS policies
- [ ] Create indexes
- [ ] Test connection

# 3. Authentication
- [ ] Configure Supabase Auth providers
- [ ] Set redirect URLs
- [ ] Test login flow
- [ ] Test signup flow

# 4. Performance
- [ ] Run Lighthouse audit (target: 95+)
- [ ] Test on 3G network
- [ ] Test on mobile devices
- [ ] Check bundle size (<5MB)

# 5. Security
- [ ] Enable HTTPS only
- [ ] Configure CORS
- [ ] Enable rate limiting
- [ ] Test RLS policies
- [ ] Review OWASP top 10

# 6. Monitoring
- [ ] Set up Sentry (error tracking)
- [ ] Enable Vercel Analytics
- [ ] Configure alerts (Slack/Discord)
```

### Deploy Commands

```bash
# Frontend (Vercel)
cd apps/web
vercel --prod

# Backend (Railway)
cd apps/analytics-api
railway up

# Database (Supabase)
pnpm db:migrate:prod
```

---

## 🎯 SUCCESS METRICS

### Week 1 (Soft Launch)

- [ ] 100 beta users invited
- [ ] 80+ game sessions completed
- [ ] <5 critical bugs reported
- [ ] 95+ Lighthouse score maintained

### Month 1

- [ ] 1,000 registered users
- [ ] 5,000+ game sessions
- [ ] 70%+ completion rate
- [ ] <1% error rate
- [ ] 99.5%+ uptime

### Month 3

- [ ] 10,000 MAU (monthly active users)
- [ ] 50,000+ game sessions
- [ ] Top 1% identification algorithm validated
- [ ] 10%+ conversion to BPOC recruitment platform

### Month 6

- [ ] 50,000 MAU
- [ ] 500,000+ game sessions
- [ ] ML scoring model trained on 100k+ sessions
- [ ] 20%+ conversion to recruitment
- [ ] Break-even on infrastructure costs

---

## ❓ FAQ

**Q: Why Phaser.js instead of Unity?**
A: Unity WebGL is too heavy (750ms+ loads, 50MB bundles, poor mobile). Phaser.js is web-native, <1s loads, 2-5MB bundles, perfect mobile performance.

**Q: Why TimescaleDB for events?**
A: Built for time-series data (game events). Auto-partitioning, 70-95% compression, fast aggregations. Works as Postgres extension (not separate DB).

**Q: Why monorepo?**
A: Share code between apps (DRY), single source of truth, atomic commits, faster CI/CD.

**Q: Why serverless Redis (Upstash)?**
A: Pay per request (not monthly), scales to zero, perfect for leaderboards (sorted sets), no DevOps.

**Q: How do you prevent cheating?**
A: Server-side validation. Store every event with timestamp, recalculate score server-side, flag impossible response times/patterns.

**Q: Can games work offline?**
A: Yes (PWA), but events are queued and sent when back online. Leaderboard requires internet.

---

## 🆘 TROUBLESHOOTING

### Game Not Loading

```bash
# Check browser console
# Common issues:
- Phaser.js not loaded (check Network tab)
- CORS error (check Vercel config)
- WebGL not supported (fallback to Canvas)

# Solutions:
- Clear cache (Cmd+Shift+R)
- Check Next.js config (next.config.js)
- Test in different browser
```

### Events Not Saving

```bash
# Check:
- [ ] API endpoint working (/api/games/events)
- [ ] Supabase connection valid
- [ ] User authenticated
- [ ] RLS policies not blocking

# Debug:
- Check Network tab (API calls)
- Check Supabase logs
- Check server logs (Vercel)
```

### Leaderboard Not Updating

```bash
# Check:
- [ ] Redis connection (Upstash)
- [ ] API endpoint working (/api/leaderboard)
- [ ] Score calculation correct

# Debug:
- Check Redis CLI (upstash-redis-cli)
- Check API logs
- Manually ZADD to test
```

---

## 📚 LEARNING RESOURCES

### Phaser.js
- Official Tutorial: https://phaser.io/tutorials/getting-started-phaser3
- Examples: https://phaser.io/examples
- Discord: https://discord.gg/phaser

### Next.js + Phaser
- Official Template: https://github.com/phaserjs/template-nextjs
- Integration Guide: https://phaser.io/news/2024/03/official-phaser-3-and-nextjs-template

### TimescaleDB
- Getting Started: https://docs.timescale.com/getting-started/
- Best Practices: https://docs.timescale.com/use-timescale/

### Supabase
- Quickstart: https://supabase.com/docs/guides/getting-started
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

---

**YOU'RE READY! START WITH WEEK 1 AND BUILD THE FUTURE OF TALENT DISCOVERY!** 🚀

---

## 🎉 BONUS: AI PROMPTS FOR COMMON TASKS

### Generate New Game

```
Prompt: "Create a new game called [GAME_NAME] for BPOC.GAMES using the existing Pattern Master structure.

Game mechanics: [DESCRIBE GAMEPLAY]
What it tests: [COGNITIVE/BEHAVIORAL/CREATIVE TRAITS]

Follow the architecture in .agent/BPOC_GAMES_RULES.md:
- Use Phaser.js 4 with TypeScript
- Create PreloadScene, MenuScene, GameScene, ResultsScene
- Implement EventBridge for React ↔ Phaser communication
- Add API endpoints for start/events/complete
- Track every player action as an event
- Server-side score validation

Generate all necessary files in apps/web/components/games/[game-name]/"
```

### Add New Feature

```
Prompt: "Add [FEATURE_NAME] to BPOC.GAMES.

Requirements:
- [LIST REQUIREMENTS]

Follow these rules:
- Use TypeScript (no 'any' types)
- Validate input with Zod schemas
- Add tests (Vitest)
- Update .agent/BPOC_GAMES_RULES.md if architecture changes
- Ensure mobile compatibility
- Check Lighthouse score remains 95+

Reference existing code in [RELEVANT_FILE]"
```

### Debug Issue

```
Prompt: "Debug this issue in BPOC.GAMES:

Problem: [DESCRIBE ISSUE]
Error message: [PASTE ERROR]
Steps to reproduce: [LIST STEPS]

Context:
- Game: [GAME_NAME]
- File: [FILE_PATH]
- User flow: [DESCRIBE FLOW]

Check:
- Browser console errors
- Network tab (API calls)
- Supabase logs
- Server logs (Vercel/Railway)

Follow debugging guidelines in .agent/BPOC_GAMES_RULES.md"
```

---

**NOW YOU HAVE EVERYTHING. GO BUILD!** 💪
