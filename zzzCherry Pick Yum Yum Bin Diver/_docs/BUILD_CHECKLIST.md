# Build & Deployment Checklist

## Before Every Build

- [ ] Clean previous build: `rm -rf .next`
- [ ] Ensure all dependencies installed: `npm install`
- [ ] Check for TypeScript/ESLint errors (if time permits)
- [ ] Verify environment variables are set

## Running Production Build

```bash
# Full build process
rm -rf .next
npm run build
bash scripts/validate-build.sh
```

## Expected Build Output

You should see:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

## Validation Checks

After build, verify:
```
✅ .next/prerender-manifest.json exists (58KB+)
✅ .next/BUILD_ID exists
✅ .next/build-manifest.json exists
✅ .next/server/ directory exists
✅ .next/static/ directory exists
✅ No errors in build output
```

## Local Testing (Port 3001)

```bash
# Development
npm run dev

# Production build test
npm run build && npm start
```

Both will run on http://localhost:3001

## Deploying to Vercel

### Automatic (Recommended)
```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel auto-deploys
```

### Manual
```bash
vercel --prod
```

## Common Issues & Quick Fixes

### Issue: prerender-manifest.json missing
**Fix:** `rm -rf .next && npm run build`

### Issue: Build works locally but fails on Vercel
**Fix:** 
1. Check Vercel build logs
2. Verify environment variables in Vercel dashboard
3. Clear Vercel build cache

### Issue: Module not found
**Fix:** 
1. Check package.json dependencies
2. Run `npm install`
3. Rebuild: `npm run build`

### Issue: Function timeout
**Fix:** Increase timeout in vercel.json:
```json
{
  "functions": {
    "src/app/api/your-route/route.ts": {
      "maxDuration": 60
    }
  }
}
```

## Files Modified for Build Fix

✅ `next.config.ts` - Added `output: 'standalone'`
✅ `vercel.json` - Added build/install commands
✅ `package.json` - Updated scripts for port 3001
✅ `scripts/validate-build.sh` - Build validation script
✅ `.vercelignore` - Files to exclude from Vercel

## Key Points

1. **ALWAYS** run `npm run build` before deploying
2. **NEVER** commit the `.next` directory
3. **VALIDATE** builds with `bash scripts/validate-build.sh`
4. **TEST** production builds locally before pushing
5. **CHECK** Vercel dashboard for environment variables

## Quick Commands

```bash
# Clean build
rm -rf .next && npm run build

# Validate
bash scripts/validate-build.sh

# Test locally
npm start

# Deploy
git push origin main
```

## Success Criteria

✅ Build completes without errors
✅ Validation script passes
✅ Local production server starts on port 3001
✅ All pages load correctly
✅ No console errors in browser
✅ Vercel deployment succeeds
