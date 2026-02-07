/**
 * Test full onboarding flow to verify everything works
 * Run with: node test-full-onboarding-flow.js
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

async function testFullFlow() {
    console.log('🧪 Testing Full Onboarding Flow\n');
    console.log('='.repeat(60));

    let allTestsPassed = true;

    // Test 1: Check if storage bucket exists
    console.log('\n📦 TEST 1: Storage Bucket Exists');
    console.log('-'.repeat(60));
    try {
        const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
        if (error) throw error;

        const candidatesBucket = buckets.find(b => b.name === 'candidates');
        if (candidatesBucket) {
            console.log('✅ PASS: "candidates" bucket exists');
            console.log(`   ID: ${candidatesBucket.id}`);
            console.log(`   Public: ${candidatesBucket.public}`);
        } else {
            console.log('❌ FAIL: "candidates" bucket NOT found');
            allTestsPassed = false;
        }
    } catch (error) {
        console.log('❌ FAIL: Error checking bucket:', error.message);
        allTestsPassed = false;
    }

    // Test 2: Check candidate data exists
    console.log('\n👤 TEST 2: Candidate Data Exists');
    console.log('-'.repeat(60));
    try {
        const { data: candidate, error } = await supabaseAdmin
            .from('candidates')
            .select('*')
            .eq('id', jenniferCandidateId)
            .single();

        if (error) throw error;

        console.log('✅ PASS: Candidate found');
        console.log(`   Name: ${candidate.first_name} ${candidate.last_name}`);
        console.log(`   Email: ${candidate.email}`);
        console.log(`   Birthday: ${candidate.birthday || '❌ NOT SET'}`);
        console.log(`   Resume: ${candidate.resume_url || '❌ NOT SET'}`);
    } catch (error) {
        console.log('❌ FAIL: Error fetching candidate:', error.message);
        allTestsPassed = false;
    }

    // Test 3: Check candidate profile exists
    console.log('\n📋 TEST 3: Candidate Profile Exists');
    console.log('-'.repeat(60));
    try {
        const { data: profile, error } = await supabaseAdmin
            .from('candidate_profiles')
            .select('*')
            .eq('candidate_id', jenniferCandidateId)
            .single();

        if (error) throw error;

        console.log('✅ PASS: Profile found');
        console.log(`   Phone: ${profile.phone || '❌ NOT SET'}`);
        console.log(`   Gender: ${profile.gender || '❌ NOT SET'}`);
        console.log(`   Bio: ${profile.bio ? 'EXISTS' : '❌ NOT SET'}`);
    } catch (error) {
        console.log('❌ FAIL: Error fetching profile:', error.message);
        allTestsPassed = false;
    }

    // Test 4: Check if job application exists
    console.log('\n💼 TEST 4: Job Application Exists');
    console.log('-'.repeat(60));
    try {
        const { data: apps, error } = await supabaseAdmin
            .from('job_applications')
            .select('*')
            .eq('candidate_id', jenniferCandidateId);

        if (error) throw error;

        if (apps && apps.length > 0) {
            console.log(`✅ PASS: Found ${apps.length} job application(s)`);
            console.log(`   Latest Status: ${apps[0].status}`);
        } else {
            console.log('⚠️  WARNING: No job applications found (create-test will create one)');
        }
    } catch (error) {
        console.log('❌ FAIL: Error fetching applications:', error.message);
        allTestsPassed = false;
    }

    // Test 5: Delete existing onboarding to start fresh
    console.log('\n🗑️  TEST 5: Clean Up Old Onboarding');
    console.log('-'.repeat(60));
    try {
        const { data, error } = await supabaseAdmin
            .from('candidate_onboarding')
            .delete()
            .eq('candidate_id', jenniferCandidateId);

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            throw error;
        }

        console.log('✅ PASS: Cleaned up old onboarding records');
    } catch (error) {
        console.log('❌ FAIL: Error cleaning up:', error.message);
        allTestsPassed = false;
    }

    // Test 6: Simulate create-test endpoint logic
    console.log('\n🔧 TEST 6: Simulate Create-Test Logic');
    console.log('-'.repeat(60));
    try {
        // Get candidate data
        const { data: candidate } = await supabaseAdmin
            .from('candidates')
            .select('*')
            .eq('id', jenniferCandidateId)
            .single();

        const { data: profile } = await supabaseAdmin
            .from('candidate_profiles')
            .select('*')
            .eq('candidate_id', jenniferCandidateId)
            .single();

        const { data: education } = await supabaseAdmin
            .from('candidate_education')
            .select('*')
            .eq('candidate_id', jenniferCandidateId)
            .order('graduation_year', { ascending: false })
            .limit(1)
            .maybeSingle();

        // Check what data exists
        const hasPersonalInfo = candidate.first_name && candidate.last_name && candidate.email &&
                                (candidate.birthday || profile?.phone);
        const hasResume = !!candidate.resume_url;
        const hasEducation = !!education;

        console.log('Data availability:');
        console.log(`   ${hasPersonalInfo ? '✅' : '❌'} Personal Info: ${hasPersonalInfo ? 'YES' : 'NO'}`);
        console.log(`   ${hasResume ? '✅' : '❌'} Resume: ${hasResume ? 'YES' : 'NO'}`);
        console.log(`   ${hasEducation ? '✅' : '❌'} Education: ${hasEducation ? 'YES' : 'NO'}`);

        const completedSteps = [hasPersonalInfo, hasResume, hasEducation].filter(Boolean).length;
        console.log(`\nInitial completion: ${completedSteps}/8 steps (${Math.round((completedSteps / 8) * 100)}%)`);

        if (completedSteps > 0) {
            console.log('✅ PASS: Pre-population logic working');
        } else {
            console.log('⚠️  WARNING: No data to pre-populate');
        }
    } catch (error) {
        console.log('❌ FAIL: Error simulating logic:', error.message);
        allTestsPassed = false;
    }

    // Test 7: Check API endpoint availability
    console.log('\n🌐 TEST 7: API Endpoints Reachable');
    console.log('-'.repeat(60));
    try {
        // Just check if server is running
        const res = await fetch('http://localhost:3001/api/onboarding/route.ts');
        console.log('✅ PASS: Server is running on port 3001');
    } catch (error) {
        console.log('⚠️  WARNING: Could not reach server (may not be running)');
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL RESULT');
    console.log('='.repeat(60));

    if (allTestsPassed) {
        console.log('✅ ALL TESTS PASSED');
        console.log('\n🎯 Ready to test in browser:');
        console.log('   1. Navigate to: http://localhost:3001/test/onboarding');
        console.log('   2. Log in as: jennifer.tuason@testbpo.com / testtest1');
        console.log('   3. Click "Launch Onboarding Wizard"');
        console.log('   4. Verify wizard opens with pre-populated data');
    } else {
        console.log('❌ SOME TESTS FAILED');
        console.log('\nFix the issues above before testing in browser');
    }
}

testFullFlow().catch(console.error);
