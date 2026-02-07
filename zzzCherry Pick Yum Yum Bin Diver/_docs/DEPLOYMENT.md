# Deployment Guide for BPOC AI

This guide covers local development, production builds, and Vercel deployment.

## 🚀 Quick Start

### Development (Port 3001)
```bash
npm install
npm run dev
# Server runs on http://localhost:3001
```

### Production Build & Test
```bash
# Clean previous build
rm -rf .next

# Build for production
npm run build

# Validate build
bash scripts/validate-build.sh

# Start production server on port 3001
npm start
```

## 📋 Pre-Deployment Checklist

Before deploying to Vercel, ensure:

- [ ] All environment variables are set in Vercel dashboard
- [ ] Build completes without errors locally
- [ ] Build validation script passes
- [ ] .next directory is in .gitignore (DO NOT commit .next)
- [ ] All dependencies are in package.json
- [ ] next.config.ts is properly configured

## 🔧 Build Requirements

### Required Files for Successful Build

1. **package.json** - Must include:
   ```json
   {
     "scripts": {
       "dev": "next dev -p 3001",
       "build": "npx puppeteer browsers install chrome && next build",
       "start": "next start -p 3001"
     }
   }
   ```

2. **next.config.ts** - Must include:
   ```typescript
   {
     output: 'standalone',  // Optimized for Vercel
     eslint: { ignoreDuringBuilds: true },
     typescript: { ignoreBuildErrors: true }
   }
   ```

3. **vercel.json** - Optional but recommended:
   ```json
   {
     "buildCommand": "npm run build",
     "installCommand": "npm install",
     "framework": "nextjs"
   }
   ```

### Critical Build Artifacts

After `npm run build`, verify these files exist:

```
.next/
├── BUILD_ID
├── build-manifest.json
├── prerender-manifest.json (CRITICAL - this was missing)
├── react-loadable-manifest.json
├── routes-manifest.json
├── required-server-files.json
├── server/
│   ├── app/
│   └── pages/
└── static/
```

## 🐛 Common Build Errors & Solutions

### Error: ENOENT: no such file or directory, open '.next/prerender-manifest.json'

**Cause:** Running `npm run dev` instead of `npm run build`, or incomplete build

**Solution:**
```bash
rm -rf .next
npm run build
bash scripts/validate-build.sh
npm start
```

### Error: Module not found or Can't resolve

**Cause:** Missing dependencies or serverless bundle size limit

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For large packages, add to next.config.ts:
serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium']
```

### Error: Build exceeds Vercel function size limit

**Cause:** Large dependencies bundled in serverless functions

**Solution:**
1. Add heavy packages to `serverExternalPackages` in next.config.ts
2. Use `output: 'standalone'` in next.config.ts
3. Consider splitting large API routes into separate functions

### Error: Chromium/Puppeteer fails on Vercel

**Cause:** Puppeteer not configured for serverless

**Solution:**
- Use `@sparticuz/chromium` package (already installed)
- Configure in API routes:
```typescript
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  args: chromium.args,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});
```

## 📦 Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Connect Repository:**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Environment Variables:**
   Add all variables from your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   OPENAI_API_KEY=...
   ANTHROPIC_API_KEY=...
   GOOGLE_API_KEY=...
   # ... add all other env vars
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   # Vercel automatically deploys on push
   ```

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🔍 Build Validation

Run validation before deploying:

```bash
# Validate build artifacts
bash scripts/validate-build.sh

# Check build size
du -sh .next

# Test production build locally
npm run build && npm start
```

## 🌐 Environment-Specific Configuration

### Local Development (Port 3001)
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001
```

### Vercel Production
```bash
# Set in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app
# No PORT needed - Vercel handles this
```

## 📊 Performance Optimization

### For Vercel Deployment:

1. **Enable Standalone Output:**
   ```typescript
   // next.config.ts
   export default {
     output: 'standalone'
   }
   ```

2. **Optimize Images:**
   ```typescript
   images: {
     formats: ['image/avif', 'image/webp'],
     remotePatterns: [/* your patterns */]
   }
   ```

3. **Configure Function Timeouts:**
   ```json
   // vercel.json
   {
     "functions": {
       "src/app/api/heavy-task/route.ts": {
         "maxDuration": 60,
         "memory": 2048
       }
     }
   }
   ```

## 🔄 Deployment Workflow

### Standard Deployment Process:

```bash
# 1. Develop locally
npm run dev

# 2. Test changes
# Make your changes and test at http://localhost:3001

# 3. Build and validate
rm -rf .next
npm run build
bash scripts/validate-build.sh

# 4. Test production build locally
npm start
# Test at http://localhost:3001

# 5. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 6. Vercel auto-deploys
# Monitor at https://vercel.com/dashboard
```

## 🚨 Troubleshooting

### Build fails on Vercel but works locally

1. Check Vercel build logs
2. Verify all environment variables are set
3. Ensure Node.js version matches (check package.json engines)
4. Check for platform-specific code (e.g., file paths)

### Function timeout on Vercel

Increase timeout in vercel.json:
```json
{
  "functions": {
    "src/app/api/slow-endpoint/route.ts": {
      "maxDuration": 60
    }
  }
}
```

### Module not found on Vercel

- Clear Vercel build cache in dashboard
- Verify dependency is in `dependencies` not `devDependencies`
- Check if package needs to be in `serverExternalPackages`

## 📞 Support Resources

- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- Build Validation: `bash scripts/validate-build.sh`

## 🎯 Summary

**For Local Development:**
```bash
npm install
npm run dev  # Runs on port 3001
```

**For Production Deployment:**
```bash
npm run build
bash scripts/validate-build.sh
git push origin main  # Auto-deploys to Vercel
```

**Key Files to Never Commit:**
- `.next/` directory
- `node_modules/`
- `.env.local`
- `.vercel/`
