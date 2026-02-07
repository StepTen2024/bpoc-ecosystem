# Admin Setup Guide

## 1. Create Super Admin Account

### Step 1: Create Auth User in Supabase
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" (or "Invite User")
3. Email: `platform-admin@bpoc.io`
4. Password: [Set a secure password]
5. Confirm email address
6. Copy the `user_id` (looks like: `d290f1ee-6c54-4b01-90e6-d701748f0851`)

### Step 2: Insert Admin Record
Go to Supabase SQL Editor and run:

```sql
INSERT INTO admins (
  user_id,
  email,
  first_name,
  last_name,
  role,
  department,
  is_super_admin,
  is_active
) VALUES (
  'USER_ID_FROM_STEP_1',  -- Replace with actual user_id
  'platform-admin@bpoc.io',
  'Platform',
  'Administrator',
  'super_user',
  'Management',
  true,
  true
);
```

### Step 3: Login
Go to `/admin/login` and login with:
- Email: `platform-admin@bpoc.io`
- Password: [the password you set]

---

## 2. Recruiter Verification Flow

### How It Works:

#### A. Unauthorized Recruiter Signup
1. Recruiter signs up at `/recruiter/signup`
2. Answers: "Are you authorized to sign on behalf of your agency?" → **NO**
3. System sends email invitation to authorization head
4. Recruiter account created with status: `pending_authorization_head`

#### B. Authorization Head Completes Signup
1. Auth head clicks invitation link
2. Signs up at `/recruiter/signup?invite=TOKEN`
3. Gets redirected to `/recruiter/signup/documents`
4. Uploads required documents:
   - TIN Number
   - DTI Certificate
   - Business Permit
   - SEC Registration
5. Both recruiters now have status: `pending_admin_review`

#### C. Admin Verification
1. Admin logs into `/admin`
2. Goes to `/admin/recruiters` (or clicks "Recruiters" in sidebar)
3. Sees list of pending recruiters with uploaded documents
4. Reviews documents by clicking recruiter name
5. Clicks **"Verify"** button
6. System automatically:
   - Marks recruiter as `verified`
   - Marks agency documents as verified
   - Marks agency as active
   - Auto-verifies any team members that were waiting for this auth head
   - Both recruiters can now post jobs and use platform

#### D. Rejection Flow
1. Admin clicks **"Reject"** button
2. Enters rejection reason
3. Recruiter marked as `rejected`
4. Recruiter can see rejection reason on dashboard

---

## 3. Admin Pages Overview

### `/admin/recruiters`
- View all recruiters (pending, verified, rejected)
- Filter by status
- Verify/Reject pending recruiters
- Stats: Total, Pending, Verified, Rejected, Active

### `/admin/recruiters/[id]`
- View individual recruiter details
- See their agency
- View verification history

### `/admin/agencies`
- View all recruitment agencies
- See recruiter counts, job counts
- Filter and search agencies

### `/admin/agencies/[id]`
- View agency details
- **Documents tab** - View uploaded verification documents:
  - TIN Number
  - DTI Certificate
  - Business Permit
  - SEC Registration
- View all recruiters in agency
- View clients and jobs
- Reassign recruiters between agencies
- Edit agency details

---

## 4. Admin Roles (Future)

Currently implemented:
- **Super User**: Full access (created via manual SQL)

To be implemented:
- **Management**: View and edit access (not super user powers)
- **Marketing**: Marketing-related access
- **Viewers**: Read-only access

Departments can be added to organize admins.

---

## 5. Testing the Flow

### Test Scenario 1: Unauthorized Recruiter
1. Go to `/recruiter/signup`
2. Fill in agency details
3. Answer "No" to authorization question
4. Provide auth head email
5. Check email for invitation
6. Auth head signs up via invitation link
7. Auth head uploads documents
8. Login as admin at `/admin/login`
9. Go to `/admin/recruiters`
10. Click "Verify" on pending recruiter
11. Both recruiters should now be verified

### Test Scenario 2: Authorized Recruiter
1. Go to `/recruiter/signup`
2. Answer "Yes" to authorization question
3. Upload documents immediately
4. Login as admin
5. Verify the recruiter
6. Recruiter can now post jobs

---

## 6. Troubleshooting

### Recruiter shows as pending but documents uploaded
- Check `/admin/agencies/[id]` to view documents
- Ensure all 4 documents are uploaded (TIN, DTI, Business Permit, SEC)
- Verify button won't work if any document is missing

### Can't verify recruiter - "Documents incomplete"
- Agency documents must be uploaded first
- Check agency documents in `/admin/agencies/[id]`

### Recruiter can't post jobs after verification
- Check `verification_status` in database is set to `verified`
- Check `is_active` is set to `true`
- Try logging out and back in

---

## Current Status
✅ Super admin user creation (manual SQL)
✅ Recruiter verification UI (`/admin/recruiters`)
✅ Agency document viewing (`/admin/agencies/[id]`)
✅ Approve/Reject API (`/api/admin/recruiters/[id]/verify`)
✅ Feature blocking for unverified recruiters
✅ Verification status banners
✅ Email invitations for authorization heads

📋 Future:
- Admin invite system (super admin invites other admins)
- Role-based permissions
- Department-based access control
