# 🐀➡️🥟 RAT TO DUMPLING — BPOC Insights Pipeline Handover

*From Pinky (the Lab Rat) to Kimi (the Chinese Dumpling). Don't fuck this up.*

---

## MISSION

Fix and complete the **BPOC Insights Pipeline** — an 8-stage AI content generation system at `bpoc.io/admin/insights/create`. The pipeline generates SEO-optimized blog articles for the BPO industry.

**Current Status:** Stages 1-2 work. Stage 3+ is broken (API key issue in Vercel, possibly other bugs). Stages 4-8 need testing and may need fixes.

**Repo:** `~/Desktop/Old Mac Dev/bpoc-stepten/` (Next.js 14, TypeScript, Supabase)
**Live:** `https://www.bpoc.io`
**GitHub:** `StepTen2024/bpoc-stepten` (main branch, auto-deploys to Vercel)

---

## THE 8-STAGE PIPELINE

Each stage is an API route in `src/app/api/admin/insights/pipeline/`
Frontend: `src/app/(admin)/admin/insights/create/page.tsx` (1508 lines)

| Stage | Route | Model | What It Does |
|-------|-------|-------|-------------|
| 1 | `ideas/` | Grok 4.1 Fast (Reasoning) | Takes voice brief → generates 3 article ideas with titles, descriptions, keywords |
| 2 | `research/` | Perplexity Sonar Pro + Serper | Deep research — Perplexity insights, Google SERP analysis, competitor analysis, PAA questions, link validation |
| 3 | `generate-plan/` | Claude Sonnet 4 | Generates article structure — H2/H3 headings, section briefs, keyword strategy, outbound link plan |
| 4 | `write-article/` | Claude Sonnet 4 | Writes the full article based on the plan |
| 5 | `humanize/` | Grok 4.1 Fast | Rewrites to sound human, beat AI detection |
| 6 | `seo-optimize/` | OpenAI text-embedding-3-small | SEO optimization pass — internal linking, keyword density, meta tags |
| 7 | `generate-media/` | GPT-4o + Google Imagen | Generates hero image, section images, alt text |
| 8 | `publish/` | GPT-4o | Final assembly, SEO checklist, publishes to Supabase |

Also: `finalize/` (681 lines) and `generate-meta/` (853 lines) for post-processing.

---

## KNOWN ISSUES TO FIX

### 1. Stage 3 failing with 500
- **Root cause:** `CLAUDE_API_KEY` env var in Vercel might be wrong/old
- The working key is in Pinky Commander credentials table (see DB access below)
- **Quick fix:** Verify the key in Vercel matches the working one, or hardcode temporarily to test
- Test: hit the route with sample data and see what Claude returns

### 2. Competitor link strategy (FIXED but verify)
- Research (Stage 2) identifies competitors but we MUST NOT link to them
- They should be analyzed for gaps/weaknesses only
- Outbound links should only go to high-DA non-competing sources
- This was fixed in the last commit but needs verification through Stage 3+

### 3. Stages 4-8 untested
- Nobody has run through a complete pipeline yet
- Each stage needs testing with real data
- Data flow between stages may have issues

### 4. Frontend state management
- The create page (1508 lines) manages all 8 stages
- State flows: `transcript → ideas → selectedIdea → researchData → plan → article → humanized → seoOptimized → media → published`
- Check that each stage passes the right data to the next

---

## DATABASE ACCESS

### BPOC Supabase (production data)
- **Project ref:** `ayrdnsiaylomcemfdisr`
- **URL:** from `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`
- **Service Role Key:** from `.env.local` → `SUPABASE_SERVICE_ROLE_KEY`
- **Management API:** `POST https://api.supabase.com/v1/projects/ayrdnsiaylomcemfdisr/database/query`
  - Header: `Authorization: Bearer sbp_b5657d5c82589468ec6403278a5b1228c11a0f27`
  - Body: `{"query": "SQL HERE"}`

### Key Tables

**`insights_posts`** — The main articles table
- `pipeline_stage`: tracks where in the pipeline (ideas, research, plan_review, writing, humanizing, seo, media, published)
- `generation_metadata`: JSON blob with all AI outputs
- `silo_topic`, `is_pillar`, `depth` — for silo/topic cluster structure

**`content_pipelines`** — Pipeline execution state
- Tracks every stage's output (generated_ideas, research_synthesis, article_plan, raw_article, etc.)
- `current_stage`: integer 1-8
- Links to `insights_posts` via `insight_id`

