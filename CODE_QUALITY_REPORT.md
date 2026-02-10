# BPOC Monorepo Code Quality Report
**Generated:** 2026-02-10

## Summary

Scanned all 4 apps (admin, candidate, recruiter, web) for code quality issues.

## ✅ Fixed

### Debug Console Logs Removed
1. **apps/admin/src/contexts/AdminContext.tsx**
   - Removed verbose `console.log` for admin status checks
   - Kept error logging intact

2. **apps/candidate/src/app/(candidate)/resume/build/page.tsx**
   - Removed 15+ `[DEBUG]` console.log statements
   - Removed `#region agent log` comments
   - Kept meaningful error logging

## ⚠️ Needs Manual Review

### 1. AuthContext.tsx (admin app) - HIGH PRIORITY
**File:** `apps/admin/src/contexts/AuthContext.tsx` (599 lines)
**Issue:** Contains 50+ console.log statements with emojis (🔍, ✅, ❌, etc.)
**Recommendation:** 
- Use the existing `debug-logger.ts` utility
- Or wrap in `if (process.env.NODE_ENV === 'development')` conditionals
- Keep error logs, remove status/flow debug logs

### 2. TODO Comments to Address
| File | Line | TODO |
|------|------|------|
| `apps/admin/src/app/api/agencies/remove-recruiter/route.ts` | 75 | Log removal action in audit log |
| `apps/admin/src/app/api/cron/cleanup-old-recordings/route.ts` | 146 | Send email notification |
| `apps/admin/src/app/api/analytics/route.ts` | 235 | Implement monthly trend |
| `apps/candidate/src/app/api/candidate/onboarding/documents/route.ts` | 103 | Trigger Google Vision processing |
| `apps/candidate/src/app/api/contracts/[applicationId]/route.ts` | 230 | Implement employer signature |
| `apps/candidate/src/app/api/notifications/read-all/route.ts` | 36 | Consider notification_reads junction table |
| `apps/candidate/src/app/api/onboarding/initialize/route.ts` | 118 | Send email notification |
| `apps/candidate/src/components/candidate/OnboardingWizard.tsx` | 163 | Upload files to Google Vision |
| `apps/recruiter/src/app/api/v1/video/recordings/[recording_id]/route.ts` | 239 | Trigger async transcription job |
| `apps/recruiter/src/app/api/v1/analytics/route.ts` | 181 | Add source tracking to applications |
| `apps/recruiter/src/app/api/recruiter/interviews/[id]/respond/route.ts` | 263 | Notify client via email |
| `apps/recruiter/src/app/api/client/interviews/request/route.ts` | 220 | Send email notification |
| `apps/recruiter/src/app/page.tsx` | 1009 | Check actual completion status |
| `apps/recruiter/src/app/page.tsx` | 1027 | Track if user has visited talent page |
| `apps/web/src/components/profile/ProfilePageClient.tsx` | 814 | Leaderboards feature not implemented |

### 3. Hardcoded Emails (Consider Environment Variables)
| File | Email | Purpose |
|------|-------|---------|
| `apps/admin/src/app/outbound/campaigns/create/page.tsx` | `team@bpoc.com` | Default from email |
| `apps/admin/src/app/api/outbound/campaigns/route.ts` | `noreply@bpoc.com` | Fallback from email |
| Multiple `email.ts` files | `noreply@bpoc.io` | Email sender |

**Note:** Most of these are reasonable defaults for BPOC internal tools.

### 4. Legacy ShoreAgents References
Files containing `shoreagents.com` emails or references:
- `apps/web/src/app/cookie-policy/page.tsx`
- `apps/web/src/app/privacy-policy/page.tsx`
- `apps/web/src/app/terms-and-conditions/page.tsx`
- `apps/web/src/app/data-security/page.tsx`
- `apps/web/src/app/contact-support/page.tsx`
- `apps/web/src/lib/shoreagents-db.ts`

**Recommendation:** Verify if these should reference BPOC.io instead.

### 5. Empty Catch Blocks - ACCEPTABLE
The empty catches found are actually intentional patterns:
- `.catch(() => ({}))` - Safe JSON parsing when body might be empty
- `try { await browser.close() } catch {}` - Cleanup that shouldn't fail the flow
- `try { JSON.parse(...) } catch {}` - Fallback parsing

These are NOT code smells in this context.

## 📊 Console Log Distribution

| App | Debug Logs | Error Logs | Total |
|-----|------------|------------|-------|
| admin | ~70 | ~15 | ~85 |
| candidate | ~20 (fixed) | ~10 | ~30 |
| recruiter | ~15 | ~10 | ~25 |
| web | ~10 | ~8 | ~18 |

## 🔄 Patterns Found (No Issues)

### Consistent Patterns ✅
- All apps use async/await consistently (no .then() mixing)
- File naming follows kebab-case convention
- Component naming follows PascalCase
- API routes properly wrapped in try/catch

### Duplicate Code (Low Priority)
- `email.ts` exists in all 4 apps with nearly identical code
- `profile-card.tsx` duplicated across admin/recruiter/web
- Consider moving to a shared package

## Next Steps

1. **Immediate:** Clean up AuthContext.tsx debug logs (biggest impact)
2. **Short-term:** Address TODO comments related to email notifications
3. **Medium-term:** Create shared package for duplicate utilities
4. **Long-term:** Implement features marked as TODO (Vision API, leaderboards, etc.)
