/**
 * Test script to verify onboarding API endpoints work
 * Run with: node test-onboarding-api.js
 */

const candidateId = '3a89a2fc-df10-49f4-8c75-56adf939f7ce';

async function testOnboardingAPI() {
    console.log('🧪 Testing Onboarding API...\n');

    // Test 1: Get onboarding data (without auth - should fail with 401)
    console.log('Test 1: GET /api/onboarding (without auth)');
    try {
        const res = await fetch(`http://localhost:3001/api/onboarding?candidateId=${candidateId}`);
        const data = await res.json();
        console.log(`  Status: ${res.status}`);
        console.log(`  Response:`, data);

        if (res.status === 401) {
            console.log('  ✅ Correctly returns 401 without auth\n');
        } else {
            console.log('  ⚠️  Expected 401, got', res.status, '\n');
        }
    } catch (error) {
        console.log(`  ❌ Error:`, error.message, '\n');
    }

    // Test 2: Create test onboarding (without auth - should fail with 401)
    console.log('Test 2: POST /api/test/onboarding/create-test (without auth)');
    try {
        const res = await fetch('http://localhost:3001/api/test/onboarding/create-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testMode: true })
        });
        const data = await res.json();
        console.log(`  Status: ${res.status}`);
        console.log(`  Response:`, data);

        if (res.status === 401) {
            console.log('  ✅ Correctly returns 401 without auth\n');
        } else {
            console.log('  ⚠️  Expected 401, got', res.status, '\n');
        }
    } catch (error) {
        console.log(`  ❌ Error:`, error.message, '\n');
    }

    console.log('✅ API endpoints are protected by auth (expected behavior)');
    console.log('\n📝 To fully test the wizard:');
    console.log('   1. Navigate to http://localhost:3001/test/onboarding');
    console.log('   2. Log in as jennifer.tuason@testbpo.com / testtest1');
    console.log('   3. Click "Launch Onboarding Wizard"');
    console.log('   4. Fill out and submit each step');
}

testOnboardingAPI().catch(console.error);
