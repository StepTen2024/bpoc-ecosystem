# 🧪 BPOC API Simulator - Testing Guide

**Last Updated:** 2026-01-26
**Status:** ✅ 75% Functional (3/4 critical endpoints working)

---

## 🚀 Quick Start - Test in 30 Seconds

### **Method 1: Browser (Recommended)** ⭐

1. **Open your browser:**
   ```
   http://localhost:3001/developer/api-simulator
   ```

2. **Navigate to tabs:**
   - **Flow Simulator** - Visual step-by-step workflow
   - **API Tester** - Test individual endpoints
   - **Webhooks** - Monitor webhook deliveries
   - **Test Data** - View created test data
   - **Docs** - API documentation

3. **Try the Flow Simulator:**
   - Click "Execute" on Step 2 (Job Creation) ✅
   - Watch it create a job successfully
   - See green checkmark for success

---

### **Method 2: Command Line (Quick)**

```bash
# Run the automated test script
./test-working-flow.sh

# Expected output:
# ✅ Client Management: WORKING
# ✅ Job Creation: WORKING
# ✅ Authentication: WORKING
```

---

### **Method 3: Node.js Tests (Detailed)**

```bash
node test-api-working-endpoints.js

# Shows detailed results for each endpoint
# Pass/fail status with JSON responses
```

---

## 📊 Current Test Results

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/v1/clients/get-or-create` | ✅ **PASSING** | Creates/finds clients |
| `GET /api/v1/clients` | ✅ **PASSING** | Lists all clients |
| `POST /api/v1/jobs/create` | ✅ **PASSING** | Creates jobs successfully |
| `POST /api/v1/applications` | ❌ **BLOCKED** | Candidate schema issue |

---

## 🎯 What Each Test Does

### **Test 1: Client Management**

```bash
# What it tests:
- ✅ API key authentication
- ✅ Client creation
- ✅ Fuzzy matching (finds existing clients)
- ✅ Response format (camelCase)

# Expected response:
{
  "clientId": "uuid-here",
  "companyId": "uuid-here",
  "name": "Test Company",
  "created": false,
  "matchedBy": "name",
  "similarity": 100,
  "message": "Existing client found (100% match)"
}
```

### **Test 2: Job Creation**

```bash
# What it tests:
- ✅ Job posting creation
- ✅ Client ID validation
- ✅ Tier enforcement (Enterprise required)
- ✅ Field normalization (work types, experience levels)

# Expected response:
{
  "success": true,
  "job": {
    "id": "uuid-here",
    "title": "Test Job",
    "slug": "test-job-abc123",
    "status": "active",
    "createdAt": "2026-01-26T..."
  },
  "message": "Job created successfully"
}
```

### **Test 3: Application Submission** ⚠️

```bash
# What it should test:
- Candidate creation
- Application submission
- Webhook triggers

# Current issue:
❌ Candidates table requires auth.users link
❌ API cannot create auth users for security
❌ Database constraint: "id" field required
```

---

## 🔍 How to Read Test Results

### **Visual Browser Testing:**

- 🟢 **Green checkmark** = API call succeeded
- 🔴 **Red X** = API call failed
- 🔵 **Blue pulse** = Currently running
- 📊 **JSON response** = Shows actual API response

### **Command Line Colors:**

- `✅` = Test passed
- `❌` = Test failed
- `Status: 200/201` = Success
- `Status: 400/401/500` = Error

---

## 📝 Manual Testing with cURL

### **1. Get Agency API Key:**

```bash
# Your test credentials:
API_KEY="bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30"
AGENCY_ID="8dc7ed68-5e76-4d23-8863-6ba190b91039"
```

### **2. Test Client Creation:**

```bash
curl -X POST http://localhost:3001/api/v1/clients/get-or-create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30" \
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "industry": "Technology"
  }' | jq
```

**Expected:** `200 OK` with client details

### **3. Test Job Creation:**

```bash
# First, get a client ID from step 2, then:
curl -X POST http://localhost:3001/api/v1/jobs/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30" \
  -d '{
    "clientId": "YOUR_CLIENT_ID_HERE",
    "title": "Senior Customer Service Rep",
    "description": "Handle VIP customer inquiries",
    "requirements": ["Excellent English", "3+ years experience"],
    "salaryMin": 30000,
    "salaryMax": 45000,
    "currency": "PHP",
    "workArrangement": "remote",
    "workType": "full_time",
    "shift": "day",
    "experienceLevel": "senior_level"
  }' | jq
```

**Expected:** `201 Created` with job details

### **4. Test Authentication:**

```bash
# Try with wrong API key:
curl -X POST http://localhost:3001/api/v1/clients/get-or-create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong_key_12345" \
  -d '{"name": "Test"}' | jq
