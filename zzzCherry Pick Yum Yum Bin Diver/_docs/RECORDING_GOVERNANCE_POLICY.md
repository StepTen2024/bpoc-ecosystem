# Video Recording Governance Policy

## Overview

This document defines the governance policy for video call recordings and transcripts across the BPOC platform, including retention, deletion, privacy, and access control.

---

## 1. Recording Creation & Storage

### 1.1 When Recordings are Created
- **Pre-screen calls**: Recruiter enables recording (optional)
- **Client interviews**: Client or recruiter enables recording (optional)
- **Default**: Recording is OFF unless explicitly enabled

### 1.2 Storage
- Recordings stored in Supabase Storage (or Daily.co cloud)
- Encrypted at rest and in transit
- Stored with metadata: date, participants, duration, file size
- Associated with `video_call_rooms` table

### 1.3 Consent
- **Pre-call**: All participants notified if recording is enabled
- **During call**: Visual indicator shows recording is active
- **Post-call**: Participants can request access to their recordings

---

## 2. Access Control

### 2.1 Who Can View Recordings

| User Type | Access |
|-----------|--------|
| **Recruiter** | All recordings for their agency |
| **Client** | Only recordings shared with them (share_with_client = TRUE) |
| **Candidate** | Only recordings shared with them (share_with_candidate = TRUE) |
| **Admin** | All recordings across all agencies |
| **External Participants** | No access unless explicitly shared |

### 2.2 Sharing Controls
- **Per-call sharing**: Recruiter controls `share_with_client` and `share_with_candidate` toggles
- **Default**: Recordings are NOT shared (FALSE)
- **Revocation**: Toggling share to FALSE immediately hides recording from that user type
- **Access tokens**: Daily.co tokens are regenerated when sharing changes

---

## 3. Retention Policy

### 3.1 Default Retention Periods

| Agency Tier | Default Retention | Max Retention |
|-------------|------------------|---------------|
| **Standard** | 90 days | 180 days |
| **Enterprise** | 180 days | 365 days |

### 3.2 Customization
- Agencies can set custom retention via agency settings
- Must be within tier limits
- Cannot be retroactively extended for existing recordings

### 3.3 Grace Period Before Deletion
- 7-day grace period after retention expiry
- Agency admin notified when recordings marked for deletion
- Warning notification 7 days before permanent deletion

---

## 4. Deletion Policy

### 4.1 Who Can Delete Recordings

| Action | Recruiter | Client | Candidate | Admin |
|--------|-----------|--------|-----------|-------|
| **Soft Delete** (mark as deleted, keep metadata) | ✅ Yes (own agency) | ❌ No | ❌ No | ✅ Yes (all) |
| **Hard Delete** (permanent, GDPR) | ❌ No | ❌ No | ❌ No | ✅ Yes (with audit) |

### 4.2 Deletion Process

**Manual Deletion (Recruiter):**
1. Recruiter selects recording to delete
2. Confirmation prompt: "This cannot be undone"
3. Recording soft-deleted (marked `deleted_at`, URLs nullified)
4. Metadata retained for audit trail
5. File removed from storage

**Automatic Deletion (Retention Policy):**
1. Cron job identifies recordings older than retention period
2. Recordings marked for deletion (`marked_for_deletion = TRUE`)
3. 7-day grace period starts
4. Agency admin notified
5. After 7 days, recording permanently deleted
6. Metadata soft-deleted (URLs nullified, `deleted_at` set)

**GDPR Deletion (Admin):**
1. Candidate requests data deletion (GDPR)
2. Admin reviews request
3. Hard delete all recordings featuring candidate
4. Audit log entry created
5. Confirmation sent to candidate

### 4.3 Cannot Be Deleted If:
- Currently being used in active investigation
- Subject to legal hold
- Part of ongoing dispute/litigation

---

## 5. Privacy & Compliance

### 5.1 Data Subject Rights (GDPR/CCPA)
- **Right to Access**: Candidates can request all recordings they appear in
- **Right to Delete**: Candidates can request deletion of recordings
- **Right to Portability**: Candidates can download recordings shared with them
- **Right to Rectification**: Incorrect metadata can be corrected

### 5.2 Compliance Requirements
- All recordings include privacy notice
- Consent captured before recording starts
- Audit log for all access, sharing, and deletion events
- Data Processing Agreement (DPA) with storage provider

---

## 6. Transcript Governance

