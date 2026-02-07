# Leaderboards Feature - Removed/Disabled

## What Was Removed

### Pages Deleted
- ❌ `src/app/leaderboards/page.tsx` - Public leaderboards page
- ❌ `src/app/(admin)/admin/leaderboard/page.tsx` - Admin leaderboards page

### API Calls Disabled
- ❌ `/api/leaderboards?category=overall&limit=5&offset=0` - Was being called from home page (404 error)
- ❌ `/api/leaderboards/user/${userId}` - Was being called from profile page
- ✅ No API routes existed, which is why they were 404ing

### Navigation Links Removed
- ❌ Admin sidebar - "Leaderboard" link removed
- ❌ Admin layout - "Leaderboards" navigation removed

### Code Changes
- ✅ `src/app/home/page.tsx` - Removed leaderboard fetch useEffect, removed RankBadge component, removed topUsers state
- ✅ `src/app/[slug]/ProfilePageClient.tsx` - Disabled leaderboard score fetching, set defaults
- ✅ `src/components/admin/AdminSidebar.tsx` - Removed "Leaderboard" link
- ✅ `src/components/shared/layout/AdminLayout.tsx` - Removed "Leaderboards" link

## What Remains (Harmless)

### Marketing Copy (No functionality)
- Text mentions of "leaderboards" in feature descriptions (e.g., "Compete on global leaderboards")
- These are just marketing text, not functional links or API calls
- Found in:
  - `src/app/home/page.tsx` - Feature descriptions for typing game
  - `src/components/shared/sections/CareerToolsCards.tsx`
  - `src/app/(recruiter)/recruiter/placements/page.tsx`
  - `src/components/shared/layout/RecruiterFooter.tsx`
  - `src/app/(recruiter)/recruiter/page.tsx`
  - `src/app/talent-search/page.tsx`

## What Needs to Be Implemented (Later)

When you want to implement leaderboards, you'll need:

### 1. Database Tables
```sql
CREATE TABLE leaderboard_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  category VARCHAR(50), -- 'overall', 'typing_hero', 'disc', etc.
  score NUMERIC,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_category_rank ON leaderboard_scores(category, rank);
CREATE INDEX idx_leaderboard_user ON leaderboard_scores(user_id);
```

### 2. API Routes
- `GET /api/leaderboards` - List top users by category
- `GET /api/leaderboards/user/:userId` - Get user's scores and ranks
- `POST /api/leaderboards/update` - Update user score (called after game completion)

### 3. Frontend Components
- Leaderboard table component
- Rank badge component (already existed, was removed)
- User score display

### 4. Game Integration
- After completing typing game → update leaderboard
- After completing DISC assessment → update leaderboard
- Calculate overall score from multiple categories

## Why It Was Removed

1. **No API Implementation**: The frontend was calling `/api/leaderboards/*` but those routes don't exist
2. **404 Errors**: Browser console showing 404 errors on every page load
3. **Feature Not Ready**: Database tables, scoring logic, and rank calculation not implemented
4. **Confusing UX**: Links to pages that don't work

## Quick Re-enable (When Ready)

When you implement the feature:

1. Create the API routes in `src/app/api/leaderboards/`
2. Uncomment the code in `src/app/[slug]/ProfilePageClient.tsx` (line ~946)
3. Re-add the useEffect in `src/app/home/page.tsx` to fetch top users
4. Restore the pages from git history:
   ```bash
   git log --all --full-history -- src/app/leaderboards/page.tsx
   git checkout <commit-hash> -- src/app/leaderboards/page.tsx
   ```
5. Add navigation links back to sidebars

---

_Status: Feature parked for later implementation_
_Date Removed: 2026-01-22_
