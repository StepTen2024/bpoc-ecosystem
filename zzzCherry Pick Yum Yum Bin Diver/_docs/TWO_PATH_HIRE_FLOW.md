# Two-Path Hire Flow Documentation

## Overview

The BPOC platform supports **two distinct paths to hire** candidates. Understanding which path an application is following is critical for recruiters, candidates, and clients.

---

## Path 1: Normal Application Flow (With Recruiter Gate)

### Journey
```
Candidate Applies
  ↓
Recruiter Reviews Application
  ↓
Recruiter Pre-Screens Candidate (Optional)
  ↓
🚪 RECRUITER GATE 🚪
  ↓ (released_to_client = TRUE)
Client Views Application
  ↓
Client Requests Interview
  ↓
Interview Conducted
  ↓
Client Makes Offer
  ↓
Candidate Accepts
  ↓
Hired!
```

### Key Characteristics
- **Trigger**: Candidate applies to a job listing
- **Gatekeeper**: Recruiter controls visibility via `released_to_client` flag
- **Default**: Application is **hidden** from client until recruiter releases it
- **Pre-screening**: Recruiter may conduct pre-screen call before releasing
- **Quality Control**: Only vetted candidates reach the client
- **Timeline**: Longer due to recruiter screening step

### UI Indicators (Normal Flow)
- Badge: "Standard Application"
- Color: Blue
- Icon: 📋 (Clipboard)
- Timeline shows: Application → Screening → Released → Interview → Offer → Hire
- Application card shows: "Recruiter review pending" or "Released to client"

---

## Path 2: Direct Talent Pool (Bypass Screening)

### Journey
```
Client Browses Talent Pool
  ↓
Client Finds Candidate
  ↓
Client Requests Interview Directly
  ↓
🚀 BYPASS GATE 🚀
  ↓
Recruiter Schedules Interview
  ↓
Interview Conducted
  ↓
Client Makes Offer
  ↓
Candidate Accepts
  ↓
Hired!
```

### Key Characteristics
- **Trigger**: Client browses all active candidates in talent pool
- **Gatekeeper**: None - client has direct access to talent pool
- **Default**: All active candidates are **visible** to clients
- **Pre-screening**: Skipped - client selects based on profile alone
- **Speed**: Faster time-to-interview
- **Timeline**: Shorter overall process

### UI Indicators (Direct Path)
- Badge: "Direct Hire"
- Color: Green
- Icon: 🚀 (Rocket)
- Timeline shows: Direct Request → Interview → Offer → Hire
- Application card shows: "Client direct request"

---

## Data Model Flags

### Database Fields

```sql
-- job_applications table
CREATE TABLE job_applications (
  ...
  released_to_client BOOLEAN DEFAULT FALSE, -- Path 1: Controls visibility
  hire_path VARCHAR(20) DEFAULT 'normal',   -- 'normal' or 'direct'
  direct_hire BOOLEAN DEFAULT FALSE,         -- TRUE if Path 2
  ...
);
```

### Setting the Path

**Path 1 (Normal):**
```typescript
{
  released_to_client: false, // Initially hidden
  hire_path: 'normal',
  direct_hire: false,
}
```

**Path 2 (Direct):**
```typescript
{
  released_to_client: true,  // Automatically visible
  hire_path: 'direct',
  direct_hire: true,
}
```

---

## UI Implementation

### Application Card Component

```tsx
// components/shared/ApplicationPathBadge.tsx
import { Badge } from '@/components/ui/badge';

interface ApplicationPathBadgeProps {
  hirePath: 'normal' | 'direct';
  releasedToClient?: boolean;
}

export function ApplicationPathBadge({ hirePath, releasedToClient }: ApplicationPathBadgeProps) {
  if (hirePath === 'direct') {
    return (
      <Badge variant="success" className="flex items-center gap-1">
        <span>🚀</span>
        <span>Direct Hire</span>
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="flex items-center gap-1">
      <span>📋</span>
      <span>{releasedToClient ? 'Released to Client' : 'Under Review'}</span>
    </Badge>
  );
}
```

### Timeline Component

