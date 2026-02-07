#!/usr/bin/env node
/**
 * Test script for BPOC API Simulator - Working Endpoints Only
 * Tests the endpoints that are currently functional
 */

const API_KEY = 'bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30';
const BASE_URL = 'http://localhost:3001';

async function testWorkingEndpoints() {
  console.log('🧪 Testing BPOC API - Working Endpoints Only\n');
  console.log('=' .repeat(60));

  const testData = {};
  let passedTests = 0;
  let failedTests = 0;

  try {
    // Test 1: Get or Create Client
    console.log('\n✅ Test 1: POST /api/v1/clients/get-or-create');
    console.log('─'.repeat(60));

    const clientResponse = await fetch(`${BASE_URL}/api/v1/clients/get-or-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        name: 'Test Client Company',
        email: 'client@testcompany.com',
      }),
    });

    const clientData = await clientResponse.json();
    console.log('Status:', clientResponse.status);
    console.log('Response keys:', Object.keys(clientData));

    if (!clientResponse.ok) {
      console.log('❌ FAILED');
      console.log('Error:', JSON.stringify(clientData, null, 2));
      failedTests++;
    } else {
      testData.clientId = clientData.clientId;
      console.log('✅ PASSED - Client ID:', testData.clientId);
      console.log('   Created:', clientData.created ? 'New' : 'Existing');
      passedTests++;
    }

    // Test 2: List Clients
    console.log('\n✅ Test 2: GET /api/v1/clients');
    console.log('─'.repeat(60));

    const listResponse = await fetch(`${BASE_URL}/api/v1/clients`, {
      headers: { 'X-API-Key': API_KEY },
    });

    const listData = await listResponse.json();
    console.log('Status:', listResponse.status);
    console.log('Total clients:', listData.total);

    if (!listResponse.ok) {
      console.log('❌ FAILED');
      failedTests++;
    } else {
      console.log('✅ PASSED - Found', listData.total, 'clients');
      passedTests++;
    }

    // Test 3: Create Job
    console.log('\n✅ Test 3: POST /api/v1/jobs/create');
    console.log('─'.repeat(60));

    const jobResponse = await fetch(`${BASE_URL}/api/v1/jobs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        clientId: testData.clientId,
        title: `Test Job ${Date.now()}`,
        description: 'Test job description',
        requirements: ['Skill 1', 'Skill 2'],
        salaryMin: 25000,
        salaryMax: 35000,
        currency: 'PHP',
        workArrangement: 'remote',
        workType: 'full_time',
        experienceLevel: 'mid_level',
      }),
    });

    const jobData = await jobResponse.json();
    console.log('Status:', jobResponse.status);

    if (!jobResponse.ok) {
      console.log('❌ FAILED');
      console.log('Error:', JSON.stringify(jobData, null, 2));
      failedTests++;
    } else {
      testData.jobId = jobData.job.id;
      console.log('✅ PASSED - Job ID:', testData.jobId);
      console.log('   Title:', jobData.job.title);
      passedTests++;
    }

    // Test 4: Submit Application (creates candidate + application)
    console.log('\n✅ Test 4: POST /api/v1/applications');
    console.log('─'.repeat(60));

    const appResponse = await fetch(`${BASE_URL}/api/v1/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        jobId: testData.jobId,
        candidate: {
          email: `test.${Date.now()}@bpoc.io`,
          firstName: 'Test',
          lastName: 'Candidate',
        },
      }),
    });

    const appData = await appResponse.json();
    console.log('Status:', appResponse.status);

    if (!appResponse.ok) {
      console.log('❌ FAILED');
      console.log('Error:', JSON.stringify(appData, null, 2));
      failedTests++;
    } else {
      testData.applicationId = appData.applicationId;
      console.log('✅ PASSED - Application ID:', testData.applicationId);
      passedTests++;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passedTests}/${passedTests + failedTests}`);
    console.log(`❌ Failed: ${failedTests}/${passedTests + failedTests}`);

    if (failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('\nYour API is working correctly for:');
      console.log('  ✅ Client management');
      console.log('  ✅ Job creation');
      console.log('  ✅ Application submission');
      console.log('  ✅ Authentication');
      console.log('  ✅ Response formatting');
    } else {
      console.log('\n⚠️  Some tests failed. Check errors above.');
    }

    console.log('\n📋 Test Data Created:');
    if (testData.clientId) console.log('  Client ID:', testData.clientId);
    if (testData.jobId) console.log('  Job ID:', testData.jobId);
    if (testData.applicationId) console.log('  Application ID:', testData.applicationId);
    console.log('');

    process.exit(failedTests > 0 ? 1 : 0);

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ CRITICAL ERROR');
    console.log('='.repeat(60));
    console.log('Error:', error.message);
    console.log('\nMake sure the dev server is running on port 3001');
    console.log('Run: npm run dev\n');
    process.exit(1);
  }
}

testWorkingEndpoints();
