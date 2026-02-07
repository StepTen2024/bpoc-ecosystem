# 🚀 START HERE: BPOC.GAMES

**The only file you need to read before building BPOC.GAMES**

---

## 📖 WHAT IS THIS?

You've been given the task to build **BPOC.GAMES** - a separate games platform that:
1. **Engages** Filipino talent with fun games
2. **Identifies** the top 1% through gameplay data
3. **Feeds** the best talent to BPOC recruitment platform

This is a **greenfield project** (starting fresh, no legacy code constraints).

---

## 📚 DOCUMENTATION MAP

### 1. **Read This First** (You Are Here) ⭐
   **File:** `START_HERE_BPOC_GAMES.md`
   **Purpose:** Quick orientation

### 2. **Full AI Agent Prompt** (Copy to Any AI)
   **File:** `BPOC_GAMES_AI_PROMPT.md`
   **Purpose:** Complete context for AI agents
   **Contains:**
   - Project mission & goals
   - Tech stack (with WHY for each choice)
   - Complete file structure
   - Game 1 (Pattern Master) full implementation
   - Database schema
   - API endpoints
   - Security guidelines
   - Performance targets

### 3. **Agent Rules & Memory**
   **File:** `.agent/BPOC_GAMES_RULES.md`
   **Purpose:** Project rules, DO/DON'T list
   **Contains:**
   - Architecture principles
   - Security rules (critical!)
   - Code quality standards
   - What to track (analytics)
   - Common pitfalls to avoid

### 4. **Quick Start Guide**
   **File:** `BPOC_GAMES_QUICKSTART.md`
   **Purpose:** Week-by-week roadmap
   **Contains:**
   - 20-week implementation plan
   - Architecture diagrams
   - How games work (flow diagrams)
   - Deployment checklist
   - Troubleshooting

---

## ⚡ QUICK START (5 Minutes)

### If You're an AI Agent

```markdown
1. Read BPOC_GAMES_AI_PROMPT.md (complete context)
2. Read .agent/BPOC_GAMES_RULES.md (rules & principles)
3. Start building Game 1 (Pattern Master) using provided code
4. Follow architecture patterns exactly
5. Track EVERYTHING (every click, every decision)
6. Server-side validation ALWAYS (never trust client)
```

### If You're a Human Developer

```bash
# 1. Read the docs (15 minutes)
cat BPOC_GAMES_AI_PROMPT.md       # Full context
cat BPOC_GAMES_QUICKSTART.md      # Roadmap
cat .agent/BPOC_GAMES_RULES.md    # Rules

# 2. Set up environment
pnpm install
cp .env.example .env.local
# Fill in: Supabase, Upstash Redis, Vercel

# 3. Start building
pnpm dev
# Open http://localhost:3000

# 4. Deploy
vercel --prod  # Frontend
railway up     # Backend (when ready)
```

---

## 🏆 THE PERFECT STACK (TL;DR)

```yaml
Frontend:  Next.js 15 + Phaser.js 4 + TypeScript
Backend:   Next.js API + Node.js microservices
Database:  PostgreSQL (Supabase) + TimescaleDB + Redis
Hosting:   Vercel + Railway + Cloudflare
DevOps:    Turborepo monorepo + GitHub Actions

Why Perfect:
  ✅ Web-native (Phaser > Unity for web)
  ✅ Fast loads (<1s, even on 3G)
  ✅ Mobile-first (80% of Philippines)
  ✅ Scalable from day 1
  ✅ Cost-efficient ($5 → scales to millions)
```

---

## 🎮 THE 3 GAMES

### Game 1: Pattern Master
**Tests:** Pattern recognition, learning speed, cognitive ability
**Difficulty:** Easy to build (2-3 weeks)
**Status:** Full implementation in BPOC_GAMES_AI_PROMPT.md ✅

### Game 2: Resource Rush
**Tests:** Decision-making, strategic thinking, prioritization
**Difficulty:** Medium (4-5 weeks)
**Status:** Architecture defined, ready to build

### Game 3: Innovation Lab
**Tests:** Creativity, problem-solving, innovation
**Difficulty:** Hard (5-6 weeks, physics engine)
**Status:** Architecture defined, ready to build

---

## 🗺️ ARCHITECTURE (One Diagram)

