# 🚀 BPOC Carpet Bomb Lead System

## Overview

Complete outbound lead generation system with:
- ✅ **23,132 clean leads** ready to email
- ✅ Full conversion funnel tracking (Email → Visit → Signup)
- ✅ UTM link tracking for attribution
- ✅ Duplicate prevention
- ✅ Campaign management
- ✅ Competition/referral support

---

## 📊 What You Have

### Database Tables Created:

1. **`carpet_bomb_leads`** - Main lead database (23K+ leads ready)
   - Email, name, phone, salary expectations
   - Lifecycle tracking: contacted, visited, signed_up
   - UTM attribution
   - Email engagement metrics

2. **`carpet_bomb_campaigns`** - Campaign manager
   - Email campaigns
   - Competitions (monthly draws for ₱1000)
   - Referral programs
   - Performance tracking

3. **`carpet_bomb_lead_campaigns`** - Junction table
   - Which leads are in which campaigns
   - Entry numbers for competitions
   - Conversion tracking per campaign

4. **`carpet_bomb_link_clicks`** - Detailed click tracking
   - Every link click tracked
   - IP, user agent, referrer
   - Full UTM attribution chain

---

## 🎯 Conversion Funnel Tracking

### How It Works:

```
23,132 Leads
    ↓
[Email Sent] → been_contacted = true, contact_count++
    ↓
[Link Clicked] → UTM tracked in carpet_bomb_link_clicks
    ↓
[Site Visited] → visited_site = true, visit_count++, UTM params saved
    ↓
[User Signup] → signed_up = true, linked to candidates table
```

### What Gets Tracked:

- **Email Level:** Sent, opened, clicked
- **Visit Level:** UTM source, medium, campaign, content
- **Conversion Level:** Which campaign drove the signup
- **Attribution:** You'll know EXACTLY which email converted

---

## 🔗 UTM Link Tracking

### Every Email Link Gets Tracked:

Example email link:
```
Original: https://bpoc.com/signup
Tracked:  https://bpoc.com/signup?utm_source=email&utm_medium=campaign&utm_campaign=migration_wave_1&utm_content=cta_button
```

### What This Does:

1. User clicks link in email
2. UTM params stored in `carpet_bomb_leads.utm_*` fields
3. Click logged in `carpet_bomb_link_clicks` table
4. If they sign up, you know which campaign converted them

### Automatic Tracking:

All links in email templates automatically get UTM params:
- `/signup` links → Campaign attribution
- `/login` links → Re-engagement tracking
- `/jobs` links → Browse behavior

---

## 🎰 Competition System (Example Use Case)

### Monthly ₱1000 Draw:

```javascript
// Create competition campaign
const campaign = {
  name: "January 2026 Signup Draw",
  type: "competition",
  has_prize: true,
  prize_amount: 1000,
  prize_currency: "PHP"
};

// Each lead gets random entry number (1-100000)
// At month end, draw random number
// Winner automatically tracked in campaign.winner_lead_id
```

**Why This Works:**
- Creates urgency to sign up
- Gives value even before they get a job
- Tracks ROI (₱1000 prize = how many signups?)

---

## 📥 Setup Instructions

### Step 1: Run Migration

Go to Supabase Dashboard → SQL Editor:

```sql
-- Paste contents of:
supabase/migrations/20260123_create_carpet_bomb_leads.sql
```

This creates all 4 tables with indexes and triggers.

### Step 2: Import Your 23K Leads

```bash
# Make sure .env.local has these:
# NEXT_PUBLIC_SUPABASE_URL=your_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_key

node scripts/import-master-csv-to-carpet-bomb.js
```

This imports all 23,132 leads from MASTER_CANDIDATE_DATABASE.csv

### Step 3: Send First Campaign

1. Go to `/admin/outbound/campaigns/create`
2. Name: "Migration Wave 1"
3. Select template: Migration
4. Target: All non-registered leads
5. Click "Send Campaign Now"

