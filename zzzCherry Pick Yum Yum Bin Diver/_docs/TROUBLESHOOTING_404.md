# Troubleshooting 404 Errors for Static Assets

## The Problem You Encountered

Browser errors showing:
```
❌ layout.css:1 Failed to load resource: 404 (Not Found)
❌ favicon.ico:1 Failed to load resource: 500 (Internal Server Error)
❌ _next/static/chunks/main-app.js Failed to load resource: 404 (Not Found)
❌ _next/static/chunks/app-pages-internals.js Failed to load resource: 404
❌ _next/static/chunks/app/home/page.js Failed to load resource: 404
```

## Root Cause

The issue occurred because:

1. **Mixed Build States**: The `.next` directory had artifacts from both `npm run build` (production) and `npm run dev` (development)
2. **Different File Structures**: Production and development modes create completely different folder structures
3. **Browser Caching**: Your browser cached the old URLs pointing to non-existent files
4. **Stale Processes**: Old Next.js dev servers were still running

## What Was Fixed

### 1. Cleaned Mixed Build State
```bash
rm -rf .next
```
This removed all conflicting build artifacts.

### 2. Killed Stale Processes
```bash
pkill -f "next dev"
pkill -f "next-server"
```
Stopped all running Next.js processes.

### 3. Started Fresh Development Server
```bash
npm run dev
```
Created clean development build with proper file structure.

## Verification - Files Now Present

✅ All required files are now in place:

```
.next/static/
├── css/
│   └── app/layout.css ✓
├── chunks/
│   ├── main-app.js ✓
│   ├── app-pages-internals.js ✓
│   ├── app/
│   │   ├── layout.js ✓
│   │   ├── page.js ✓
│   │   ├── home/page.js ✓
│   │   └── not-found.js ✓
│   └── polyfills.js ✓
├── media/ ✓
├── webpack/ ✓
└── development/ ✓
```

## How to Fix This Issue If It Happens Again

### Quick Fix (Recommended)
```bash
# 1. Stop all Next.js processes
pkill -f "next"

# 2. Clean the build directory
rm -rf .next

# 3. Clear browser cache (Hard Reload)
# Chrome/Edge: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Firefox: Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)
# Safari: Cmd+Option+R

# 4. Start fresh
npm run dev
```

### Full Reset (If Quick Fix Doesn't Work)
```bash
# 1. Kill all Node processes
pkill -f node

# 2. Clean everything
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# 3. Reinstall
npm install

# 4. Start dev server
npm run dev

# 5. Hard reload browser
```

## Understanding Development vs Production Modes

### Development Mode (`npm run dev`)
- **Purpose**: Fast development with hot reload
- **Build Time**: Incremental (only changed files)
- **File Location**: `.next/static/chunks/`, `.next/server/`
- **Cache**: Minimal caching for fast updates
- **Source Maps**: Full source maps enabled
- **Optimization**: Minimal optimization

### Production Mode (`npm run build` + `npm start`)
- **Purpose**: Optimized for deployment
- **Build Time**: Full build (all files)
- **File Location**: `.next/standalone/`, `.next/static/[buildId]/`
- **Cache**: Aggressive caching with build IDs
- **Source Maps**: Production source maps
- **Optimization**: Full optimization (minification, tree-shaking)

## Important Rules

### ⚠️ DO NOT Mix Build Modes

**WRONG:**
```bash
npm run build     # Creates production build
npm run dev       # Tries to use production .next folder
# ❌ Result: 404 errors, missing files
```

**CORRECT:**
```bash
# For Development:
rm -rf .next && npm run dev

# For Production:
rm -rf .next && npm run build && npm start
```

### ✅ When to Use Each Mode

| Scenario | Command | Port |
|----------|---------|------|
| Local development | `npm run dev` | 3001 |
| Production testing | `npm run build && npm start` | 3001 |
| Vercel deployment | Auto-builds with `npm run build` | Auto |

