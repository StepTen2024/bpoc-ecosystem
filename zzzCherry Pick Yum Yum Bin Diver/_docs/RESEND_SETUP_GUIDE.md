# 📧 Resend Email Setup Guide for BPOC

## Current Status

✅ **What's Done:**
- Resend API key added to `.env.local`
- 23,132 leads ready in `carpet_bomb_leads` table
- Email templates configured
- Campaign system built
- Default "from" email: `team@bpoc.com`

❌ **What You MUST Do Before Sending:**
1. Verify your domain in Resend
2. Add DNS records
3. Send test email
4. (Optional) Set up reply forwarding

---

## Step 1: Verify Your Domain in Resend

### Go to Resend Dashboard:
👉 https://resend.com/domains

### Add Your Domain:

1. Click **"Add Domain"**
2. Enter: `bpoc.com`
   - OR use subdomain: `mail.bpoc.com` (recommended for better organization)
3. Click **"Add"**

### What Happens:
- Resend will generate 3 DNS records for you
- You'll need to add these to your domain registrar

---

## Step 2: Add DNS Records

Resend will show you records like this (example):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Record 1: DKIM (Email Authentication)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:  TXT
Name:  resend._domainkey.bpoc.com
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (long string)
TTL:   3600

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Record 2: SPF (Sender Policy Framework)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:  TXT
Name:  bpoc.com  (or just @)
Value: v=spf1 include:amazonses.com ~all
TTL:   3600

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Record 3: MX (Bounce Handling - Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:     MX
Name:     bpoc.com  (or just @)
Value:    feedback-smtp.us-east-1.amazonses.com
Priority: 10
TTL:      3600
```

### Where to Add DNS Records:

**If using GoDaddy:**
1. Go to GoDaddy → My Products → DNS
2. Click "Add" for each record
3. Copy/paste Type, Name, Value from Resend

**If using Cloudflare:**
1. Go to Cloudflare → DNS
2. Click "Add Record"
3. Copy/paste from Resend

**If using Namecheap:**
1. Go to Domain List → Manage → Advanced DNS
2. Add new records

---

## Step 3: Wait for Verification

- **Time:** Usually 5-30 minutes
- **Check:** Go back to Resend → Domains
- **Look for:** Green ✅ checkmark next to `bpoc.com`
- **Status:** Should say "Verified"

If it's not verified after 1 hour:
- Double-check DNS records (no typos)
- DNS can take up to 48 hours (rare)
- Contact Resend support

---

## Step 4: Send Test Email

**Once verified, test it:**

```javascript
// Go to Resend Dashboard → API Keys → Test
// Or use this in your browser console:

fetch('/api/test-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'YOUR_PERSONAL_EMAIL@gmail.com',
    subject: 'BPOC Test Email',
    from: 'team@bpoc.com'
  })
})
```

**Check:**
- ✅ Email arrives in inbox (not spam)
- ✅ Shows "from team@bpoc.com" (not "via resend.dev")
- ✅ No warning banners

---

## Step 5: Configure Reply Handling (Optional)

### Option A: Forward Replies to Your Email

**In your domain provider, add email forwarding:**
- `team@bpoc.com` → forwards to `stephen@youremail.com`
- Now you'll get replies to your personal inbox

### Option B: Use Resend Webhooks

**Set up webhook in Resend:**
- URL: `https://bpoc.com/api/webhooks/resend`
- Events: `email.bounced`, `email.complained`
- Automatically marks leads as bounced/unsubscribed

---

## Email Architecture Explained

```
┌─────────────────────────────────────────────────┐
│  You: Create campaign in BPOC admin panel      │
│  • Subject: "Your BPOC account is ready"       │
│  • From: team@bpoc.com                         │
│  • To: 23,132 leads                            │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  BPOC Backend: Batch sending                    │
│  • 50 emails per batch                          │
│  • 5 second delay between batches              │
│  • ~463 batches total                           │
│  • ~40 minutes to send all                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Resend API: Email delivery                     │
│  • Validates emails                             │
│  • Sends via Amazon SES                         │
│  • Tracks opens/clicks                          │
│  • Handles bounces                              │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  Recipient Inbox: Gmail, Outlook, etc.          │
│  • Sees "from team@bpoc.com"                    │
│  • Can reply (goes to you if forwarded)         │
│  • UTM tracking on all links                    │
└─────────────────────────────────────────────────┘
```

