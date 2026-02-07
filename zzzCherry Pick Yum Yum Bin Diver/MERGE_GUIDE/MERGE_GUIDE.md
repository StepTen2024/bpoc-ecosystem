# Merge Guide: `emman-insights-updated` → `main`

> **Step-by-step guide for supervisors to safely merge the `emman-insights-updated` branch into `main` without conflicts.**

---

## 📋 Table of Contents
1. [Pre-Merge Preparation](#pre-merge-preparation)
2. [Merge Process](#merge-process)
3. [Conflict Resolution](#conflict-resolution)
4. [Post-Merge Verification](#post-merge-verification)
5. [Rollback Plan](#rollback-plan)

---

## ⚠️ Important Notes

- **Estimated Time**: 15-20 minutes
- **Risk Level**: Low (code changes only, shared database environment)
- **Recommended**: Perform merge during low-traffic hours
- **Note**: No database migration needed - both branches share the same environment

---

## 🔧 Pre-Merge Preparation

### Step 1: Review the Changes Documentation

Before starting, read the `BRANCH_CHANGES_DOCUMENTATION.md` file to understand:
- What features were added
- Which files were modified
- Potential conflict areas

### Step 2: Verify Your Environment

```bash
# Ensure you're in the project directory
cd c:\Users\bulao\OneDrive\Documents\GitHub\ShoreAgents\bpoc-stepten

# Check your current branch
git branch
# You should see: * main

# Ensure main is up to date
git checkout main
git pull origin main

# Verify Node.js and npm versions
node --version  # Should be v18+ or v20+
npm --version
```

### Step 3: Create a Backup Branch

```bash
# Create a backup of main before merging
git checkout main
git branch main-backup-$(date +%Y%m%d)
git push origin main-backup-$(date +%Y%m%d)

# Confirm backup was created
git branch -a | grep backup
```

### Step 4: Fetch the Feature Branch

```bash
# Fetch all branches
git fetch origin

# Verify the feature branch exists
git branch -a | grep emman-insights-updated

# Expected output:
# remotes/origin/emman-insights-updated
```

---

##  Merge Process

### Method 1: Merge via Pull Request (Recommended)

This is the safest method as it allows for code review and CI/CD checks.

#### Step 1: Create Pull Request

```bash
# Push the feature branch if not already pushed
git checkout emman-insights-updated
git push origin emman-insights-updated

# Go to GitHub/GitLab and create a Pull Request:
# Base: main
# Compare: emman-insights-updated
```

#### Step 2: Review Changes in PR

- Review all file changes
- Check for merge conflicts
- Ensure CI/CD tests pass
- Request code review from team members

#### Step 3: Merge the PR

Once approved:
1. Click "Merge Pull Request"
2. Choose merge strategy: **"Create a merge commit"** (recommended)
3. Confirm merge
4. Delete the feature branch (optional)

### Method 2: Manual Merge via Command Line

If you prefer to merge locally:

#### Step 1: Checkout Main and Update

```bash
# Ensure main is up to date
git checkout main
git pull origin main
```

#### Step 2: Merge Feature Branch

```bash
# Merge emman-insights-updated into main
git merge origin/emman-insights-updated --no-ff

# The --no-ff flag creates a merge commit (recommended for tracking)
```

#### Step 3: Handle Merge Conflicts (if any)

If conflicts occur, see the [Conflict Resolution](#conflict-resolution) section below.

#### Step 4: Push to Remote

```bash
# After resolving conflicts (if any), push to main
git push origin main
```

---

## ⚙️ Conflict Resolution

### Expected Conflict Areas

Based on the changes, you may encounter conflicts in these files:

#### 1. `src/app/insights/[slug]/InsightArticleClient.tsx`

**Conflict Location**: Lines 659-662 (sticky sidebar wrapper)

**What Changed**:
```diff
- <div className="sticky top-24 space-y-6 z-30">
+ <div className="sticky top-20 space-y-6 z-30 self-start">
```

**Resolution**:
```bash
# Open the file in your editor
code src/app/insights/[slug]/InsightArticleClient.tsx

# Look for conflict markers:
<<<<<<< HEAD
<div className="sticky top-24 space-y-6 z-30">
=======
<div className="sticky top-20 space-y-6 z-30 self-start">
>>>>>>> emman-insights-updated

# Keep the new version (bottom):
<div className="sticky top-20 space-y-6 z-30 self-start">

# Save the file
```

**Why**: The new version has better sticky positioning and grid alignment.

#### 2. `src/components/admin/insights/InsightsEditor.tsx`

**Conflict**: Alt text fields may conflict with other form changes

**Resolution Strategy**:
1. Keep all new alt text input fields
2. Preserve any other changes from main
3. Test the form thoroughly after merge

```bash
# If conflicts occur:
git checkout --theirs src/components/admin/insights/InsightsEditor.tsx
# Then manually re-add any main branch changes that were lost
```

#### 3. TypeScript Type Definitions

**Conflict**: Type definitions may have diverged

**Resolution**:
```bash
# Check for type conflicts
git diff main origin/emman-insights-updated -- "*.ts" "*.tsx"

# Merge types carefully, ensuring all new fields are included
```

### General Conflict Resolution Steps

```bash
# 1. Check which files have conflicts
git status

# 2. For each conflicted file:
#    - Open in your editor
#    - Look for <<<<<<< HEAD markers
#    - Decide which version to keep or merge both
#    - Remove conflict markers

# 3. Stage resolved files
git add <resolved-file>

# 4. Continue merge
git merge --continue

# 5. Verify build works
npm run build
```

---

## ✅ Post-Merge Verification

### Step 1: Install Dependencies

```bash
# Install any new dependencies
npm install

# Clear cache if needed
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Run Build

```bash
# Ensure the project builds successfully
npm run build

# Expected output: Build completed without errors
```

### Step 3: Run Tests

```bash
# Run all tests
npm run test

# Run linting
npm run lint

# Fix any linting issues
npm run lint:fix
```

### Step 4: Test Locally

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Step 5: Verify Key Features

#### Frontend Verification

- [ ] Navigate to an article page (e.g., `/insights/[any-article-slug]`)
- [ ] Scroll down and verify sidebar cards stick to top at 80px
- [ ] Click between "Resume" and "Get Hired" tabs
- [ ] Verify smooth transitions and animations
- [ ] Check that stats display correctly (15k+, 92%)
- [ ] Inspect page source and verify alt text is present on images

#### Admin Panel Verification

- [ ] Log in to admin panel (`/admin`)
- [ ] Navigate to Insights section
- [ ] Try creating a new article
- [ ] Verify all AI pipeline stages work
- [ ] Check that alt text fields appear in the editor
- [ ] Upload images and add alt text
- [ ] Preview article and verify alt text displays
- [ ] Publish article successfully

### Step 6: Check for Console Errors

```bash
# In browser DevTools (F12):
# - Check Console tab for errors
# - Check Network tab for failed requests
# - Verify no 404s or 500s
```

### Step 7: Run Lighthouse Audit

```bash
# In Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Run audit on an article page
# 4. Verify SEO score is 90+ (alt text should improve score)
```

---

## 🚀 Deployment to Production

### Step 1: Deploy to Staging First

```bash
# If using Vercel
vercel --prod --scope=staging

# Or your deployment command
npm run deploy:staging
```

### Step 2: Test on Staging

- [ ] Verify all features work on staging
- [ ] Test with real data
- [ ] Check performance metrics

### Step 3: Deploy to Production

```bash
# Only after staging verification passes
vercel --prod

# Or your production deployment command
npm run deploy:production
```

### Step 4: Monitor Production

- [ ] Check error logs for any issues
- [ ] Monitor performance metrics
- [ ] Verify user traffic is normal

---

## 🔄 Rollback Plan

If something goes wrong after merge, follow this rollback procedure:

### Option 1: Revert the Merge Commit

```bash
# Find the merge commit hash
git log --oneline -10

# Revert the merge (replace MERGE_COMMIT_HASH)
git revert -m 1 MERGE_COMMIT_HASH

# Push the revert
git push origin main
```

### Option 2: Reset to Backup Branch

```bash
# Reset main to the backup
git checkout main
git reset --hard main-backup-YYYYMMDD

# Force push (CAUTION: Only if necessary)
git push origin main --force
```

---

## 📊 Merge Checklist

Use this checklist to ensure nothing is missed:

### Pre-Merge
- [ ] Read `BRANCH_CHANGES_DOCUMENTATION.md`
- [ ] Create backup branch (`main-backup-YYYYMMDD`)
- [ ] Verify environment setup (Node.js, npm)

### During Merge
- [ ] Checkout and update main branch
- [ ] Merge feature branch (PR or command line)
- [ ] Resolve any conflicts (see conflict resolution guide)
- [ ] Verify no conflict markers remain in code
- [ ] Run `npm install` to update dependencies

### Post-Merge
- [ ] Run `npm run build` successfully
- [ ] Run `npm run test` - all tests pass
- [ ] Run `npm run lint` - no errors
- [ ] Test locally on `http://localhost:3000`
- [ ] Verify sticky sidebar works on article pages
- [ ] Verify alt text fields in admin panel
- [ ] Run Lighthouse SEO audit
- [ ] Deploy to staging
- [ ] Test on staging environment
- [ ] Deploy to production
- [ ] Monitor production for issues

### Documentation
- [ ] Update CHANGELOG.md with merge details
- [ ] Update README.md if needed
- [ ] Document any manual steps required
- [ ] Notify team of successful merge

---

## 🆘 Troubleshooting

### Issue: Build Fails After Merge

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### Issue: TypeScript Errors

```bash
# Regenerate types
npm run type-check

# If using Supabase, regenerate database types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

### Issue: Sticky Sidebar Not Working

```bash
# Verify the correct code is in place
grep -n "sticky top-20" src/app/insights/[slug]/InsightArticleClient.tsx

# Should show line 662 with: sticky top-20 space-y-6 z-30 self-start
```

---

## 📞 Support

If you encounter issues during the merge:

1. **Check the documentation**: Review `BRANCH_CHANGES_DOCUMENTATION.md`
2. **Review commit history**: `git log emman-insights-updated --oneline`
3. **Contact branch owner**: Emman
4. **Check existing issues**: Review GitHub/GitLab issues

---

## 📝 Post-Merge Tasks

After successful merge:

1. **Update Documentation**
   ```bash
   # Add entry to CHANGELOG.md
   echo "## [Version] - 2026-01-27
   ### Added
   - AI Content Pipeline modular stage components
   - Alt text management for SEO
   - Sticky sidebar CTA cards
   - Silo visualization component
   
   ### Changed
   - Improved sticky positioning on article pages
   - Enhanced InsightsEditor with alt text fields
   " >> CHANGELOG.md
   ```

2. **Clean Up Branches**
   ```bash
   # Delete feature branch (optional)
   git branch -d emman-insights-updated
   git push origin --delete emman-insights-updated
   
   # Keep backup branch for 30 days, then delete
   ```

3. **Notify Team**
   - Send email/Slack message about successful merge
   - Highlight new features available
   - Note any breaking changes (none expected)

4. **Monitor Metrics**
   - Track SEO improvements from alt text
   - Monitor user engagement with sticky sidebar
   - Check article creation workflow usage

---

## ✨ Success Criteria

The merge is considered successful when:

- ✅ All files merged without unresolved conflicts
- ✅ Build completes successfully (`npm run build`)
- ✅ All tests pass (`npm run test`)
- ✅ No console errors in browser
- ✅ Sticky sidebar works on article pages
- ✅ Alt text fields appear in admin panel
- ✅ Lighthouse SEO score maintained or improved
- ✅ Production deployment successful
- ✅ No increase in error rates

---

**Merge prepared by**: Emman  
**Branch**: `emman-insights-updated`  
**Target**: `main`  
**Date**: January 27, 2026  
**Estimated Duration**: 30-45 minutes

---

**Good luck with the merge! 🚀**
