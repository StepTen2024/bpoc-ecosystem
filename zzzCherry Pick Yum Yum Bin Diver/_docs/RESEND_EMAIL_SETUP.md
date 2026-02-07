# Resend Email Setup Instructions

## Problem
Emails are currently blocked because Resend is in sandbox mode. Emails can only be sent to `stephen@stepten.io` until the `bpoc.io` domain is verified.

## Current Status
- ✅ Resend account created
- ✅ `bpoc.io` domain added to Resend
- ❌ DNS records NOT configured (domain not verified)
- ❌ Emails fail to send to any address except stephen@stepten.io

## What Needs To Be Done

### Step 1: Add DNS Records for bpoc.io

You need to add the following DNS records to wherever `bpoc.io` is hosted (GoDaddy, Cloudflare, Route53, Namecheap, etc.)

#### Record 1: DKIM (Domain Verification) - REQUIRED
```
Type:     TXT
Host:     resend._domainkey
Value:    p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDW1KkdBLj16YbS8zyawESjhfcEI27bXhHho2YhRYULsLgamZtmy05g0iTXZKqkc6S+f1Ir0V1F5QQvx9aWSdvkxz7NTWRLELB19C4XS+Ff9Ey4yNrGE1A6Yh/5p4RS0uewc1CQ4uIUDygBdJm0k0I7+Eyp+v7LtDjiZX56w+QOtwIDAQAB
TTL:      Auto (or 3600)
```

**Note:** Some DNS providers require you to enter just `resend._domainkey` (without the domain), others need the full `resend._domainkey.bpoc.io`. Check your provider's documentation.

#### Record 2: SPF (MX Record) - REQUIRED
```
Type:     MX
Host:     send
Value:    feedback-smtp.ap-northeast-1.amazonses.com
Priority: 10
TTL:      Auto (or 3600)
```

#### Record 3: SPF (TXT Record) - REQUIRED
```
Type:     TXT
Host:     send
Value:    v=spf1 include:amazonses.com ~all
TTL:      Auto (or 3600)
```

#### Record 4: DMARC - RECOMMENDED
```
Type:     TXT
Host:     _dmarc
Value:    v=DMARC1; p=none;
TTL:      Auto (or 3600)
```

---

### Step 2: Wait for DNS Propagation

After adding DNS records:
- DNS propagation can take **5 minutes to 24 hours** (usually 15-30 minutes)
- Go back to Resend dashboard: https://resend.com/domains
- Click on `bpoc.io` domain
- Wait for green checkmarks to appear on all DNS records

---

### Step 3: Update Email "From" Address (Code Change)

Once DNS is verified, update the code to use the verified domain.

**File:** `src/lib/email.ts`

**Find this line (around line 46):**
```typescript
from: from || 'BPOC Platform <onboarding@resend.dev>',
```

**Change to:**
```typescript
from: from || 'BPOC Platform <noreply@bpoc.io>',
```

**Save the file and commit:**
```bash
git add src/lib/email.ts
git commit -m "fix: Update email from address to verified bpoc.io domain"
git push
```

---

### Step 4: Test Email Sending

After DNS is verified and code is updated, test the invitation email:

```bash
npm run test-email stephena@shoreagents.com
```

Expected output:
```
✅ Email sent successfully!
Email ID: abc123...
📬 Check stephena@shoreagents.com for the test email
```

---

## How to Add DNS Records (Provider-Specific)

### Cloudflare
1. Go to https://dash.cloudflare.com
2. Select `bpoc.io` domain
3. Click **DNS** in the left menu
4. Click **Add record** for each DNS record above
5. Save each record

### GoDaddy
1. Go to https://dcc.godaddy.com/manage/
2. Find `bpoc.io` and click **DNS**
3. Scroll to **Records** section
4. Click **ADD** for each DNS record above
5. Save

### Namecheap
1. Go to https://ap.www.namecheap.com/domains/list/
2. Find `bpoc.io` and click **Manage**
3. Go to **Advanced DNS** tab
4. Click **Add New Record** for each DNS record above
5. Save

### AWS Route53
1. Go to Route53 Console
2. Select `bpoc.io` hosted zone
3. Click **Create Record** for each DNS record above
4. Save

---

## Verification Checklist

After adding DNS records, verify:

- [ ] DKIM TXT record added with correct value
- [ ] MX record added for `send.bpoc.io` pointing to Amazon SES
- [ ] SPF TXT record added for `send.bpoc.io`
- [ ] DMARC TXT record added (optional)
- [ ] Wait 15-30 minutes for propagation
- [ ] Check Resend dashboard - all records show green checkmarks
- [ ] Update `src/lib/email.ts` to use `noreply@bpoc.io`
- [ ] Test email sending with `npm run test-email`
- [ ] Confirm emails arrive at recipient addresses

---

## Common Issues

### Issue: DNS records not showing as verified after 1 hour
**Solution:**
- Check DNS records with: `dig TXT resend._domainkey.bpoc.io +short`
- Ensure the TXT record value is exactly as shown (no extra spaces)
- Some providers add quotes automatically - don't add them yourself

### Issue: MX record priority not set
**Solution:**
- Ensure priority is set to `10` for the MX record
- Some providers call this "Priority", others call it "Preference"

### Issue: Emails still not sending after DNS verified
**Solution:**
- Ensure you updated `src/lib/email.ts` to use `noreply@bpoc.io`
- Restart the dev server: `npm run dev`
- Check Resend logs: https://resend.com/logs

---

## Support

If you encounter issues:
1. Check Resend documentation: https://resend.com/docs/dashboard/domains/introduction
2. Check DNS propagation: https://dnschecker.org/#TXT/resend._domainkey.bpoc.io
3. Contact Resend support: support@resend.com

---

## Current Email Functionality

Once DNS is verified, the following emails will work:

1. **Team Invitation Emails** - When non-authorized recruiter signs up
2. **Job Approval Emails** - When admin approves jobs
3. **Counter Offer Emails** - When candidates counter offers
4. **Interview Reminder Emails** - Interview notifications
5. **Contract Ready Emails** - When contracts are ready to sign
6. **Application Status Emails** - Application updates

All emails will be sent from: `BPOC Platform <noreply@bpoc.io>`

---

**Last Updated:** 2026-01-28
