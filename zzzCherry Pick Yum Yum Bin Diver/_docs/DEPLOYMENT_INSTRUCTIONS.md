# 🚀 DEPLOYMENT INSTRUCTIONS - AI Content Pipeline

**For**: Emin Wanka (QA Engineer)  
**Purpose**: Pull code, test locally, and verify deployment  
**Date**: January 23, 2026

---

## 📦 WHAT'S BEING DEPLOYED

**Feature**: Complete AI Content Pipeline (9 Stages)  
**Files Modified/Created**: 17 files (~6,000 lines)  
**Database Changes**: 4 new tables + 4 functions  
**API Routes**: 7 new routes + 1 orchestrator  

---

## 🎯 STEP-BY-STEP DEPLOYMENT GUIDE

### **STEP 1: PULL THE LATEST CODE**

```bash
# Navigate to project directory
cd ~/Desktop/Dev\ Projects/bpoc-stepten

# Check current git status
git status

# Fetch latest changes
git fetch origin

# Create a test branch (recommended for safety)
git checkout -b test/ai-pipeline-jan23

# Pull the AI pipeline code
git pull origin main

# Alternatively, if you want to test on main directly:
# git checkout main
# git pull origin main
```

**Expected output**:
```
Updating abc1234..def5678
Fast-forward
 src/app/api/admin/insights/pipeline/seo-optimize/route.ts    | 1000 ++++++++++
 src/app/api/admin/insights/pipeline/generate-meta/route.ts   |  574 ++++++++
 src/app/api/admin/insights/pipeline/generate-media/route.ts  |  700 +++++++++
 ...
 17 files changed, 6000 insertions(+)
```

---

### **STEP 2: VERIFY FILES WERE PULLED**

```bash
# Check that new files exist
ls -la src/app/api/admin/insights/pipeline/seo-optimize/route.ts
ls -la src/app/api/admin/insights/pipeline/generate-meta/route.ts
ls -la src/app/api/admin/insights/pipeline/generate-media/route.ts
ls -la src/app/api/admin/insights/pipeline/finalize/route.ts
ls -la src/app/api/admin/insights/pipeline/orchestrate/route.ts
ls -la src/app/api/admin/insights/pipeline/list/route.ts
ls -la src/app/api/admin/insights/pipeline/stats/route.ts

# Check documentation
ls -la AI_CONTENT_PIPELINE_COMPLETE.md
ls -la TESTING_GUIDE_FOR_EMIN.md
ls -la SEO_EXPERT_GUIDE.md
ls -la DEPLOYMENT_INSTRUCTIONS.md

# Check database migration
ls -la supabase/migrations/20260123_create_seo_tables.sql
```

**All files should show**:
```
-rw-r--r--  1 user  staff  <size>  Jan 23 <time>  <filename>
```

---

### **STEP 3: INSTALL DEPENDENCIES**

```bash
# Install any new npm packages
npm install

# Verify specific packages
npm list @anthropic-ai/sdk    # Should show v0.60.0
npm list marked                 # Should show latest
npm list @types/marked          # Should show latest
```

**Expected output**:
```
bpoc-stepten@1.0.0
├── @anthropic-ai/sdk@0.60.0
├── marked@11.x.x
└── @types/marked@6.x.x
```

---

### **STEP 4: APPLY DATABASE MIGRATION**

**CRITICAL**: You must create the new tables in Supabase before testing.

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard
   - Select your project: `bpoc-stepten`
   - Navigate to: **SQL Editor**

2. **Run the Migration**:
   ```bash
   # Open the migration file
   cat supabase/migrations/20260123_create_seo_tables.sql
   
   # Copy the entire contents
   ```

3. **Paste in Supabase SQL Editor**:
   - Paste the SQL code
   - Click **Run** (bottom right)
   - Wait for execution (should take 2-5 seconds)

4. **Verify Success**:
   You should see:
   ```
   ✅ Success
   4 tables created
   4 functions created
   ```

5. **Confirm Tables Exist**:
   - Go to: **Table Editor**
   - You should see 4 new tables:
     - `article_embeddings`
     - `article_links`
     - `targeted_keywords`
     - `humanization_patterns`

---

### **STEP 5: VERIFY ENVIRONMENT VARIABLES**

```bash
# Check .env.local file
cat .env.local | grep -E "CLAUDE|GROK|OPENAI|PERPLEXITY|SERPER|GOOGLE|RUNWAY"
```

**Required API keys**:
```env
CLAUDE_API_KEY=sk-ant-...
GROK_API_KEY=xai-...
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
SERPER_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
RUNWAY_API_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

**If any are missing**:
- Ask Stephen for the keys
- Add them to `.env.local`

---

### **STEP 6: START DEVELOPMENT SERVER**

```bash
# Start Next.js dev server
npm run dev
```

**Expected output**:
```
  ▲ Next.js 15.4.8
  - Local:        http://localhost:3001
  - Network:      http://192.168.x.x:3001

 ✓ Ready in 3.2s
