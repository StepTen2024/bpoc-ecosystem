/**
 * Check what data Jennifer already has in the system
 * Run with: node check-candidate-data.js
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

async function checkCandidateData() {
    console.log('🔍 Checking existing data for Jennifer Tuason...\n');

    // Get candidate data
    const { data: candidate, error: candidateError } = await supabaseAdmin
        .from('candidates')
        .select('*')
        .eq('id', jenniferCandidateId)
        .single();

    if (candidateError || !candidate) {
        console.log('❌ Candidate not found:', candidateError?.message);
        return;
    }

    console.log('📋 CANDIDATES TABLE DATA:');
    console.log('============================');
    console.log(`ID: ${candidate.id}`);
    console.log(`Email: ${candidate.email}`);
    console.log(`First Name: ${candidate.first_name}`);
    console.log(`Last Name: ${candidate.last_name}`);
    console.log(`Birthday: ${candidate.birthday}`);
    console.log(`Resume URL: ${candidate.resume_url || '❌ NOT SET'}`);
    console.log(`Phone: ${candidate.phone || '❌ NOT SET'}`);
    console.log(`Created: ${candidate.created_at}\n`);

    // Get candidate profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('candidate_profiles')
        .select('*')
        .eq('candidate_id', jenniferCandidateId)
        .single();

    if (profile) {
        console.log('📋 CANDIDATE_PROFILES TABLE DATA:');
        console.log('============================');
        console.log(`Phone: ${profile.phone || '❌ NOT SET'}`);
        console.log(`City: ${profile.city || '❌ NOT SET'}`);
        console.log(`Province: ${profile.province || '❌ NOT SET'}`);
        console.log(`Country: ${profile.country || '❌ NOT SET'}`);
        console.log(`LinkedIn: ${profile.linkedin_url || '❌ NOT SET'}`);
        console.log(`Gender: ${profile.gender || '❌ NOT SET'}`);
        console.log(`Highest Education: ${profile.highest_education || '❌ NOT SET'}`);
        console.log(`Years Experience: ${profile.years_of_experience || '❌ NOT SET'}`);
        console.log(`Skills: ${profile.skills ? profile.skills.join(', ') : '❌ NOT SET'}`);
        console.log(`Bio: ${profile.bio || '❌ NOT SET'}\n`);
    } else {
        console.log('⚠️  No candidate_profiles record found\n');
    }

    // Get work experience
    const { data: experience, error: expError } = await supabaseAdmin
        .from('candidate_work_experience')
        .select('*')
        .eq('candidate_id', jenniferCandidateId)
        .order('start_date', { ascending: false });

    if (experience && experience.length > 0) {
        console.log(`📋 WORK EXPERIENCE (${experience.length} records):`);
        console.log('============================');
        experience.forEach((exp, i) => {
            console.log(`${i + 1}. ${exp.job_title} at ${exp.company}`);
            console.log(`   ${exp.start_date} - ${exp.end_date || 'Present'}`);
        });
        console.log('');
    } else {
        console.log('⚠️  No work experience records found\n');
    }

    // Get education
    const { data: education, error: eduError } = await supabaseAdmin
        .from('candidate_education')
        .select('*')
        .eq('candidate_id', jenniferCandidateId)
        .order('graduation_year', { ascending: false });

    if (education && education.length > 0) {
        console.log(`📋 EDUCATION (${education.length} records):`);
        console.log('============================');
        education.forEach((edu, i) => {
            console.log(`${i + 1}. ${edu.degree} in ${edu.field_of_study}`);
            console.log(`   ${edu.school} (${edu.graduation_year})`);
        });
        console.log('');
    } else {
        console.log('⚠️  No education records found\n');
    }

    // Get skills
    const { data: skills, error: skillsError } = await supabaseAdmin
        .from('candidate_skills')
        .select('*')
        .eq('candidate_id', jenniferCandidateId);

    if (skills && skills.length > 0) {
        console.log(`📋 SKILLS (${skills.length} records):`);
        console.log('============================');
        skills.forEach((skill, i) => {
            console.log(`${i + 1}. ${skill.skill_name} (${skill.proficiency_level})`);
        });
        console.log('');
    } else {
        console.log('⚠️  No skills records found\n');
    }

    // Summary
    console.log('\n📊 DATA AVAILABILITY SUMMARY:');
    console.log('============================');
    console.log(`✅ Personal Info: ${candidate.first_name && candidate.last_name && candidate.email ? 'YES' : 'PARTIAL'}`);
    console.log(`${candidate.resume_url ? '✅' : '❌'} Resume: ${candidate.resume_url ? 'YES' : 'NO'}`);
    console.log(`${education && education.length > 0 ? '✅' : '❌'} Education: ${education && education.length > 0 ? 'YES' : 'NO'}`);
    console.log(`❌ Government IDs: NO (not in system yet)`);
    console.log(`❌ Medical Clearance: NO (not in system yet)`);
    console.log(`❌ Data Privacy Consent: NO (not in system yet)`);
    console.log(`❌ Signature: NO (not in system yet)`);
    console.log(`❌ Emergency Contact: NO (not in system yet)`);
}

checkCandidateData().catch(console.error);