### 6.1 Transcript Creation
- Generated automatically from recordings (if enabled)
- AI-powered transcription via Daily.co or Whisper
- Stored separately in `video_call_transcripts` table
- Includes speaker identification

### 6.2 Transcript Access
- Same access rules as recordings
- Shared independently: `share_with_client`, `share_with_candidate`
- Can be shared without sharing recording

### 6.3 Transcript Retention
- Same retention period as parent recording
- Deleted when recording is deleted
- Can be deleted independently if needed

---

## 7. Audit Trail

### 7.1 Events to Log

| Event | Details Logged |
|-------|----------------|
| Recording created | Who enabled, when, participants |
| Recording viewed | Who viewed, when, duration |
| Recording shared | Who shared, with whom, when |
| Share revoked | Who revoked, when |
| Recording deleted | Who deleted, when, reason |
| Recording downloaded | Who downloaded, when, file size |
| Retention policy changed | Old value, new value, who changed |

### 7.2 Audit Log Retention
- Audit logs retained for 7 years (compliance)
- Cannot be deleted except by admin with justification
- Encrypted and immutable

---

## 8. Implementation Details

### 8.1 Database Schema

```sql
-- Recordings table
CREATE TABLE video_call_recordings (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES video_call_rooms(id),
  recording_url TEXT,
  download_url TEXT,
  storage_path TEXT,
  storage_provider VARCHAR(50), -- 'supabase', 'daily', 's3'
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  status VARCHAR(20), -- 'processing', 'ready', 'failed', 'deleted'

  -- Sharing
  shared_with_candidate BOOLEAN DEFAULT FALSE,
  shared_with_client BOOLEAN DEFAULT FALSE,

  -- Deletion tracking
  marked_for_deletion BOOLEAN DEFAULT FALSE,
  marked_for_deletion_at TIMESTAMP,
  deletion_scheduled_date DATE,
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id),
  deletion_reason TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### 8.2 API Endpoints

- `GET /api/recruiter/video/recordings` - List recordings
- `GET /api/recruiter/video/recordings/:id` - Get recording details
- `PATCH /api/recruiter/video/recordings/:id/share` - Update sharing
- `DELETE /api/recruiter/video/recordings/:id` - Soft delete recording
- `POST /api/admin/recordings/:id/hard-delete` - Permanent delete (GDPR)

### 8.3 Cron Jobs

- **Daily (2 AM)**: `/api/cron/cleanup-old-recordings`
  - Find recordings past retention period
  - Mark for deletion
  - Notify agency admins
  - Delete recordings past grace period

---

## 9. Best Practices

### 9.1 For Recruiters
- ✅ Only enable recording when necessary
- ✅ Inform candidates before recording starts
- ✅ Share recordings promptly after review
- ✅ Delete recordings that are no longer needed
- ❌ Don't keep recordings indefinitely
- ❌ Don't share recordings outside platform

### 9.2 For Agencies
- ✅ Set appropriate retention policies for your needs
- ✅ Regularly review and clean up old recordings
- ✅ Train recruiters on privacy and compliance
- ✅ Respond to GDPR requests within 30 days
- ❌ Don't set retention longer than necessary
- ❌ Don't share recordings via insecure channels

### 9.3 For Admins
- ✅ Monitor storage usage and costs
- ✅ Audit deletion logs monthly
- ✅ Handle GDPR requests promptly
- ✅ Enforce retention policies consistently
- ❌ Don't hard-delete without clear justification
- ❌ Don't access recordings without valid reason

---

## 10. Exceptions & Special Cases

### 10.1 Legal Hold
- If recording subject to legal hold, mark `legal_hold = TRUE`
- Prevents automatic deletion
- Only removable by admin with legal approval

### 10.2 Dispute Resolution
- Recordings can be retained beyond normal policy if part of dispute
- Marked with `dispute_id` reference
- Deleted 30 days after dispute resolution

### 10.3 Training & Quality Assurance
- Agencies can designate recordings for training
- Must have explicit consent from all participants
- Can be retained longer with justification

---

## Summary

This governance policy ensures:
- **Privacy**: Clear consent, limited access, right to delete
- **Compliance**: GDPR/CCPA adherence, audit trails
- **Security**: Encryption, access controls, secure deletion
- **Transparency**: Clear policies, user notifications
- **Efficiency**: Automated cleanup, manageable storage costs

**Last Updated**: 2026-01-19
**Review Cycle**: Quarterly
**Owner**: BPOC Platform Team
