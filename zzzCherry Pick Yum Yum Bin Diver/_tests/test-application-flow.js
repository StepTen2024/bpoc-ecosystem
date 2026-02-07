#!/usr/bin/env node
const API_KEY = 'bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30';
const BASE_URL = 'http://localhost:3001';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Flow (Steps 1-3)\n');
  
  // Step 1: Create Candidate
  console.log('1️⃣  Creating candidate...');
  const candidateEmail = `flow.test.${Date.now()}@test.com`;
  
  const candidateRes = await fetch(`${BASE_URL}/api/v1/candidates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      email: candidateEmail,
      firstName: 'Flow',
      lastName: 'Test',
    }),
  });
  
  const candidateData = await candidateRes.json();
  console.log('✅ Candidate ID:', candidateData.id);
  console.log('   Email:', candidateData.email, '\n');
  
  // Step 2: Create Client + Job
  console.log('2️⃣  Creating client...');
  const clientRes = await fetch(`${BASE_URL}/api/v1/clients/get-or-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      name: 'Flow Test Client',
      email: 'flowtest@client.com',
    }),
  });
  
  const clientData = await clientRes.json();
  console.log('✅ Client ID:', clientData.clientId, '\n');
  
  console.log('3️⃣  Creating job...');
  const jobRes = await fetch(`${BASE_URL}/api/v1/jobs/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      clientId: clientData.clientId,
      title: 'Flow Test Job',
      description: 'Test job for flow',
      salaryMin: 25000,
      salaryMax: 35000,
      currency: 'PHP',
      workArrangement: 'remote',
    }),
  });
  
  const jobData = await jobRes.json();
  console.log('✅ Job ID:', jobData.job.id, '\n');
  
  // Step 3: Create Application (using EXISTING candidate)
  console.log('4️⃣  Creating application with EXISTING candidate...');
  const appRes = await fetch(`${BASE_URL}/api/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      jobId: jobData.job.id,
      candidate: {
        email: candidateEmail,  // SAME email as step 1
        firstName: 'Flow',
        lastName: 'Test',
      },
    }),
  });
  
  const appData = await appRes.json();
  
  if (appRes.ok) {
    console.log('✅ Application ID:', appData.applicationId);
    console.log('\n🎉 COMPLETE FLOW SUCCESS!\n');
    console.log('Created:');
    console.log('  Candidate:', candidateData.id);
    console.log('  Job:', jobData.job.id);
    console.log('  Application:', appData.applicationId);
  } else {
    console.log('❌ Application failed:', appData);
    console.log('Status:', appRes.status);
  }
}

testCompleteFlow()
