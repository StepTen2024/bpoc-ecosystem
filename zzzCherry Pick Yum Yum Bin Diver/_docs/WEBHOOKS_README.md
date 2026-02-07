# 🔔 BPOC Webhooks System

Real-time HTTP notifications for external integrations.

**Status**: ✅ Complete - Ready for Production
**Created**: January 22, 2026

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Setup Instructions](#setup-instructions)
3. [Available Events](#available-events)
4. [Integration Guide](#integration-guide)
5. [Security](#security)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### For Agencies (Receiving Webhooks)

1. **Create a webhook endpoint** on your server:
```typescript
app.post('/api/webhooks/bpoc', async (req, res) => {
  const { event, data } = req.body;

  // Verify signature (see Security section)
  // ... verification code ...

  // Process event
  if (event === 'application.created') {
    await updateDashboard(data);
  }

  res.status(200).send('OK');
});
```

2. **Register webhook** in BPOC:
   - Go to `/recruiter/api` → Webhooks tab
   - Click "Add Webhook"
   - Enter your endpoint URL
   - Select events to subscribe
   - Save the secret!

3. **Test it**:
   - Click "Test" button in BPOC
   - Check your server logs for the test payload

---

## 🛠 Setup Instructions

### 1. Database Migration

Run this SQL in Supabase SQL Editor:

```bash
# Execute the migration
Supabase/migrations/20260122_create_webhooks_system.sql
```

Creates:
- `webhooks` table (webhook configurations)
- `webhook_deliveries` table (delivery tracking)
- Functions for event matching
- RLS policies

### 2. Environment Variables

No additional env vars needed! System uses existing:
- `SUPABASE_SERVICE_ROLE_KEY`
- Optionally: `CRON_SECRET` for webhook retry endpoint

### 3. Deploy Cron Job

Already configured in `vercel.json`:
```json
{
  "path": "/api/cron/webhook-retries",
  "schedule": "*/5 * * * *"
}
```

Processes failed webhook retries every 5 minutes.

---

## 📡 Available Events

### Application Events
- `application.*` - All application events (wildcard)
- `application.created` - New application submitted
- `application.status_changed` - Status update (applied → shortlisted → etc.)

### Interview Events
- `interview.*` - All interview events (wildcard)
- `interview.scheduled` - Interview booked
- `interview.completed` - Interview finished

### Offer Events
- `offer.*` - All offer events (wildcard)
- `offer.sent` - Offer sent to candidate
- `offer.accepted` - Candidate accepted offer
- `offer.rejected` - Candidate rejected offer

### Video Events
- `video.*` - All video events (wildcard)
- `video.recording.ready` - Recording processed and available
- `video.transcript.completed` - AI transcript ready

### Placement Events
- `placement.created` - Successful hire/placement created

---

## 🔧 Integration Guide

### Step 1: Import Helper Functions

```typescript
import {
  webhookApplicationCreated,
  webhookApplicationStatusChanged,
  webhookOfferAccepted,
  // ... other events
} from '@/lib/webhooks/events';
```

### Step 2: Call After Events

**Example: Application Created**
```typescript
// In POST /api/v1/applications/route.ts (or similar)

const application = await createApplication({ jobId, candidateId, ... });

// Get agency ID from job
const { data: job } = await supabase
  .from('jobs')
  .select(`
    title,
    agency_client:agency_clients!inner(
      agency_id
    )
  `)
  .eq('id', jobId)
  .single();

// Trigger webhook (async, won't block response)
webhookApplicationCreated({
  applicationId: application.id,
  jobId: jobId,
  candidateId: candidateId,
  candidateName: `${candidate.first_name} ${candidate.last_name}`,
  candidateEmail: candidate.email,
  jobTitle: job.title,
  agencyId: job.agency_client.agency_id,
}).catch(err => console.error('Webhook error:', err));

return NextResponse.json({ success: true, ... });
```

**Example: Status Changed**
```typescript
// When updating application status
const oldStatus = application.status;
await updateApplicationStatus(applicationId, 'shortlisted');

webhookApplicationStatusChanged({
  applicationId,
  jobId: application.job_id,
  candidateId: application.candidate_id,
  oldStatus: oldStatus,
  newStatus: 'shortlisted',
  agencyId: agencyId,
}).catch(err => console.error('Webhook error:', err));
```

### Step 3: Deploy and Test

1. Deploy changes
2. Register a test webhook (use webhook.site for testing)
3. Trigger the event (e.g., create an application)
4. Check webhook.site for the payload

---

## 🔒 Security

### Signature Verification (CRITICAL!)

All webhooks include `X-Webhook-Signature` header:

**Node.js Example:**
```typescript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = 'sha256=' +
    crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/api/webhooks/bpoc', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.BPOC_WEBHOOK_SECRET; // From BPOC dashboard

  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook
  const { event, data } = req.body;
  console.log('Verified webhook:', event);

  res.status(200).send('OK');
});
```

**Python Example:**
```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = 'sha256=' + hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)

@app.post('/webhooks/bpoc')
def handle_webhook(request):
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.body.decode('utf-8')
    secret = os.getenv('BPOC_WEBHOOK_SECRET')

    if not verify_webhook(payload, signature, secret):
        return 'Invalid signature', 401

    data = json.loads(payload)
    print(f"Verified webhook: {data['event']}")

    return 'OK', 200
```

---

## 🐛 Troubleshooting

### Webhook Not Received?

1. **Check webhook is active**: `/recruiter/api` → Webhooks → ensure toggle is ON
2. **Check URL is correct**: Must be publicly accessible HTTPS endpoint
3. **Check firewall**: Ensure your server accepts incoming POST requests
4. **Check logs**: View delivery history in BPOC dashboard

### Webhook Failed?

1. **View delivery logs**: `/recruiter/api` → Webhooks → click webhook → see recent deliveries
2. **Check response code**: Should return 200 OK within 10 seconds
3. **Retry logic**: System auto-retries 3 times (1min, 5min, 30min delays)
4. **Test webhook**: Click "Test" button to send test payload

### Signature Verification Fails?

1. **Use raw body**: Don't parse JSON before verifying signature
2. **Correct secret**: Check you copied the secret when creating webhook
3. **Timing attack safe**: Use `crypto.timingSafeEqual()` for comparison

---

## 📊 API Endpoints

### Manage Webhooks

```bash
# List webhooks
GET /api/recruiter/webhooks

# Create webhook
POST /api/recruiter/webhooks
{
  "url": "https://example.com/webhooks/bpoc",
  "events": ["application.*", "offer.accepted"],
  "description": "Production webhook"
}

# Get webhook details + recent deliveries
GET /api/recruiter/webhooks/:id

# Update webhook
PATCH /api/recruiter/webhooks/:id
{
  "is_active": false
}

# Delete webhook
DELETE /api/recruiter/webhooks/:id

# Send test webhook
POST /api/recruiter/webhooks/:id/test
```

---

## 🎯 Payload Examples

### Application Created
```json
{
  "event": "application.created",
  "timestamp": "2026-01-22T10:30:00Z",
  "data": {
    "applicationId": "uuid-123",
    "jobId": "uuid-456",
    "candidateId": "uuid-789",
    "candidateName": "Maria Santos",
    "candidateEmail": "maria@example.com",
    "jobTitle": "Customer Service Representative"
  }
}
```

### Interview Scheduled
```json
{
  "event": "interview.scheduled",
  "timestamp": "2026-01-22T10:30:00Z",
  "data": {
    "interviewId": "uuid-abc",
    "applicationId": "uuid-123",
    "candidateId": "uuid-789",
    "scheduledAt": "2026-01-25T14:00:00Z",
    "interviewType": "client_round_1",
    "meetingLink": "https://bpoc.daily.co/room-name"
  }
}
```

### Offer Accepted
```json
{
  "event": "offer.accepted",
  "timestamp": "2026-01-22T10:30:00Z",
  "data": {
    "offerId": "uuid-def",
    "applicationId": "uuid-123",
    "candidateId": "uuid-789",
    "acceptedAt": "2026-01-22T10:29:00Z"
  }
}
```

---

## 📚 Additional Resources

- **API Documentation**: See `/recruiter/api` page in BPOC dashboard
- **Test Webhooks**: Use https://webhook.site for testing
- **Support**: Contact dev team or create GitHub issue

---

**Questions?** Check the full API Bible at `Docs/API/BPOC_API_BIBLE.md`