**What Happens:**
- Emails sent to all 23K leads
- Each email has UTM tracking
- When they click → tracked
- When they visit → tracked
- When they sign up → converted!

---

## 📈 Tracking Performance

### View Stats: `/admin/carpet-bomb`

You'll see:
- Total leads: 23,132
- Contacted: X%
- Visited site: X%
- Signed up: X%
- **Conversion funnel visualization**

### Source Attribution:

Know which leads convert best:
- ShoreAgents: 16,667 leads
- Jobs360: 2,017 leads
- ClickUp: 4,448 leads

Track which source has highest conversion rate!

---

## 🎯 Campaign Ideas

### 1. Migration Email (NOW)
- **Subject:** "🎉 Your BPOC Account is Ready"
- **CTA:** Sign up and browse 1000+ jobs
- **UTM Campaign:** `migration_wave_1`

### 2. Follow-Up (3 Days Later)
- **Target:** Visited but didn't sign up
- **Subject:** "⏰ Don't Miss Out - You're Almost There"
- **UTM Campaign:** `migration_followup`

### 3. Monthly Job Alert
- **Target:** Signed up users
- **Subject:** "🎯 50 New Jobs Match Your Profile"
- **UTM Campaign:** `job_alert_jan_2026`

### 4. Monthly Competition
- **Target:** Not signed up yet
- **Subject:** "💰 Win ₱1000 - Sign Up This Month"
- **Prize:** ₱1000 random draw
- **UTM Campaign:** `competition_jan_2026`

---

## 🔍 Advanced: Duplicate Prevention

### On CSV Import:

```typescript
// Checks email before inserting
const existing = await supabase
  .from('carpet_bomb_leads')
  .select('id')
  .eq('email', newEmail)
  .single();

if (existing) {
  // Skip or update existing
} else {
  // Insert new lead
}
```

**Result:** Never have duplicates, always fresh data.

---

## 🎨 Future Relationships

### You Can Add:

```sql
-- Referral tracking
ALTER TABLE carpet_bomb_leads
  ADD COLUMN referred_by_lead_id UUID REFERENCES carpet_bomb_leads(id);

-- Interview status
ALTER TABLE carpet_bomb_leads
  ADD COLUMN interview_scheduled BOOLEAN DEFAULT FALSE;

-- Custom segments
ALTER TABLE carpet_bomb_leads
  ADD COLUMN segment VARCHAR(50); -- 'hot', 'warm', 'cold'
```

**Why:** Build on this foundation for any lead-based feature.

---

## 💰 ROI Calculation

### Example:

- 23,132 leads
- 5% conversion rate = 1,156 signups
- Each signup worth ₱500 lifetime value
- **Total Value: ₱578,000**

**Cost:**
- Resend: ₱1,000/month (50K emails)
- Competition prizes: ₱1,000/month
- **Total Cost: ₱2,000/month**

**ROI: 28,800%** 🚀

---

## 🚨 Important Notes

1. **Run migration FIRST** before importing CSV
2. **Set SUPABASE_SERVICE_ROLE_KEY** in .env.local for import
3. **Test with 100 leads** before sending to all 23K
4. **Monitor unsubscribes** - keep it under 1%
5. **Check spam score** - use Mail Tester before mass send

---

## 📞 Next Steps

1. ✅ Run migration SQL
2. ✅ Import 23K leads
3. ✅ Send test campaign (100 leads)
4. ✅ Check tracking works
5. 🚀 **CARPET BOMB ALL 23,132 LEADS**

---

## 🎯 You Now Have:

- ✅ 23,132 clean leads ready to email
- ✅ Full conversion tracking
- ✅ UTM attribution
- ✅ Campaign management
- ✅ Competition system
- ✅ Duplicate prevention
- ✅ Relationship foundation

**This is your lead generation machine. Use it wisely.** 🚀