```

**Keep this terminal open**. All API logs will appear here.

---

### **STEP 7: RUN QUICK SMOKE TEST**

Open a new terminal and run:

```bash
# Test orchestrator endpoint (quick version)
curl -X POST http://localhost:3001/api/admin/insights/pipeline/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "brief": "Write a short guide about BPO call center training basics in the Philippines. Cover onboarding, key skills, and common challenges. Keep it concise.",
    "autoPublish": false,
    "forcePublish": false
  }'
```

**Watch the dev server terminal**. You should see:

```
🚀 MASTER ORCHESTRATOR STARTED
📝 Brief: Write a short guide about BPO call center...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 STAGE 2: RESEARCH (Perplexity + Serper)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ STAGE 2 COMPLETE (8.2s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 STAGE 3: PLAN GENERATION (Claude Opus 4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
```

**If this works, deployment is successful!** ✅

**Expected time**: 3-10 minutes for full pipeline

**Expected response** (in terminal):
```json
{
  "success": true,
  "article": {
    "id": "...",
    "slug": "bpo-call-center-training-basics",
    "title": "BPO Call Center Training Basics...",
    "url": "/insights/bpo-call-center-training-basics",
    "status": "review",
    "publishedAt": "2026-01-23T..."
  },
  "quality": {
    "score": 87,
    "passed": true
  },
  "pipelineId": "...",
  "totalDuration": 182.3
}
```

---

### **STEP 8: RUN FULL TEST SUITE**

Now follow the comprehensive testing guide:

```bash
# Create test results directory
mkdir -p test_results

# Open testing guide
open TESTING_GUIDE_FOR_EMIN.md

# Follow all 15 tests in the guide
```

**Tests to run**:
1. ✅ Master Orchestrator (Full Pipeline)
2. ✅ Stage 2: Research
3. ✅ Stage 3: Plan Generation
4. ✅ Stage 4: Write Article
5. ✅ Stage 5: Humanize
6. ✅ Stage 6: SEO Optimization
7. ✅ Stage 7: Meta Tags & Schema
8. ✅ Stage 8: Media Generation
9. ✅ Stage 9: Finalize & Publish
10. ✅ CMS: List Articles
11. ✅ CMS: Dashboard Stats
12-15. ✅ Advanced Tests

**Save all test results to `test_results/` folder**.

---

### **STEP 9: VERIFY DEPLOYMENT ON PRODUCTION**

After local testing passes, the code is ready for production.

**Production URL**: https://bpoc.io (or your production domain)

**To deploy to production**:

1. **Merge to main** (if you tested on a branch):
   ```bash
   git checkout main
   git merge test/ai-pipeline-jan23
   git push origin main
   ```

2. **Automatic Deployment**:
   - Vercel will automatically detect the push
   - Deployment starts immediately
   - Check Vercel dashboard for progress
   - Should complete in 2-5 minutes

3. **Apply Database Migration on Production**:
   - Go to Supabase Dashboard
   - Switch to **Production** project
   - Go to **SQL Editor**
   - Run the same migration script
   - Verify tables created

4. **Test Production Endpoints**:
   ```bash
   # Replace with your production URL
   curl -X POST https://bpoc.io/api/admin/insights/pipeline/orchestrate \
     -H "Content-Type: application/json" \
     -d '{
       "brief": "Write a short guide about BPO call center training basics in the Philippines.",
       "autoPublish": false
     }'
   ```

5. **Monitor for Errors**:
   - Check Vercel logs
   - Check Supabase logs
   - Check Sentry (if error tracking setup)

---

## 🔍 TROUBLESHOOTING

### **Issue: Git pull fails**

```bash
# Error: Your local changes would be overwritten by merge
# Solution: Stash changes
git stash
git pull origin main
git stash pop
```

### **Issue: npm install fails**

```bash
# Error: Cannot find module '@anthropic-ai/sdk'
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Issue: Database migration fails**

```
# Error: relation "article_embeddings" already exists
# Solution: Tables were already created, skip migration
```

```
# Error: extension "vector" does not exist
# Solution: Enable pgvector extension first
CREATE EXTENSION IF NOT EXISTS vector;
```

### **Issue: API requests fail with 500 error**

```bash
# Check dev server logs for error message
# Common issues:
# 1. Missing API key
# 2. Supabase connection issue
# 3. Database table doesn't exist
```

**Check API keys**:
```bash
# Verify each key is valid (not expired/revoked)
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-opus-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
# Should return valid response, not 401 Unauthorized
```

### **Issue: Stages take too long**

```
# Expected durations:
# Stage 2 (Research): 8-15s
# Stage 3 (Plan): 10-20s
# Stage 4 (Write): 30-60s
# Stage 5 (Humanize): 20-40s
# Stage 6 (SEO): 15-30s
# Stage 7 (Meta): 5-10s
# Stage 8 (Media): 300-600s (5-10 min) - THIS IS NORMAL
# Stage 9 (Finalize): 10-20s
#
# Total: 5-15 minutes
#
# If any stage >2x expected, check:
# 1. API rate limits
# 2. Network connection
# 3. API service status
```

---

## ✅ DEPLOYMENT CHECKLIST

Before marking as "DEPLOYED & TESTED":

### **Local Testing**
- [ ] All 17 files pulled successfully
- [ ] npm install completed without errors
- [ ] Database migration applied
- [ ] Dev server starts without errors
- [ ] Smoke test passes (orchestrator runs)
- [ ] All 15 tests from TESTING_GUIDE complete
- [ ] All test results saved to `test_results/`
- [ ] No critical errors in dev server logs

### **Code Quality**
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All new files follow project structure
- [ ] Environment variables properly set

### **Database**
- [ ] Migration applied to local Supabase
- [ ] All 4 tables exist
- [ ] All 4 functions work
- [ ] Embeddings can be queried
- [ ] Internal links can be saved

### **API Functionality**
- [ ] All 9 stages complete without errors
- [ ] Orchestrator runs full pipeline
- [ ] CMS listing API works
- [ ] CMS stats API works
- [ ] Quality checks enforce correctly
- [ ] Error handling works (test with invalid inputs)

### **SEO Validation**
- [ ] RankMath scores ≥80/100
- [ ] Meta tags within character limits
- [ ] Schema markup validates
- [ ] Keyword cannibalization detected
- [ ] Orphan articles detected
- [ ] Internal links categorized correctly

### **Production Deployment** (after local tests pass)
- [ ] Code merged to main
- [ ] Pushed to GitHub
- [ ] Vercel deployment successful
- [ ] Migration applied to production Supabase
- [ ] Production smoke test passes
- [ ] No errors in production logs
- [ ] Monitoring setup (Sentry, etc.)

---

## 📊 PERFORMANCE BENCHMARKS

Track these metrics and add to `TEST_RESULTS_SUMMARY.md`:

| Stage | Expected Time | Your Result | Status |
|-------|---------------|-------------|--------|
| Stage 2: Research | <15s | ___ | ⬜ |
| Stage 3: Plan | <20s | ___ | ⬜ |
| Stage 4: Write | <60s | ___ | ⬜ |
| Stage 5: Humanize | <40s | ___ | ⬜ |
| Stage 6: SEO | <30s | ___ | ⬜ |
| Stage 7: Meta | <10s | ___ | ⬜ |
| Stage 8: Media | <600s | ___ | ⬜ |
| Stage 9: Finalize | <20s | ___ | ⬜ |
| **TOTAL** | **<795s (13min)** | ___ | ⬜ |

---

## 🚨 ROLLBACK PROCEDURE (If Needed)

If deployment causes critical issues:

```bash
# 1. Revert the commit
git log --oneline -5
# Find the commit hash BEFORE the pipeline changes

git revert <commit-hash>
git push origin main

# 2. Vercel will auto-deploy the rollback

# 3. Drop the new tables (if needed)
# In Supabase SQL Editor:
DROP TABLE IF EXISTS article_embeddings CASCADE;
DROP TABLE IF EXISTS article_links CASCADE;
DROP TABLE IF EXISTS targeted_keywords CASCADE;
DROP TABLE IF EXISTS humanization_patterns CASCADE;

# 4. Notify Stephen immediately
```

---

## 📞 SUPPORT CONTACTS

**Primary Contact**: Stephen (Project Owner)  
**Issue Reporting**: Create GitHub issue with:
- Test number that failed
- Error message
- Test command used
- Expected vs actual result
- Screenshots (if applicable)

**Urgent Issues**: Message Stephen directly on Slack/Discord

---

## 📝 POST-DEPLOYMENT TASKS

After successful deployment:

1. **Create Summary Document**:
   - `TEST_RESULTS_SUMMARY.md`
   - Overview of all test results
   - Performance benchmarks
   - Any issues found (and how fixed)

2. **Create Bug Report** (if issues found):
   - `BUGS_FOUND.md`
   - List each issue
   - Severity (critical/high/medium/low)
   - Steps to reproduce
   - Suggested fix

3. **Create SEO Audit Report**:
   - `SEO_AUDIT_REPORT.md`
   - Follow format in SEO_EXPERT_GUIDE.md
   - Include RankMath scores
   - Competitive analysis
   - Recommendations

4. **Update Team**:
   - Post in team channel: "AI Pipeline deployed and tested ✅"
   - Share test results summary
   - Highlight any issues/warnings
   - Next steps

---

## 🎉 SUCCESS CRITERIA

Deployment is considered **successful** when:

✅ All local tests pass (15/15)  
✅ Performance benchmarks met  
✅ No critical errors in logs  
✅ Production deployment completes  
✅ Production smoke test passes  
✅ Database migration successful  
✅ SEO audit shows ≥80/100 scores  
✅ Documentation complete  

**When all criteria met**: Notify Stephen with 🎊 emoji

---

**Good luck, Emin! You've got this.** 🚀

**Questions? Check the guides first, then ask Stephen.** 💪
