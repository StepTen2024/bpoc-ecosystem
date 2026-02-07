# Dead Code Catalog

The following files and components have been identified as unused, orphaned, or explicitly deprecated.

## 1. Dead/Deprecated Utilities
| File Path | Status | Evidence | Action |
|-----------|--------|----------|--------|
| `src/lib/bpoc-db.ts.DEPRECATED` | DEAD | Suffix explicitly states deprecated. No usages found in code. | **DELETE** |
| `src/lib/shoreagents-db.ts` | ZOMBIE | No imports found in codebase (orphan). Last modified in initial commit. | **DELETE** |

## 2. Potential Zombie APIs
| Route | Status | Evidence | Action |
|-------|--------|----------|--------|
| `src/app/api/anon/*` | UNCERTAIN | `anon` routes often accumulate rot. Check if "Claim Profile" flow still uses these. | **REVIEW** |

## 3. Orphaned Components
(Requires deep AST analysis to be 100% sure, but here are suspects)
- `src/app/resume-debug` (Likely dev testing tool)
- `src/app/try-resume-builder` (If marketing strategy changed)

## 4. Unused Database Tables
(Based on `database.types.ts` vs Code References)
- `interview_requests` (Referenced only in dead `shoreagents-db.ts`)
- `job_acceptances` (Referenced only in dead `shoreagents-db.ts`)

These tables might exist in Supabase but are no longer accessed by the application code.
