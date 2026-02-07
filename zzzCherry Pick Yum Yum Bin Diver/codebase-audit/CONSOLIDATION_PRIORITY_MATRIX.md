# Consolidation Priority Matrix

| Priority | Feature | Versions | Impact | Effort | Action Needed |
|----------|---------|----------|--------|--------|---------------|
| **P0** | **Database Layers** | 3 | **CRITICAL** | **LOW** | **Delete `bpoc-db.ts` and `shoreagents-db.ts` immediately.** They are confusing and unused. |
| **P1** | **Resume System** | 2 | HIGH | MEDIUM | Audit `try-resume-builder` vs `candidate/resume`. If `try-resume-builder` is inferior, redirect to `candidate/resume` or refactor to use shared components. |
| **P2** | **HR Assistant** | 4 | MEDIUM | MEDIUM | Verify all 4 implementations use a single shared component. If they have copied logic, Refactor to `src/components/shared/assistant`. |
| **P3** | **Video API** | 1 | LOW | LOW | `src/app/api/video` vs `src/app/api/v1/video`. `v1` suggests versioning. Check if `api/video` (root) is deprecated. |

## Immediate Actions
1. `rm src/lib/bpoc-db.ts.DEPRECATED`
2. `rm src/lib/shoreagents-db.ts`