```tsx
// components/shared/ApplicationTimeline.tsx
export function ApplicationTimeline({ application }) {
  const steps = application.hire_path === 'direct'
    ? [
        { label: 'Direct Request', status: 'completed' },
        { label: 'Interview', status: application.status === 'interviewed' ? 'completed' : 'pending' },
        { label: 'Offer', status: application.status === 'offer_sent' ? 'completed' : 'pending' },
        { label: 'Hired', status: application.status === 'hired' ? 'completed' : 'pending' },
      ]
    : [
        { label: 'Application', status: 'completed' },
        { label: 'Screening', status: application.released_to_client ? 'completed' : 'current' },
        { label: 'Released', status: application.released_to_client ? 'completed' : 'pending' },
        { label: 'Interview', status: application.status === 'interviewed' ? 'completed' : 'pending' },
        { label: 'Offer', status: application.status === 'offer_sent' ? 'completed' : 'pending' },
        { label: 'Hired', status: application.status === 'hired' ? 'completed' : 'pending' },
      ];

  return <Timeline steps={steps} />;
}
```

---

## Analytics & Reporting

### Metrics to Track

**Path 1 (Normal):**
- Time from application to release (screening duration)
- Release rate (% of applications released vs rejected)
- Time from release to interview
- Overall time to hire
- Rejection rate at screening stage

**Path 2 (Direct):**
- Time from direct request to interview
- Direct hire conversion rate
- Client satisfaction with direct hires
- Overall time to hire (typically faster)

### Comparison Dashboard

```typescript
interface PathComparisonStats {
  normalPath: {
    totalApplications: number;
    releaseRate: number;
    averageTimeToHire: number;
    interviewToOfferRate: number;
  };
  directPath: {
    totalRequests: number;
    averageTimeToHire: number;
    interviewToOfferRate: number;
  };
}
```

---

## Best Practices

### For Recruiters

**Normal Path:**
- ✅ Review applications promptly (within 24-48 hours)
- ✅ Conduct pre-screen calls for quality candidates
- ✅ Only release candidates who meet client requirements
- ✅ Add detailed notes before releasing
- ❌ Don't release unqualified candidates to meet quotas

**Direct Path:**
- ✅ Ensure candidate profiles are complete and accurate
- ✅ Schedule interviews quickly when client requests
- ✅ Prepare candidate for direct client interaction
- ✅ Monitor direct hire success rates
- ❌ Don't skip background checks for speed

### For Clients

**When to Use Normal Path:**
- High-volume hiring
- Specific/strict requirements
- Prefer recruiter-vetted candidates
- Willing to wait for quality

**When to Use Direct Path:**
- Urgent hiring needs
- Already know the type of candidate you want
- Trust your own screening process
- Prefer speed over pre-vetting

---

## Edge Cases & Considerations

### Can a Path Change Mid-Process?
**Generally No**, but exceptions exist:
- If a direct hire fails background check, recruiter may convert to normal path
- If client requests more pre-screening on a direct hire

### What if Both Paths Lead to Same Candidate?
- **Prioritize**: Direct request takes precedence
- **Mark**: Original application as "duplicate - direct hire path"
- **Avoid**: Double-counting in analytics

### Reporting Confusion
- Always tag reports with path type
- Separate funnels for Path 1 vs Path 2
- Compare conversion rates independently

---

## Migration Guide

### Adding hire_path to Existing Applications

```sql
-- Default all existing applications to 'normal' path
UPDATE job_applications
SET hire_path = 'normal',
    direct_hire = FALSE
WHERE hire_path IS NULL;

-- Mark applications that were likely direct hires
-- (those with released_to_client = TRUE and no pre-screen)
UPDATE job_applications
SET hire_path = 'direct',
    direct_hire = TRUE
WHERE released_to_client = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM video_call_rooms
    WHERE video_call_rooms.application_id = job_applications.id
    AND call_type = 'recruiter_prescreen'
  );
```

---

## Summary

| Aspect | Path 1: Normal | Path 2: Direct |
|--------|----------------|----------------|
| **Who Initiates** | Candidate applies | Client requests |
| **Visibility** | Hidden until released | Immediately visible |
| **Pre-screening** | Yes (optional) | No (skipped) |
| **Speed** | Slower (3-7 days) | Faster (1-3 days) |
| **Quality Control** | High (recruiter vetted) | Medium (client vets) |
| **Use Case** | Volume hiring, strict reqs | Urgent, known candidate type |

**Key Takeaway**: Both paths are valid and serve different needs. Clear UI signposting ensures all stakeholders know which path an application is following.

**Last Updated**: 2026-01-19
**Owner**: BPOC Platform Team
