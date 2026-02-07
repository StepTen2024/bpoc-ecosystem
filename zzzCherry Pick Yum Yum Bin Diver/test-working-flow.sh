#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing BPOC API Working Flow${NC}\n"

API_KEY="bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30"
BASE_URL="http://localhost:3001"

# Test 1: Get or Create Client
echo -e "${BLUE}1️⃣  Testing Client Creation...${NC}"
CLIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/clients/get-or-create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"name":"Test Company","email":"test@company.com"}')

CLIENT_ID=$(echo $CLIENT_RESPONSE | grep -o '"clientId":"[^"]*' | cut -d'"' -f4)

if [ -n "$CLIENT_ID" ]; then
  echo -e "${GREEN}✅ SUCCESS - Client ID: $CLIENT_ID${NC}\n"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "$CLIENT_RESPONSE\n"
  exit 1
fi

# Test 2: Create Job
echo -e "${BLUE}2️⃣  Testing Job Creation...${NC}"
JOB_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/jobs/create" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"title\": \"Test Job $(date +%s)\",
    \"description\": \"Test description\",
    \"salaryMin\": 25000,
    \"salaryMax\": 35000,
    \"currency\": \"PHP\",
    \"workArrangement\": \"remote\",
    \"workType\": \"full_time\",
    \"experienceLevel\": \"mid_level\"
  }")

JOB_ID=$(echo $JOB_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$JOB_ID" ]; then
  echo -e "${GREEN}✅ SUCCESS - Job ID: $JOB_ID${NC}\n"
else
  echo -e "${RED}❌ FAILED${NC}"
  echo "$JOB_RESPONSE\n"
  exit 1
fi

# Summary
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 ALL WORKING ENDPOINTS PASSED!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "✅ Client Management: WORKING"
echo "✅ Job Creation: WORKING"
echo "✅ Authentication: WORKING"
echo "✅ Response Formatting: WORKING"
echo ""
echo "Created:"
echo "  Client ID: $CLIENT_ID"
echo "  Job ID: $JOB_ID"
echo ""
