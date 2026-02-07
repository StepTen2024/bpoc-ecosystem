#!/usr/bin/env node
const API_KEY = 'bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30';
const BASE_URL = 'http://localhost:3001';

async function testFlowWithTiming() {
  console.log('🧪 Testing Flow Simulator Steps (Sequential)\n');
  
  const testData = {}; // Simulate what FlowSimulator does
  
  // Step 1: Create Candidate
  console.log('1️⃣  Creating candidate...');
  const candidateEmail = `timing.test.${Date.now()}@test.com`;
  
  const candidateRes = await fetch(`${BASE_URL}/api/v1/candidates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      email: candidateEmail,
      firstName: 'Timing',
      lastName: 'Test',
    }),
  });
  
  const candidateData = await candidateRes.json();
  testData.candidateId = candidateData.id;
  testData.candidateEmail = candidateEmail;
  console.log('✅ Stored: candidateId =', testData.candidateId);
  console.log('✅ Stored: candidateEmail =', testData.candidateEmail, '\n');
  
  // Step 2: Create Job
  console.log('2️⃣  Creating job...');
  
  // Get client first
  const clientRes = await fetch(`${BASE_URL}/api/v1/clients/get-or-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      name: 'Timing Test Client',
      email: 'timing@client.com',
    }),
  });
  
  const clientData = await clientRes.json();
  testData.clientId = clientData.clientId;
  console.log('✅ Stored: clientId =', testData.clientId);
  
  const jobRes = await fetch(`${BASE_URL}/api/v1/jobs/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      clientId: testData.clientId,
      title: 'Timing Test Job',
      description: 'Test job',
      salaryMin: 25000,
      salaryMax: 35000,
      currency: 'PHP',
      workArrangement: 'remote',
    }),
  });
  
  const jobData = await jobRes.json();
  testData.jobId = jobData.job.id;
  console.log('✅ Stored: jobId =', testData.jobId, '\n');
  
  // Step 3: Create Application (IMMEDIATELY - no delay)
  console.log('3️⃣  Creating application IMMEDIATELY...');
  console.log('📋 Using data from testData object:');
  console.log('   jobId:', testData.jobId);
  console.log('   candidateEmail:', testData.candidateEmail);
  
  if (!testData.jobId) {
    console.log('❌ ERROR: jobId is missing!');
    return;
  }
  
  if (!testData.candidateEmail) {
    console.log('❌ ERROR: candidateEmail is missing!');
    return;
  }
  
  const appRes = await fetch(`${BASE_URL}/api/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      jobId: testData.jobId,
      candidate: {
        email: testData.candidateEmail,
        firstName: 'Timing',
        lastName: 'Test',
      },
    }),
  });
  
  if (appRes.ok) {
    const appData = await appRes.json();
    console.log('✅ Application created:', appData.applicationId);
    console.log('\n🎉 ALL STEPS WORK WITH IMMEDIATE EXECUTION!\n');
  } else {
    const errorData = await appRes.json();
    console.log('❌ Application failed:', errorData);
    console.log('Status:', appRes.status);
  }
}

testFlowWithTiming()
