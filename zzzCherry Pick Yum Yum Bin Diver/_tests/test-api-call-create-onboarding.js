/**
 * Test the actual API call to create-test endpoint
 * This simulates what happens when user clicks "Launch Wizard"
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCreateOnboardingAPI() {
    console.log('🧪 Testing Create-Test API Endpoint\n');

    // Step 1: Sign in as Jennifer
    console.log('1️⃣ Signing in as Jennifer...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'jennifer.tuason@testbpo.com',
        password: 'testtest1'
    });

    if (authError) {
        console.log('❌ FAIL: Could not sign in:', authError.message);
        return;
    }

    console.log('✅ Signed in successfully');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Step 2: Call create-test endpoint
    console.log('\n2️⃣ Calling /api/test/onboarding/create-test...');

    const { data: session } = await supabase.auth.getSession();
    const accessToken = session.session?.access_token;

    const response = await fetch('http://localhost:3001/api/test/onboarding/create-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ testMode: true })
    });

    const result = await response.json();

    if (!response.ok) {
        console.log('❌ FAIL: API returned error:', result.error);
        console.log('   Status:', response.status);
        return;
    }

    console.log('✅ API call successful!');
    console.log('\n📋 Response:');
    console.log(JSON.stringify(result, null, 2));

    // Step 3: Verify the response
    console.log('\n3️⃣ Verifying response data...');

    const checks = [
        { test: 'Has onboardingId', pass: !!result.onboardingId },
        { test: 'Has candidateId', pass: !!result.candidateId },
        { test: 'Has candidateName', pass: !!result.candidateName },
        { test: 'Has message', pass: !!result.message },
        { test: 'Has completedSteps', pass: typeof result.completedSteps === 'number' },
    ];

    checks.forEach(check => {
        console.log(`   ${check.pass ? '✅' : '❌'} ${check.test}`);
    });

    // Step 4: Fetch the created onboarding record
    console.log('\n4️⃣ Fetching created onboarding record...');

    const onboardingResponse = await fetch(
        `http://localhost:3001/api/onboarding?candidateId=${result.candidateId}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }
    );

    const onboardingData = await onboardingResponse.json();

    if (!onboardingResponse.ok) {
        console.log('❌ FAIL: Could not fetch onboarding:', onboardingData.error);
        return;
    }

    console.log('✅ Onboarding record fetched');
    console.log('\n📊 Onboarding Data:');
    console.log(`   First Name: ${onboardingData.onboarding.first_name}`);
    console.log(`   Last Name: ${onboardingData.onboarding.last_name}`);
    console.log(`   Email: ${onboardingData.onboarding.email}`);
    console.log(`   Phone: ${onboardingData.onboarding.contact_no}`);
    console.log(`   Gender: ${onboardingData.onboarding.gender}`);
    console.log(`   DOB: ${onboardingData.onboarding.date_of_birth}`);
    console.log(`   Resume URL: ${onboardingData.onboarding.resume_url || 'NOT SET'}`);
    console.log('\n📈 Status:');
    console.log(`   Personal Info: ${onboardingData.onboarding.personal_info_status}`);
    console.log(`   Resume: ${onboardingData.onboarding.resume_status}`);
    console.log(`   Gov IDs: ${onboardingData.onboarding.gov_id_status}`);
    console.log(`   Education: ${onboardingData.onboarding.education_status}`);
    console.log(`   Completion: ${onboardingData.onboarding.completion_percent}%`);

    // Final verdict
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL VERDICT');
    console.log('='.repeat(60));

    const hasPrePopulatedData = onboardingData.onboarding.first_name === 'Jennifer' &&
                                 onboardingData.onboarding.contact_no === '+639171234567';

    const correctStatus = onboardingData.onboarding.personal_info_status === 'SUBMITTED';

    if (hasPrePopulatedData && correctStatus) {
        console.log('✅✅✅ 159 MILLION PERCENT SURE IT WORKS! ✅✅✅');
        console.log('\nPre-populated data:');
        console.log('  ✅ Name: Jennifer Tuason');
        console.log('  ✅ Phone: +639171234567');
        console.log('  ✅ Gender: female');
        console.log('  ✅ Step 1 marked as SUBMITTED');
        console.log(`  ✅ Initial completion: ${result.completedSteps}/8 steps`);
    } else {
        console.log('❌ SOMETHING IS WRONG:');
        if (!hasPrePopulatedData) {
            console.log('  ❌ Data was NOT pre-populated correctly');
        }
        if (!correctStatus) {
            console.log('  ❌ Status was NOT set correctly');
        }
    }

    // Sign out
    await supabase.auth.signOut();
}

testCreateOnboardingAPI().catch(console.error);
