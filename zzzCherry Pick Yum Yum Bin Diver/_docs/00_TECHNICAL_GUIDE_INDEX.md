# 📚 BPOC Technical Documentation - Master Index

**Last Updated:** January 27, 2026  
**Status:** ✅ Complete & Verified  
**Database:** Supabase `ayrdnsiaylomcemfdisr` (69 tables, 23,279 records)

---

## 📖 How to Use This Documentation

This documentation is split into **2 comprehensive parts** for easier navigation:

### **Part 1:** Foundation & Architecture
**File:** `BPOC_COMPLETE_TECHNICAL_GUIDE.md`

**Contains:**
- ✅ Project Overview (with live metrics)
- ✅ Complete Technology Stack (all libraries with versions)
- ✅ Database Architecture (all 69 tables with verified row counts)
- ✅ File Structure (complete directory tree)

### **Part 2:** Systems & Operations
**File:** `BPOC_TECHNICAL_GUIDE_PART2.md`

**Contains:**
- ✅ Key Features & Systems (7 major systems with complete flows)
  - Recruitment Pipeline
  - Resume Builder & AI Analysis
  - HR Assistant (Ate Yna)
  - Video Interview System
  - Content Engine (7-stage pipeline)
  - Outbound Lead System
  - Admin Platform
- ✅ Development Workflow
- ✅ Deployment & Infrastructure
- ✅ Testing & QA
- ✅ API Reference
- ✅ Troubleshooting Guide

---

## 🚀 Quick Start Guide

### For New Developers
1. Read: `START_HERE.md` (project quickstart)
2. Read: `BPOC_COMPLETE_TECHNICAL_GUIDE.md` (foundation)
3. Read: `BPOC_TECHNICAL_GUIDE_PART2.md` (systems)
4. Reference: `.agent/DATABASE_SCHEMA.md` (database details)

### For Bug Fixes
1. Check: `KNOWN_BUGS.md`
2. Reference: `BPOC_TECHNICAL_GUIDE_PART2.md` (troubleshooting section)
3. Check: Platform errors in admin dashboard
4. Reference: Specific feature docs in `Docs/Features/`

### For New Features
1. Read: Feature-specific docs in `Docs/Features/`
2. Reference: `Docs/API/BPOC_API_COMPLETE_GUIDE.md`
3. Check: Database schema in `.agent/DATABASE_SCHEMA.md`
4. Reference: Architecture docs in `Docs/Architecture/`

### For Deployment
1. Read: `DEPLOYMENT.md`
2. Reference: `VERCEL_REDEPLOY_QUICK_GUIDE.md`
3. Check: Build checklist in `BUILD_CHECKLIST.md`

---

## 📊 Live System Metrics (Jan 27, 2026)

```
Production Status: ✅ LIVE
Database: 69 tables, 42 enums, 7 storage buckets
Total Records: 23,279

User Base:
├── Candidates: 23 (all active)
├── Agencies: 2 (1 with API enabled)
├── Recruiters: 1
└── Admin Users: 2 (estimate)

Activity:
├── Job Applications: 8 (7 in pipeline, 1 rejected)
├── Active Jobs: 19
├── Video Calls: 3 completed
├── Resume Analyses: 4
└── HR KB Articles: 446

Content & Outreach:
├── Published Articles: 3
├── Content Pipelines: 3
├── Lead Database: 23,132 contacts
└── Outbound Contacts: 31 managed
```

---

## 🗂️ Documentation Structure

### Core Technical Docs (Read First)
```
1. 00_TECHNICAL_GUIDE_INDEX.md (this file)
2. BPOC_COMPLETE_TECHNICAL_GUIDE.md (Part 1: Foundation)
3. BPOC_TECHNICAL_GUIDE_PART2.md (Part 2: Systems)
4. START_HERE.md (Quickstart)
5. PLATFORM_KNOWLEDGE_BASE.md (System overview)
```