## Browser Cache Issues

### Clear Browser Cache Methods

**Chrome/Edge (Mac):**
1. Open DevTools (Cmd+Option+I)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

**Chrome/Edge (Windows):**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

**Firefox:**
- Mac: Cmd+Shift+R
- Windows: Ctrl+F5

**Safari:**
- Cmd+Option+R

### Disable Cache During Development

**In Chrome DevTools:**
1. Open DevTools (Cmd+Option+I / F12)
2. Go to "Network" tab
3. Check "Disable cache"
4. Keep DevTools open while developing

**In Next.js:**
```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, must-revalidate',
        },
      ],
    },
  ],
}
```

## Common 404 Scenarios & Solutions

### Scenario 1: After Switching from Production to Dev
**Error**: 404 on all static files
**Fix**: `rm -rf .next && npm run dev`

### Scenario 2: After Git Pull
**Error**: Files not found
**Fix**: `rm -rf .next && npm install && npm run dev`

### Scenario 3: After Package Updates
**Error**: Module not found or 404
**Fix**: `rm -rf node_modules .next && npm install && npm run dev`

### Scenario 4: Favicon 500 Error
**Cause**: Favicon processing error
**Fix**: 
1. Check `src/app/favicon.ico` exists
2. Ensure it's a valid ICO file
3. Try clearing `.next` and rebuilding

### Scenario 5: CSS Files 404
**Cause**: CSS compilation issue
**Fix**: `rm -rf .next && npm run dev`

## Prevention Tips

### 1. Always Clean Before Switching Modes
```bash
# Switching to dev
rm -rf .next && npm run dev

# Switching to production
rm -rf .next && npm run build && npm start
```

### 2. Use npm Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "dev:clean": "rm -rf .next && next dev -p 3001",
    "build:clean": "rm -rf .next && next build",
    "start:clean": "rm -rf .next && next build && next start -p 3001"
  }
}
```

### 3. Git Ignore .next
Ensure `.gitignore` contains:
```
/.next/
```
Never commit the `.next` directory!

### 4. Document Your Workflow
Create a `DEVELOPMENT.md`:
```markdown
# Development Workflow

## First Time Setup
npm install

## Daily Development
npm run dev:clean

## Testing Production Build
npm run build:clean
npm start

## Before Git Commit
rm -rf .next
git add .
git commit -m "Your message"
```

## Checklist When You See 404 Errors

- [ ] Stop all Next.js processes: `pkill -f next`
- [ ] Delete .next folder: `rm -rf .next`
- [ ] Check if port 3001 is clear: `lsof -i :3001`
- [ ] Start fresh dev server: `npm run dev`
- [ ] Hard reload browser: `Cmd+Shift+R` or `Ctrl+Shift+R`
- [ ] Check browser DevTools Network tab for actual errors
- [ ] Verify files exist: `ls -la .next/static/chunks/`
- [ ] Check Node.js version: `node -v` (should be v18+)
- [ ] Check Next.js version: `npm list next` (should be 15.4.8)

## Current Status

✅ **FIXED!** Your server is now running correctly:

```bash
# Server Status
✅ Port 3001: LISTENING
✅ HTTP Response: 200 OK
✅ All static files: PRESENT
✅ layout.css: /Users/.../bpoc-stepten/.next/static/css/app/layout.css
✅ main-app.js: /Users/.../bpoc-stepten/.next/static/chunks/main-app.js
✅ favicon.ico: /Users/.../bpoc-stepten/src/app/favicon.ico
```

**Next Steps:**
1. Hard reload your browser (Cmd+Shift+R)
2. Open DevTools and check Network tab
3. All requests should now return 200 OK
4. If still seeing 404s, clear browser cache completely

---

**Last Updated**: January 17, 2025, 2:20 PM  
**Status**: ✅ RESOLVED  
**Server**: Running on port 3001  
**Mode**: Development