```

**Expected:** `401 Unauthorized`

---

## 🐛 Known Issues & Workarounds

### **Issue 1: Candidate Creation Fails**

**Error:**
```json
{
  "error": "Failed to create candidate",
  "details": "null value in column 'id' violates not-null constraint"
}
```

**Root Cause:**
Candidates table requires `auth.users` UUID. API can't create auth users.

**Workaround:**
- Don't use `POST /api/v1/candidates` via API
- Candidates must register through the platform
- Agencies can search existing candidates only

### **Issue 2: Schema Cache Errors**

**Error:**
```
Could not find the 'phone' column in schema cache
```

**Fix:**
Refresh Supabase schema cache or ensure migrations are applied.

---

## ✅ Success Checklist

Use this to verify your API is working:

- [ ] Dev server running on `http://localhost:3001`
- [ ] Browser loads API Simulator page
- [ ] Flow Simulator UI shows all 10 steps
- [ ] Test agency has Enterprise tier (check `verify-api-key.js`)
- [ ] Client creation returns 200 OK
- [ ] Job creation returns 201 Created
- [ ] API responses are in camelCase format
- [ ] Authentication rejects invalid API keys
- [ ] Test scripts pass (3/4 endpoints)

---

## 🎬 Step-by-Step First Test

### **Complete Walkthrough:**

1. **Verify server is running:**
   ```bash
   curl http://localhost:3001/api/health
   # Should return 200 or 404 (endpoint may not exist)
   ```

2. **Open browser:**
   ```
   http://localhost:3001/developer/api-simulator
   ```

3. **Click "Flow Simulator" tab**

4. **Click "Execute" on Step 2: "Client/Recruiter Creates Job"**
   - Wait for response
   - Look for green checkmark ✅
   - Expand JSON response to see job details

5. **Verify in database (optional):**
   ```bash
   node verify-api-key.js
   # Confirms agency settings
   ```

6. **Run automated tests:**
   ```bash
   ./test-working-flow.sh
   # Should show: ✅ ALL WORKING ENDPOINTS PASSED!
   ```

---

## 📊 Performance Expectations

| Operation | Expected Time | Status |
|-----------|---------------|--------|
| Client creation | < 500ms | ✅ Fast |
| Job creation | < 800ms | ✅ Fast |
| List clients | < 300ms | ✅ Fast |
| Authentication | < 100ms | ✅ Fast |

---

## 🔧 Troubleshooting

### **Problem: Tests fail with "ECONNREFUSED"**

**Solution:**
```bash
# Check if server is running:
lsof -i :3001

# If not running:
npm run dev
```

### **Problem: "Invalid API key" error**

**Solution:**
```bash
# Verify API key is correct:
node verify-api-key.js

# Should show:
# ✅ API key matches!
# ✅ API Tier: enterprise
```

### **Problem: Browser shows 404**

**Solution:**
```
# Make sure you're using the correct URL:
http://localhost:3001/developer/api-simulator
                                  ^
                        Note: no "api-simulator-v1"
```

### **Problem: Tests timeout**

**Solution:**
```bash
# Increase timeout in test script
# Or check database connection in Supabase dashboard
```

---

## 📁 Test Files Reference

| File | Purpose | Usage |
|------|---------|-------|
| `test-working-flow.sh` | Quick bash test | `./test-working-flow.sh` |
| `test-api-working-endpoints.js` | Detailed Node tests | `node test-api-working-endpoints.js` |
| `verify-api-key.js` | Check agency config | `node verify-api-key.js` |
| `update-agency-tier.js` | Set tier to Enterprise | `node update-agency-tier.js` |
| `API_SIMULATOR_AUDIT_FIXES.md` | Full audit report | Read for details |

---

## 🚀 Next Steps

### **After Testing:**

1. **If tests pass:**
   - ✅ Your API is ready for integration
   - ✅ Share docs with agency partners
   - ✅ Set up production API keys

2. **To fix candidate creation:**
   - Choose Option A, B, or C (see audit report)
   - Update database schema
   - Re-test applications endpoint

3. **Before production:**
   - Add rate limiting monitoring
   - Set up webhook delivery logs
   - Create agency onboarding docs
   - Test with real agency credentials

---

## 📞 Quick Reference

**API Base URL:** `http://localhost:3001/api/v1`
**Test API Key:** `bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30`
**Test Agency:** ShoreAgents INC (Enterprise tier)
**Simulator URL:** `http://localhost:3001/developer/api-simulator`

---

## 🎯 Testing Best Practices

1. **Always test authentication first** - Ensures API key is valid
2. **Create clients before jobs** - Jobs require valid client IDs
3. **Use unique emails** - Prevents duplicate errors
4. **Check response format** - Should be camelCase
5. **Monitor webhook logs** - Verify events are triggered
6. **Clean up test data** - Delete test jobs/clients periodically

---

**Ready to test? Start here:**

```bash
# Quick test (30 seconds):
./test-working-flow.sh

# Detailed test (1 minute):
node test-api-working-endpoints.js

# Visual test (2 minutes):
# Open: http://localhost:3001/developer/api-simulator
```

---

**Questions? Check:**
- `API_SIMULATOR_AUDIT_FIXES.md` - Detailed audit results
- `/developer/api-simulator` (Docs tab) - API documentation
- Supabase logs - Database errors

**Status:** ✅ Ready for testing!