### Database Documentation
```
.agent/DATABASE_SCHEMA.md - Complete schema reference
.agent/database/ - Detailed table specs
  ├── enums.md - All 42 enum types
  ├── tables.md - Table relationships
  └── rls-policies.md - Row level security
```

### API Documentation
```
Docs/API/BPOC_API_COMPLETE_GUIDE.md - Full API reference
Docs/API/API_QUICK_REFERENCE.md - Cheat sheet
.agent/api/ - Endpoint documentation
```

### Feature Documentation
```
Docs/Features/ - Individual feature guides
  ├── Resume_Builder.md
  ├── HR_Assistant.md
  ├── Video_Interviews.md
  ├── Content_Pipeline.md
  └── Outbound_System.md
```

### Testing Documentation
```
Docs/Testing/ - Test plans & reports
TESTING_GUIDE.md - Testing instructions
COMPREHENSIVE_PLATFORM_TEST_REPORT.md - Latest results
```

### Deployment Documentation
```
DEPLOYMENT.md - Full deployment guide
VERCEL_REDEPLOY_QUICK_GUIDE.md - Quick redeploy
BUILD_CHECKLIST.md - Pre-deployment checklist
```

---

## 🔑 Key System Components

### 1. Authentication System
- **Tables:** `candidates`, `bpoc_users`, `agency_recruiters`, `admin_users`
- **Auth Provider:** Supabase Auth (JWT-based)
- **Features:** Magic links, OAuth, email verification
- **RLS:** Enabled on all user tables

### 2. Recruitment Pipeline
- **Tables:** `jobs`, `job_applications`, `application_activity_timeline`
- **Flow:** 12 stages from posting to employment
- **Features:** Kanban board, client release control, full audit trail
- **Status:** ✅ Production-ready

### 3. Resume & AI Analysis
- **Tables:** `candidate_resumes`, `candidate_ai_analysis`, `anonymous_sessions`
- **AI Models:** GPT-4 (analysis), OpenAI embeddings
- **Scores:** ATS, Content Quality, Presentation, Skills Alignment
- **Features:** Anonymous upload, profile auto-population

### 4. HR Assistant (Ate Yna)
- **Tables:** `hr_embeddings_kb` (446 articles)
- **Knowledge Base:** Philippine Labor Code 2026
- **Technology:** pgvector, OpenAI embeddings, GPT-4
- **Features:** Vector search, citations, 30-day conversation retention

### 5. Video Interviews
- **Provider:** Daily.co
- **Tables:** `video_call_rooms`, `video_call_recordings`, `video_call_transcripts`
- **Features:** Recording, transcription (Whisper), screen sharing
- **Call Types:** Prescreen, client, panel, technical, final

### 6. Content Engine
- **Tables:** `insights_posts`, `content_pipelines`
- **Pipeline:** 7 stages (Brief → Research → Plan → Write → Humanize → SEO → Publish)
- **AI Models:** GPT-4 (writing), Grok (humanization), Perplexity (research)
- **Features:** Anti-cannibalization, internal linking, schema markup

### 7. Outbound Lead System
- **Tables:** `carpet_bomb_leads` (23,132 rows), `email_campaigns`
- **Provider:** Resend (email)
- **Features:** CSV import, deduplication, UTM tracking, engagement analytics
- **Compliance:** CAN-SPAM, Philippine Data Privacy Act

### 8. Admin Platform
- **Tables:** `admin_audit_log`, `platform_errors`
- **Features:** AI-powered error diagnosis (Gemini), audit logging, agency management
- **Dashboard:** Analytics, user management, error Kanban

---

## 🛠️ Development Tools Required

### Core Tools
```
Node.js: 18+ (LTS)
npm: 9+
Git: 2.40+
```

### AI/Agent Tools
```
AntiGravity (Google): Multi-agent IDE
Claude Code: Terminal coding assistant
Codecs: Bug testing framework
```

### Research Tools
```
Perplexity API: Always use for 2026+ data
Serper API: Google search results
Universal API: Multi-model access
```

---

