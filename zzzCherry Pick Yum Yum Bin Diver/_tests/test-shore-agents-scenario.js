#!/usr/bin/env node

/**
 * Test the exact scenario described by the user:
 * "ShoreAgents Inc" should match "Shore Agents INC"
 */

const API_KEY = 'bpoc_d1e04a4c83cef0444783880f050b7581debc29465ab08c30';
const BASE_URL = 'http://localhost:3001';

async function testScenario() {
  console.log('🎯 USER SCENARIO TEST: ShoreAgents Inc vs Shore Agents INC\n');
  console.log('='.repeat(70) + '\n');

  // Step 1: Create "ShoreAgents Inc"
  console.log('Step 1: Agency creates client "ShoreAgents Inc"');
  const response1 = await fetch(`${BASE_URL}/api/v1/clients/get-or-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      name: 'ShoreAgents Inc',
      email: 'info@shoreagents.com',
      industry: 'Recruitment',
    }),
  });

  const result1 = await response1.json();
  console.log(`   ${result1.created ? '✅ Created' : '✅ Found existing'}: ${result1.name}`);
  console.log(`   Client ID: ${result1.clientId}`);
  console.log(`   Company ID: ${result1.companyId}\n`);

  const clientId1 = result1.clientId;
  const companyId1 = result1.companyId;

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 2: Try to create "Shore Agents INC" (should find existing)
  console.log('Step 2: Same agency tries to post job for "Shore Agents INC"');
  console.log('   (Should find existing client, not create duplicate)\n');

  const response2 = await fetch(`${BASE_URL}/api/v1/clients/get-or-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      name: 'Shore Agents INC',
    }),
  });

  const result2 = await response2.json();
  console.log(`   ${result2.created ? '❌ Created NEW' : '✅ Found EXISTING'}: ${result2.name}`);
  console.log(`   Client ID: ${result2.clientId}`);
  console.log(`   Company ID: ${result2.companyId}`);
  if (result2.similarity) {
    console.log(`   Similarity: ${result2.similarity}%`);
    console.log(`   Matched by: ${result2.matchedBy}`);
  }
  console.log('');

  // Verify they match
  console.log('='.repeat(70) + '\n');
  if (result2.clientId === clientId1 && result2.companyId === companyId1) {
    console.log('✅ SUCCESS! Same client was returned for both variations\n');
    console.log('   "ShoreAgents Inc" and "Shore Agents INC" matched correctly');
    console.log('   No duplicate clients were created\n');
    console.log('   The agency platform can safely use the returned client ID');
    console.log(`   to link jobs and applications to the same client.\n`);
  } else {
    console.log('❌ FAILED! Different clients were returned\n');
    console.log(`   First:  ${clientId1}`);
    console.log(`   Second: ${result2.clientId}\n`);
  }

  // Step 3: Show what happens with a typo
  console.log('='.repeat(70) + '\n');
  console.log('Bonus Test: What about a typo like "Shore Agants Inc"?\n');

  const response3 = await fetch(`${BASE_URL}/api/v1/clients/get-or-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      name: 'Shore Agants Inc', // "Agants" instead of "Agents"
    }),
  });

  const result3 = await response3.json();
  console.log(`   ${result3.created ? '❌ Created NEW' : '✅ Found EXISTING'}: ${result3.name}`);
  if (result3.similarity) {
    console.log(`   Similarity: ${result3.similarity}%`);
    console.log(`   Matched by: ${result3.matchedBy}`);
  }

  if (result3.clientId === clientId1) {
    console.log(`   ✅ Even with a typo, it found the correct client!\n`);
  } else {
    console.log(`   ⚠️  Typo similarity (${result3.similarity}%) below 85% threshold`);
    console.log(`   Created new client to be safe (prevents false matches)\n`);
  }
}

testScenario().catch(console.error);