```
┌──────────────────────────────────────────────────────┐
│            games.bpoc.io (Vercel)                    │
│  ┌────────────────────────────────────────────────┐  │
│  │  Next.js App + Phaser.js Games                 │  │
│  │  - Pattern Master                              │  │
│  │  - Resource Rush                               │  │
│  │  - Innovation Lab                              │  │
│  │  - Leaderboard                                 │  │
│  │  - Player Dashboard                            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                      ↓ API Calls
┌──────────────────────────────────────────────────────┐
│         Analytics API (Railway)                      │
│  - Event processing                                  │
│  - Scoring engine                                    │
│  - Anti-cheat detection                              │
│  - ML predictions                                    │
└──────────────────────────────────────────────────────┘
                      ↓ Data Storage
┌──────────────────────────────────────────────────────┐
│              Supabase + Redis                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ PostgreSQL  │  │ TimescaleDB  │  │   Redis    │  │
│  │ - Sessions  │  │ - Events     │  │ - Leaderbd │  │
│  │ - Users     │  │ - Analytics  │  │ - Cache    │  │
│  └─────────────┘  └──────────────┘  └────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Key Points:**
- Frontend serves games (fast, global CDN)
- Backend processes data (heavy lifting)
- Database stores everything (time-series optimized)
- Redis powers leaderboards (real-time)

---

## 🔒 CRITICAL RULES (Read Before Coding)

### 1. NEVER Trust the Client

```typescript
// ❌ BAD
POST /api/complete { score: 99999 }

// ✅ GOOD
POST /api/complete { session_id: 'xxx' }
// Server fetches ALL events and recalculates score
```

### 2. ALWAYS Validate Input

```typescript
// ✅ Every API endpoint
import { z } from 'zod'

const schema = z.object({
  session_id: z.string().uuid(),
  event_type: z.enum(['click', 'decision']),
})

const data = schema.parse(body) // Throws if invalid
```

### 3. Track EVERYTHING

```typescript
// Every action = one event
EventBridge.emit('game:decision', {
  session_id,
  correct: true,
  response_time_ms: 1234,
  level: 5,
  timestamp: Date.now(),
})
```

### 4. Mobile First

```typescript
// Target: 3G network in Philippines
// - Lazy load games (code splitting)
// - Optimize images (Next.js Image)
// - Compress assets (Brotli)
// - Test on real devices
```

### 5. Security Checklist

- [ ] Supabase RLS enabled on ALL tables
- [ ] Rate limiting on ALL API endpoints
- [ ] Input validation with Zod
- [ ] Server-side score calculation
- [ ] Anti-cheat detection
- [ ] HTTPS only (no HTTP)

---

## 📊 WHAT GETS TRACKED (Data is Everything)

```typescript
// EVERY player action:
{
  event_type: 'decision',
  timestamp: '2026-01-23T10:30:45.123Z',
  response_time_ms: 1234,  // ⭐ Key metric
  event_data: {
    level: 5,
    correct: true,
    pattern_sequence: ['circle', 'square'],
    player_answer: 'triangle',
    streak: 3,
    accuracy: 0.87
  }
}

// What you learn from 1000 events:
- Average response time (fast thinker?)
- Accuracy (pattern recognition?)
- Learning curve (improves over time?)
- Risk tolerance (bold or cautious?)
- Persistence (gives up or keeps trying?)
- Strategic thinking (plans ahead?)
- Creativity (unique solutions?)

// Outcome:
"This player is top 5% for analytical thinking,
 great fit for: Data analyst, QA tester"
```

---

## 🚀 YOUR MISSION (Next Steps)

### Option 1: Build Game 1 (Pattern Master)
```bash
1. Read: BPOC_GAMES_AI_PROMPT.md (Game 1 section)
2. Copy: Pattern Master implementation code
3. Build: Follow file structure exactly
4. Test: Ensure it works on mobile
5. Deploy: Push to Vercel

Timeline: 2-3 weeks
```

### Option 2: Set Up Infrastructure
```bash
1. Create: Turborepo monorepo structure
2. Set up: Next.js + Phaser.js integration
3. Configure: Supabase + Redis + Vercel
4. Build: Authentication flow
5. Test: Deploy empty app

Timeline: 1 week
```

### Option 3: Create Architecture Doc
```bash
1. Read: All documentation files
2. Design: Detailed architecture diagrams
3. Write: Technical spec for developers
4. Plan: Sprint breakdown (Jira/Linear)
5. Review: Get team approval

