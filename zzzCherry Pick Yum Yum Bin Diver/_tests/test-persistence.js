#!/usr/bin/env node

/**
 * Test persistence - fetch data back to verify it was saved
 */

const TEST_CANDIDATE_ID = '4c27c9e7-0c11-4ff3-ba2e-8c1873779978'

async function testPersistence() {
  console.log('🔍 Testing Persistence - Fetching saved data...\n')

  try {
    const response = await fetch(`http://localhost:3001/api/candidates/${TEST_CANDIDATE_ID}/profile`)

    if (!response.ok) {
      console.error('❌ Failed to fetch profile')
      process.exit(1)
    }

    const result = await response.json()
    const profile = result.profile

    console.log('📊 Retrieved Profile Data:')
    console.log('  phone:', profile?.phone)
    console.log('  bio:', profile?.bio)
    console.log('  birthday:', profile?.birthday)
    console.log('  gender:', profile?.gender)
    console.log('  position:', profile?.position)
    console.log('  location:', profile?.location)
    console.log('  work_status:', profile?.work_status)
    console.log('  preferred_shift:', profile?.preferred_shift)
    console.log('  preferred_work_setup:', profile?.preferred_work_setup)
    console.log('  expected_salary_min:', profile?.expected_salary_min)
    console.log('  expected_salary_max:', profile?.expected_salary_max)
    console.log('\n')

    // Verify data matches what we saved
    const expectedData = {
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

    let persistenceVerified = true
    const mismatches = []

    for (const [key, expectedValue] of Object.entries(expectedData)) {
      const actualValue = profile?.[key]

      if (typeof expectedValue === 'number') {
        if (Number(actualValue) !== expectedValue) {
          persistenceVerified = false
          mismatches.push(`${key}: expected ${expectedValue}, got ${actualValue}`)
        }
      } else {
        if (String(actualValue) !== String(expectedValue)) {
          persistenceVerified = false
          mismatches.push(`${key}: expected "${expectedValue}", got "${actualValue}"`)
        }
      }
    }

    if (persistenceVerified) {
      console.log('✅ PERSISTENCE VERIFIED: All data persisted correctly in database!')
      console.log('\n')
      process.exit(0)
    } else {
      console.log('❌ PERSISTENCE FAILED: Data mismatch:')
      mismatches.forEach(m => console.log('  -', m))
      console.log('\n')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testPersistence()
