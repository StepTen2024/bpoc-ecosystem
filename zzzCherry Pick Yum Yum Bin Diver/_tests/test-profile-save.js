#!/usr/bin/env node

/**
 * Test script to verify profile save functionality
 * Tests the API endpoint directly with realistic data
 */

const TEST_CANDIDATE_ID = '4c27c9e7-0c11-4ff3-ba2e-8c1873779978' // carlos.fernandez@testbpo.com

async function testProfileSave() {
  console.log('🧪 Testing Profile Save Functionality\n')
  console.log('═══════════════════════════════════════\n')

  // Test payload with various field types
  const testPayload = {
    phone: '+639171234567',
    bio: 'Test bio - saving from automated test',
    birthday: '1990-05-15',
    gender: 'male',
    position: 'Senior Customer Service Representative',
    location: 'Manila, Philippines',
    work_status: 'employed',
    preferred_shift: 'day',
    preferred_work_setup: 'hybrid',
    expected_salary_min: 25000,
    expected_salary_max: 35000,
  }

  console.log('📤 Sending test payload to API...')
  console.log('Candidate ID:', TEST_CANDIDATE_ID)
  console.log('Payload:', JSON.stringify(testPayload, null, 2))
  console.log('\n')

  try {
    const response = await fetch(`http://localhost:3001/api/candidates/${TEST_CANDIDATE_ID}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    console.log('📡 API Response:')
    console.log('Status:', response.status, response.statusText)
    console.log('OK:', response.ok)
    console.log('\n')

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:')
      console.error(errorText)
      console.log('\n')
      process.exit(1)
    }

    const result = await response.json()
    console.log('✅ API Success Response:')
    console.log('Profile ID:', result.profile?.id)
    console.log('Candidate ID:', result.profile?.candidate_id)
    console.log('\n')

    console.log('📊 Saved Fields:')
    console.log('  phone:', result.profile?.phone)
    console.log('  bio:', result.profile?.bio)
    console.log('  birthday:', result.profile?.birthday)
    console.log('  gender:', result.profile?.gender)
    console.log('  position:', result.profile?.position)
    console.log('  location:', result.profile?.location)
    console.log('  work_status:', result.profile?.work_status)
    console.log('  preferred_shift:', result.profile?.preferred_shift)
    console.log('  preferred_work_setup:', result.profile?.preferred_work_setup)
    console.log('  expected_salary_min:', result.profile?.expected_salary_min)
    console.log('  expected_salary_max:', result.profile?.expected_salary_max)
    console.log('\n')

    // Verify all fields were saved
    let allFieldsSaved = true
    const missingFields = []

    for (const [key, value] of Object.entries(testPayload)) {
      const savedValue = result.profile?.[key]
      if (savedValue === null || savedValue === undefined) {
        allFieldsSaved = false
        missingFields.push(key)
      } else {
        // For numbers, compare as numbers
        if (typeof value === 'number') {
          if (Number(savedValue) !== value) {
            allFieldsSaved = false
            missingFields.push(`${key} (value mismatch: expected ${value}, got ${savedValue})`)
          }
        } else {
          // For strings, compare as strings
          if (String(savedValue) !== String(value)) {
            allFieldsSaved = false
            missingFields.push(`${key} (value mismatch: expected "${value}", got "${savedValue}")`)
          }
        }
      }
    }

    console.log('\n═══════════════════════════════════════\n')

    if (allFieldsSaved) {
      console.log('✅ SUCCESS: All fields saved correctly!')
      console.log('\n')
      process.exit(0)
    } else {
      console.log('❌ FAILURE: Some fields did not save:')
      missingFields.forEach(field => console.log('  -', field))
      console.log('\n')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Test failed with error:')
    console.error(error)
    console.log('\n')
    process.exit(1)
  }
}

// Run test
testProfileSave()
