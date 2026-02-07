#!/usr/bin/env node
const API_KEY = 'bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30';
const BASE_URL = 'http://localhost:3001';

async function testApplication() {
  console.log('🧪 Testing Application Creation (Detailed)\n');
  
  // First create a job
  const clientRes = await fetch(`${BASE_URL}/api/v1/clients/get-or-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      name: 'Test Client',
      email: 'test@client.com',
    }),
  });
  
  const clientData = await clientRes.json();
  console.log('✅ Client ID:', clientData.clientId);
  
  const jobRes = await fetch(`${BASE_URL}/api/v1/jobs/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      clientId: clientData.clientId,
      title: 'Test Job',
      description: 'Test',
      salaryMin: 25000,
      salaryMax: 35000,
      currency: 'PHP',
      workArrangement: 'remote',
    }),
  });
  
  const jobData = await jobRes.json();
  console.log('✅ Job ID:', jobData.job.id);
  
  // Now try to create application
  console.log('\n📝 Creating application...\n');
  
  const appRes = await fetch(`${BASE_URL}/api/v1/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      jobId: jobData.job.id,
      candidate: {
        email: `test.${Date.now()}@bpoc.io`,
        firstName: 'Test',
        lastName: 'Candidate',
      },
    }),
  });
  
  const appData = await appRes.json();
  
  console.log('Status:', appRes.status);
  console.log('Response:', JSON.stringify(appData, null, 2));
  
  if (appRes.ok) {
    console.log('\n✅ APPLICATION CREATED!');
    console.log('Application ID:', appData.applicationId);
  } else {
    console.log('\n❌ APPLICATION FAILED');
    console.log('Check server logs for details');
  }
}

testApplication()