---

## Pricing Breakdown

**Resend Free Tier:**
- 3,000 emails/month free
- ❌ **You have 23K leads - NOT ENOUGH**

**Resend Pro ($20/month):**
- 50,000 emails/month
- ✅ **PERFECT for your 23K leads**
- Track opens, clicks, bounces
- Webhooks included

**Your Cost:**
- First campaign: 23,132 emails
- Cost: $20/month
- **Cost per email: $0.0009** (less than 1 cent!)
- ROI: If 5% convert = 1,156 signups (worth ₱500K+)

---

## Domain vs No Domain

### ❌ Without Domain Verification:

**Can only send from:**
- `onboarding@resend.dev`

**Limits:**
- 100 emails/day max
- Low deliverability (goes to spam)
- Not professional
- Recipients see "via resend.dev"

**Result:** ❌ Can't send to 23K leads

### ✅ With Domain Verified:

**Can send from:**
- `team@bpoc.com`
- `jobs@bpoc.com`
- `hello@bpoc.com`
- `anything@bpoc.com`

**Benefits:**
- 50,000 emails/month
- High deliverability (inbox, not spam)
- Professional
- Recipients see "from team@bpoc.com"

**Result:** ✅ Ready to carpet bomb!

---

## Common Questions

### Q: Do I need to create email accounts?

**A: NO!** Resend handles sending. You just prove you own the domain via DNS.

### Q: What if I don't have access to DNS?

**A: You need it.** Ask your domain admin or whoever manages `bpoc.com`.

### Q: Can I use a subdomain?

**A: YES!** Use `mail.bpoc.com` - keeps email separate from main site. Still professional.

### Q: What about warmup?

**A: Not needed.** Resend uses shared Amazon SES infrastructure already "warmed up".

### Q: Will 23K emails get flagged as spam?

**A:**
- With verified domain: NO (if content is good)
- Without domain: YES (100%)
- Pro tip: Send 1,000 test batch first

### Q: What "from" email should I use?

**A: Recommended:**
1. `team@bpoc.com` (professional, friendly)
2. `jobs@bpoc.com` (contextual, relevant)
3. `hello@bpoc.com` (welcoming)

**Avoid:**
- `noreply@bpoc.com` (bad deliverability)
- `admin@bpoc.com` (too generic)

---

## Testing Checklist

Before sending to 23K leads, test with 10 emails:

- [ ] Domain verified in Resend (green ✅)
- [ ] DNS records added and propagated
- [ ] Send test email from `team@bpoc.com` to your Gmail
- [ ] Email arrives in inbox (not spam)
- [ ] No "via resend.dev" banner
- [ ] Links work and have UTM parameters
- [ ] Unsubscribe link works
- [ ] Reply goes to you (if forwarding set up)

---

## Ready to Send?

**Once domain is verified:**

1. Go to `/admin/outbound/campaigns/create`
2. Name: "Migration Wave 1"
3. From: `team@bpoc.com`
4. Subject: "🎉 Your BPOC Account is Ready"
5. Template: Migration
6. Target: All 23,132 leads
7. Click **"Send Campaign Now"**

**What happens:**
- 463 batches sent over ~40 minutes
- Every email tracked
- Opens/clicks monitored
- Conversions linked to candidates table

---

## Next Steps

1. ✅ Add DNS records NOW
2. ⏳ Wait for verification (5-30 min)
3. ✅ Send test email
4. ✅ Send to 10-100 leads (pilot)
5. ✅ Check deliverability
6. 🚀 **CARPET BOMB ALL 23,132 LEADS**

---

**Questions? Check Resend docs:** https://resend.com/docs