## 📞 Quick Reference

### Most Important Files
```
1. src/lib/supabase/client.ts - Database client (browser)
2. src/lib/supabase/server.ts - Database client (server)
3. src/contexts/AuthContext.tsx - Auth state
4. src/app/api/*/route.ts - All API endpoints
5. .agent/DATABASE_SCHEMA.md - DB reference
```

### Most Important Tables
```
1. candidates - User accounts
2. job_applications - Pipeline tracking
3. application_activity_timeline - Audit trail
4. hr_embeddings_kb - HR knowledge
5. carpet_bomb_leads - Lead database
```

### Most Important Commands
```bash
npm run dev                  # Start dev server (localhost:3001)
npm run build                # Build for production
git push origin main         # Deploy to Vercel
```

### Most Important URLs
```
Development: http://localhost:3001
Production: https://bpoc.vercel.app
Database: Supabase Dashboard (ayrdnsiaylomcemfdisr)
```

---

## 🔍 Finding What You Need

### "I need to understand the database"
→ Read: `BPOC_COMPLETE_TECHNICAL_GUIDE.md` (Database Architecture section)  
→ Reference: `.agent/DATABASE_SCHEMA.md`

### "I need to build a new feature"
→ Read: `BPOC_TECHNICAL_GUIDE_PART2.md` (Development Workflow section)  
→ Reference: `Docs/Features/` for similar features  
→ Check: `.agent/architecture/` for system design

### "I need to fix a bug"
→ Check: `KNOWN_BUGS.md`  
→ Reference: `BPOC_TECHNICAL_GUIDE_PART2.md` (Troubleshooting section)  
→ Check: Platform errors in admin dashboard

### "I need to deploy"
→ Read: `DEPLOYMENT.md`  
→ Quick reference: `VERCEL_REDEPLOY_QUICK_GUIDE.md`  
→ Checklist: `BUILD_CHECKLIST.md`

### "I need to call an API"
→ Reference: `Docs/API/BPOC_API_COMPLETE_GUIDE.md`  
→ Quick ref: `Docs/API/API_QUICK_REFERENCE.md`

### "I need to write tests"
→ Read: `TESTING_GUIDE.md`  
→ Reference: `Docs/Testing/` for test plans  
→ Use: Codecs for automated testing

---

## ⚠️ Important Notes

### Always Verify Database State
- Never assume data exists
- Always query Supabase first
- Use MCP tools for direct database access

### Always Use 2026+ Data for Research
- Use Perplexity API (always current)
- Never rely on training data for current info
- Verify facts with web search

### Always Follow Security Rules
- RLS enabled on all user tables
- API keys in environment variables only
- Audit all admin actions
- JWT authentication required

### Always Test Before Deploy
- Run `npm run build` locally
- Test critical flows manually
- Check database writes
- Monitor error rates

---

## 📚 Additional Resources

### External Documentation
```
Next.js: https://nextjs.org/docs
Supabase: https://supabase.com/docs
Daily.co: https://docs.daily.co
OpenAI: https://platform.openai.com/docs
Tailwind: https://tailwindcss.com/docs
shadcn/ui: https://ui.shadcn.com
```

### Support
```
Project Owner: StepTen
Database: Supabase (ayrdnsiaylomcemfdisr)
Deployment: Vercel
Repository: GitHub (private)
```

---

## ✅ Document Status

**Part 1 (Foundation):** ✅ Complete  
**Part 2 (Systems):** ✅ Complete  
**Last Verified:** January 27, 2026  
**Next Update:** As needed

---

**Quick Navigation:**
- [Part 1: Foundation →](BPOC_COMPLETE_TECHNICAL_GUIDE.md)
- [Part 2: Systems →](BPOC_TECHNICAL_GUIDE_PART2.md)
- [Database Schema →](.agent/DATABASE_SCHEMA.md)
- [API Reference →](Docs/API/BPOC_API_COMPLETE_GUIDE.md)
- [Start Here →](START_HERE.md)
