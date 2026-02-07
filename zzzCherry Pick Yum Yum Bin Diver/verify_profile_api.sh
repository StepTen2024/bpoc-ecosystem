
# Create a test candidate using the test harness
echo "Creating test candidate..."
CANDIDATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/test-harness \
  -H "Content-Type: application/json" \
  -H "X-Test-Secret: BPOC_TestHarness_2024_StepTen_SecureKey_9X7K2P" \
  -d '{
    "action": "create_candidate",
    "data": {
      "email": "verify_profile_fix@example.com",
      "password": "Password123!",
      "first_name": "Verify",
      "last_name": "Fix"
    }
  }')

echo "Candidate Response: $CANDIDATE_RESPONSE"

# Extract User ID (requires jq, or simple grep/sed if simple json)
# Assuming response structure { success: true, user: { id: "..." } }

USER_ID=$(echo $CANDIDATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "User ID: $USER_ID"

if [ -z "$USER_ID" ]; then
  echo "Failed to create user or extract ID"
  exit 1
fi

# Test PUT /api/user/profile
echo "Testing PUT /api/user/profile..."
curl -X PUT http://localhost:3001/api/user/profile \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"username\": \"verify_user_123\",
    \"bio\": \"This is a verification bio\",
    \"position\": \"Software Engineer\",
    \"location\": \"Manila\",
    \"gender\": \"male\",
    \"birthday\": \"1990-01-01\",
    \"phone\": \"09171234567\",
    \"completed_data\": true
  }"

echo -e "\n"

# Test PUT /api/user/work-status
echo "Testing PUT /api/user/work-status..."
curl -X PUT http://localhost:3001/api/user/work-status \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"workStatus\": \"employed\",
    \"currentEmployer\": \"Tech Corp\",
    \"preferredShift\": \"day\",
    \"noticePeriod\": \"30\",
    \"currentSalary\": \"50000\",
    \"workSetup\": \"remote\"
  }"

echo -e "\n"

# Test GET /api/user/profile to verify verification
echo "Verifying data persistence..."
GET_RESPONSE=$(curl -s "http://localhost:3001/api/user/profile?userId=$USER_ID")
echo "Get Response: $GET_RESPONSE"

# Cleanup
echo "Cleaning up..."
curl -X POST http://localhost:3001/api/test-harness \
  -H "Content-Type: application/json" \
  -H "X-Test-Secret: BPOC_TestHarness_2024_StepTen_SecureKey_9X7K2P" \
  -d "{
    \"action\": \"cleanup\",
    \"user_id\": \"$USER_ID\"
  }"