Timeline: 3-5 days
```

---

## 🎯 SUCCESS CRITERIA (MVP in 20 Weeks)

**Week 20 Checklist:**
- [ ] Pattern Master deployed & playable
- [ ] Resource Rush deployed & playable
- [ ] Innovation Lab deployed & playable
- [ ] Authentication working (Supabase)
- [ ] Leaderboards working (Redis)
- [ ] Player dashboard with stats
- [ ] Admin analytics panel
- [ ] Mobile PWA functional
- [ ] Lighthouse score 95+ (mobile)
- [ ] Load time <2s on 3G
- [ ] Anti-cheat active
- [ ] Integration with main BPOC platform

---

## 💰 COST ESTIMATE

```
MVP Development: $15k-25k (solo + contractors)
Infrastructure:  $5-75/mo (scales with users)

Month 1:  $5/mo   (0-1k users)
Month 3:  $75/mo  (1k-10k users)
Month 6:  $220/mo (10k-100k users)
```

---

## 🆘 HELP & RESOURCES

### Documentation
- **Full Context:** `BPOC_GAMES_AI_PROMPT.md`
- **Rules:** `.agent/BPOC_GAMES_RULES.md`
- **Roadmap:** `BPOC_GAMES_QUICKSTART.md`

### Technical Docs
- Phaser.js: https://phaser.io/docs
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TimescaleDB: https://docs.timescale.com

### Community
- Phaser Discord: https://discord.gg/phaser
- Next.js Discord: https://discord.gg/nextjs
- Supabase Discord: https://discord.gg/supabase

---

## 🎯 RECOMMENDED WORKFLOW

### For AI Agents (Cursor, Claude Code, Antigravity)

1. **Load Context:**
   ```
   Read files in this order:
   1. START_HERE_BPOC_GAMES.md (this file)
   2. BPOC_GAMES_AI_PROMPT.md (full context)
   3. .agent/BPOC_GAMES_RULES.md (rules)
   ```

2. **Start Building:**
   ```
   - Create monorepo structure (Turborepo)
   - Implement Game 1 (Pattern Master)
   - Use code from BPOC_GAMES_AI_PROMPT.md
   - Follow architecture exactly
   ```

3. **Iterate:**
   ```
   - Deploy to Vercel
   - Test on mobile
   - Fix bugs
   - Add Game 2, Game 3
   ```

### For Human Developers

1. **Read Documentation (30 mins):**
   - This file (overview)
   - BPOC_GAMES_QUICKSTART.md (roadmap)
   - .agent/BPOC_GAMES_RULES.md (rules)

2. **Set Up Environment (1 hour):**
   - Install Node.js, pnpm, Turbo
   - Create Supabase project
   - Get Upstash Redis account
   - Set up Vercel project

3. **Build Game 1 (2-3 weeks):**
   - Follow week 3-5 in BPOC_GAMES_QUICKSTART.md
   - Reference Game 1 code in BPOC_GAMES_AI_PROMPT.md
   - Test frequently on mobile

4. **Deploy & Iterate:**
   - Deploy to Vercel (production)
   - Get user feedback
   - Fix bugs, optimize performance
   - Build Game 2, Game 3

---

## 🏁 FINAL CHECKLIST

**Before you start coding:**

- [ ] I've read START_HERE_BPOC_GAMES.md (this file)
- [ ] I've read BPOC_GAMES_AI_PROMPT.md (full context)
- [ ] I've read .agent/BPOC_GAMES_RULES.md (rules)
- [ ] I understand the tech stack (Next.js + Phaser + Supabase)
- [ ] I understand the architecture (modular monolith)
- [ ] I understand the security rules (never trust client)
- [ ] I understand the data strategy (track everything)
- [ ] I have access to: Vercel, Supabase, Upstash, Railway
- [ ] I'm ready to build! 🚀

---

## 🎉 YOU'RE READY!

Everything you need is in these 4 files:
1. `START_HERE_BPOC_GAMES.md` ← You are here
2. `BPOC_GAMES_AI_PROMPT.md` ← Full implementation
3. `.agent/BPOC_GAMES_RULES.md` ← Project rules
4. `BPOC_GAMES_QUICKSTART.md` ← Week-by-week plan

**Next step:**
- Read `BPOC_GAMES_AI_PROMPT.md` for complete context
- Then start building Game 1 (Pattern Master)

---

**LET'S BUILD THE FUTURE OF TALENT DISCOVERY!** 🚀🎮

---

_Last Updated: 2026-01-23_
_Status: Ready to build_
_Estimated MVP: 20 weeks_
