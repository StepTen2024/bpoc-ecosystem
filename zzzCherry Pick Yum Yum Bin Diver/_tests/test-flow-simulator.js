#!/usr/bin/env node
const API_KEY = 'bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30';
const BASE_URL = 'http://localhost:3001';

async function testFlowSimulator() {
  console.log('🧪 Testing BPOC API Flow Simulator\n');
  console.log('=' .repeat(60));

  const testData = {};

  try {
    // Step 1: Create Candidate
    console.log('\n1️⃣  Testing POST /api/v1/candidates');
    console.log('─'.repeat(60));

    const candidateResponse = await fetch(`${BASE_URL}/api/v1/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        email: `test.${Date.now()}@bpoc.io`,
        firstName: 'Test',
        lastName: 'Candidate',
      }),
    });

    const candidateData = await candidateResponse.json();
    console.log('Status:', candidateResponse.status);
    console.log('Response:', JSON.stringify(candidateData, null, 2));

    if (!candidateResponse.ok) {
      console.log('❌ FAILED: Candidate creation');
      throw new Error(candidateData.error || 'Failed to create candidate');
    }

    // Extract candidate ID (should be in data.id, not data.candidate.id)
    testData.candidateId = candidateData.id;
    console.log('✅ SUCCESS: Candidate created with ID:', testData.candidateId);

    // Step 2: Get or Create Client
    console.log('\n2️⃣  Testing POST /api/v1/clients/get-or-create');
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
    console.log('Response:', JSON.stringify(clientData, null, 2));

    if (!clientResponse.ok) {
      console.log('❌ FAILED: Client creation');
      throw new Error(clientData.error || 'Failed to create client');
    }

    // Extract client ID (should be in clientData.clientId after transformToApi)
    testData.clientId = clientData.clientId;
    console.log('✅ SUCCESS: Client ID:', testData.clientId);

    // Step 3: Create Job
    console.log('\n3️⃣  Testing POST /api/v1/jobs/create');
    console.log('─'.repeat(60));

    const jobResponse = await fetch(`${BASE_URL}/api/v1/jobs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        clientId: testData.clientId,
        title: 'Customer Service Representative',
        description: 'Handle customer inquiries',
        requirements: ['Excellent English', '2+ years experience'],
        salaryMin: 25000,
        salaryMax: 35000,
        currency: 'PHP',
        workArrangement: 'remote',
        workType: 'full_time',
        shift: 'day',
        experienceLevel: 'mid_level',
      }),
    });

    const jobData = await jobResponse.json();
    console.log('Status:', jobResponse.status);
    console.log('Response:', JSON.stringify(jobData, null, 2));

    if (!jobResponse.ok) {
      console.log('❌ FAILED: Job creation');
      throw new Error(jobData.error || 'Failed to create job');
    }

    testData.jobId = jobData.job.id;
    console.log('✅ SUCCESS: Job created with ID:', testData.jobId);

    // Step 4: Submit Application
    console.log('\n4️⃣  Testing POST /api/v1/applications');
    console.log('─'.repeat(60));

    const applicationResponse = await fetch(`${BASE_URL}/api/v1/applications`, {
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
          lastName: 'Applicant',
        },
      }),
    });

    const applicationData = await applicationResponse.json();
    console.log('Status:', applicationResponse.status);
    console.log('Response:', JSON.stringify(applicationData, null, 2));

    if (!applicationResponse.ok) {
      console.log('❌ FAILED: Application submission');
      throw new Error(applicationData.error || 'Failed to submit application');
    }

    // Extract application ID (should be in applicationData.applicationId after transformToApi)
    testData.applicationId = applicationData.applicationId;
    console.log('✅ SUCCESS: Application submitted with ID:', testData.applicationId);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\nTest Data Created:');
    console.log('  Candidate ID:', testData.candidateId);
    console.log('  Client ID:', testData.clientId);
    console.log('  Job ID:', testData.jobId);
    console.log('  Application ID:', testData.applicationId);
    console.log('\n✅ Flow Simulator is ready for production use!\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ TEST FAILED');
    console.log('='.repeat(60));
    console.log('Error:', error.message);
    console.log('\n');
    process.exit(1);
  }
}

// Run tests
testFlowSimulator();
