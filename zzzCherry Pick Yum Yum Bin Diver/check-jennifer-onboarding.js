/**
 * Check Jennifer's onboarding status in the database
 * Run with: node check-jennifer-onboarding.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

const jenniferCandidateId = '3a89a2fc-df10-49f4-8c75-56adf939f7ce';

async function checkJenniferOnboarding() {
    console.log('🔍 Checking Jennifer Tuason\'s onboarding status...\n');

    // Check candidate exists
    const { data: candidate, error: candidateError } = await supabaseAdmin
        .from('candidates')
        .select('*')
        .eq('id', jenniferCandidateId)
        .single();

    if (candidateError || !candidate) {
        console.log('❌ Candidate not found:', candidateError?.message);
        return;
    }

    console.log('✅ Candidate found:');
    console.log(`   Name: ${candidate.first_name} ${candidate.last_name}`);
    console.log(`   Email: ${candidate.email}\n`);

    // Check job applications
    const { data: applications, error: appError } = await supabaseAdmin
        .from('job_applications')
        .select('*')
        .eq('candidate_id', jenniferCandidateId);

    if (appError || !applications || applications.length === 0) {
        console.log('⚠️  No job applications found for Jennifer');
        console.log('   Run the test page and click "Launch Onboarding Wizard" to create one.\n');
        return;
    }

    console.log(`✅ Found ${applications.length} job application(s):`);
    applications.forEach((app, i) => {
        console.log(`   ${i + 1}. Application ID: ${app.id}`);
        console.log(`      Job ID: ${app.job_id}`);
        console.log(`      Status: ${app.status}\n`);
    });

    // Check onboarding records
    const { data: onboardingRecords, error: onboardingError } = await supabaseAdmin
        .from('candidate_onboarding')
        .select('*')
        .eq('candidate_id', jenniferCandidateId);

    if (onboardingError) {
        console.log('❌ Error fetching onboarding records:', onboardingError.message);
        return;
    }

    if (!onboardingRecords || onboardingRecords.length === 0) {
        console.log('⚠️  No onboarding records found for Jennifer');
        console.log('   Navigate to http://localhost:3001/test/onboarding and click "Launch Onboarding Wizard"\n');
        return;
    }

    console.log(`✅ Found ${onboardingRecords.length} onboarding record(s):\n`);
    onboardingRecords.forEach((record, i) => {
        console.log(`Onboarding Record ${i + 1}:`);
        console.log(`   ID: ${record.id}`);
        console.log(`   Job Application ID: ${record.job_application_id}`);
        console.log(`   Completion: ${record.completion_percent}%`);
        console.log(`   Is Complete: ${record.is_complete}`);
        console.log('\n   Step Status:');
        console.log(`   1. Personal Info:      ${record.personal_info_status}`);
        console.log(`   2. Resume:             ${record.resume_status}`);
        console.log(`   3. Government IDs:     ${record.gov_id_status}`);
        console.log(`   4. Education:          ${record.education_status}`);
        console.log(`   5. Medical:            ${record.medical_status}`);
        console.log(`   6. Data Privacy:       ${record.data_privacy_status}`);
        console.log(`   7. Signature:          ${record.signature_status}`);
        console.log(`   8. Emergency Contact:  ${record.emergency_contact_status}`);
        console.log('\n');
    });

    console.log('✅ Database check complete!');
}

checkJenniferOnboarding().catch(console.error);