**`insights_silos`** — Topic categories/silos
- BPO industry topics (Outsourcing, Virtual Assistants, Remote Teams, etc.)
- Each silo has context, voice, SEO metadata

**`silo_hierarchy`** — View showing parent/child article relationships
**`silo_structure`** — View showing pillar → supporting article counts
**`pipeline_execution_logs`** — Logs of each AI call (model, tokens, cost, duration)

---

## API KEYS (env vars needed)

All keys are in the `.env.local` file at the repo root. Here's what each stage needs:

| Env Var | Used By | Service |
|---------|---------|---------|
| `CLAUDE_API_KEY` | Stage 3, 4 | Anthropic Claude Sonnet 4 |
| `GROK_API_KEY` / `XAI_API_KEY` | Stage 1, 5 | xAI Grok |
| `PERPLEXITY_API_KEY` | Stage 2 | Perplexity Sonar Pro |
| `SERPER_API_KEY` | Stage 2 | Google SERP API |
| `OPENAI_API_KEY` | Stage 6, 7, 8 | OpenAI GPT-4o, embeddings |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Stage 7 | Google Imagen 4 |
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase connection |
| `SUPABASE_SERVICE_ROLE_KEY` | All | Supabase admin access |

**If any key is broken:** Check the Pinky Commander credentials table:
```
Pinky Commander Supabase: lcxxjftqaafukixdhfjg
URL: https://lcxxjftqaafukixdhfjg.supabase.co
Service Key: (in ~/clawd/pinky-commander/.env.local → SUPABASE_SERVICE_ROLE_KEY)
Table: credentials (columns: name, value, service, notes)
```

---

## FILE STRUCTURE

```
src/app/api/admin/insights/pipeline/
├── ideas/route.ts            # Stage 1: Grok generates ideas (292 lines)
├── research/route.ts         # Stage 2: Perplexity + Serper research (603 lines)
├── generate-plan/route.ts    # Stage 3: Claude generates plan (479 lines)
├── write-article/route.ts    # Stage 4: Claude writes article (655 lines)
├── humanize/route.ts         # Stage 5: Grok humanizes (449 lines)
├── seo-optimize/route.ts     # Stage 6: SEO optimization (1124 lines)
├── generate-media/route.ts   # Stage 7: Image generation (563 lines)
├── publish/route.ts          # Stage 8: Final publish (424 lines)
├── generate-meta/route.ts    # Meta generation (853 lines)
├── finalize/route.ts         # Finalization (681 lines)
├── orchestrate/route.ts      # Auto-run pipeline (427 lines)
├── run/route.ts              # Pipeline runner (206 lines)
├── scan-links/route.ts       # Link validation (295 lines)
├── voice-personality/route.ts # Whisper transcription (131 lines)
└── ... (other helpers)

src/app/(admin)/admin/insights/create/page.tsx  # Frontend (1508 lines)
src/lib/error-logger.ts                         # Error logging utility
```

---

## WHAT SUCCESS LOOKS LIKE

1. **All 8 stages execute without errors** — user clicks through Stage 1 → 8 and gets a published article
2. **Data flows correctly** between stages — no missing fields, no null errors
3. **Competitors are analyzed but never linked to** — outbound links only to authoritative non-competing sources
4. **Articles are SEO-optimized** — proper heading structure, keyword density, internal links, meta tags
5. **Pipeline state is saved** to both `insights_posts` and `content_pipelines` at each stage

---

## APPROACH

1. **Read the frontend** (`create/page.tsx`) to understand the full UI flow and state management
2. **Read each stage's route** in order (1→8) to understand data contracts
3. **Fix Stage 3** first (the API key / Claude call)
4. **Test each stage** with real data, checking inputs/outputs match
5. **Fix any data flow issues** between stages
6. **Run a full pipeline** end-to-end
7. **Report back** what you fixed, what works, what still needs attention

---

## RULES

- **Don't break what works** — Stages 1-2 are confirmed working
- **Commit and push** after each meaningful fix (auto-deploys to Vercel)
- **Don't create outbound links to competitors** — analyze only
- **Use Google Imagen for images, NOT OpenAI** — OpenAI safety filters are too strict
- **Log everything** — use `pipeline_execution_logs` table for AI call tracking
- **Don't guess API endpoints from training data** — check the actual code and .env.local

---

*Good luck, Dumpling. The Rat is watching. 🐀🥟*
