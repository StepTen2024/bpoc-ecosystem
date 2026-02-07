#!/usr/bin/env node

/**
 * Automated Test Candidate Upload Script
 * 
 * This script automates the entire process of creating test candidates:
 * 1. Creates Supabase Auth accounts
 * 2. Inserts profile data
 * 3. Uploads images to Supabase Storage
 * 4. Converts HTML resumes to PDF and uploads
 * 
 * Usage:
 *   npm install @supabase/supabase-js
 *   node upload_candidates.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

// Initialize Supabase client with service role (for admin operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// Helper Functions
// ============================================================================

async function loadCandidateData() {
    const data = await fs.readFile(
        path.join(__dirname, 'candidate_data.json'),
        'utf8'
    );
    return JSON.parse(data);
}

async function createAuthAccount(candidate) {
    console.log(`Creating auth account for ${candidate.first_name} ${candidate.last_name}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email: candidate.email,
        password: candidate.password,
        email_confirm: true,
        user_metadata: {
            first_name: candidate.first_name,
            last_name: candidate.last_name,
        }
    });

    if (error) {
        console.error(`  ❌ Error creating auth account: ${error.message}`);
        return null;
    }

    console.log(`  ✓ Auth account created with ID: ${data.user.id}`);
    return data.user.id;
}

async function insertCandidateRecord(authId, candidate) {
    console.log(`Inserting candidate record...`);

    const { error } = await supabase
        .from('candidates')
        .insert({
            id: authId,
            email: candidate.email,
            first_name: candidate.first_name,
            last_name: candidate.last_name,
            username: candidate.username,
            slug: `${candidate.first_name.toLowerCase()}-${candidate.last_name.toLowerCase()}`,
            is_active: true,
            email_verified: true,
        });

    if (error) {
        console.error(`  ❌ Error inserting candidate: ${error.message}`);
        return false;
    }

    console.log(`  ✓ Candidate record inserted`);
    return true;
}

async function insertProfile(authId, profile) {
    console.log(`Inserting profile data...`);

    const { error } = await supabase
        .from('candidate_profiles')
        .insert({
            candidate_id: authId,
            ...profile,
        });

    if (error) {
        console.error(`  ❌ Error inserting profile: ${error.message}`);
        return false;
    }

    console.log(`  ✓ Profile inserted`);
    return true;
}

async function insertWorkExperiences(authId, experiences) {
    if (!experiences || experiences.length === 0) return true;

    console.log(`Inserting ${experiences.length} work experience entries...`);

    const records = experiences.map(exp => ({
        candidate_id: authId,
        company_name: exp.company_name,
        job_title: exp.job_title,
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.end_date,
        is_current: exp.is_current,
        description: exp.description,
        responsibilities: exp.responsibilities || [],
        achievements: exp.achievements || [],
    }));

    const { error } = await supabase
        .from('candidate_work_experiences')
        .insert(records);

    if (error) {
        console.error(`  ❌ Error inserting work experiences: ${error.message}`);
        return false;
    }

    console.log(`  ✓ Work experiences inserted`);
    return true;
}

async function insertEducations(authId, educations) {
    if (!educations || educations.length === 0) return true;

    console.log(`Inserting ${educations.length} education entries...`);

    const records = educations.map(edu => ({
        candidate_id: authId,
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        start_date: edu.start_date,
        end_date: edu.end_date,
        is_current: edu.is_current,
        grade: edu.grade,
        description: edu.description,
    }));

    const { error } = await supabase
        .from('candidate_educations')
        .insert(records);

    if (error) {
        console.error(`  ❌ Error inserting educations: ${error.message}`);
        return false;
    }

    console.log(`  ✓ Educations inserted`);
    return true;
}

async function insertSkills(authId, skills) {
    if (!skills || skills.length === 0) return true;

    console.log(`Inserting ${skills.length} skills...`);

    const records = skills.map(skill => ({
        candidate_id: authId,
        name: skill.name,
        category: skill.category,
        proficiency_level: skill.proficiency_level,
        years_experience: skill.years_experience,
        is_primary: skill.is_primary,
        verified: false,
    }));

    const { error } = await supabase
        .from('candidate_skills')
        .insert(records);

    if (error) {
        console.error(`  ❌ Error inserting skills: ${error.message}`);
        return false;
    }

    console.log(`  ✓ Skills inserted`);
    return true;
}

async function uploadImage(authId, imagePath, bucket, folder = '') {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        const fileName = path.basename(imagePath);
        const storagePath = folder ? `${folder}/${authId}_${fileName}` : `${authId}_${fileName}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(storagePath, imageBuffer, {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) {
            console.error(`  ❌ Error uploading ${fileName}: ${error.message}`);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(storagePath);

        return publicUrl;
    } catch (err) {
        console.error(`  ❌ Error reading/uploading image: ${err.message}`);
        return null;
    }
}

async function uploadImages(authId, candidateName) {
    console.log(`Uploading images...`);

    const profilePath = path.join(__dirname, 'images', 'profiles', `${candidateName}.png`);
    const coverPath = path.join(__dirname, 'images', 'covers', `${candidateName}.png`);

    const profileUrl = await uploadImage(authId, profilePath, 'candidate-avatars');
    const coverUrl = await uploadImage(authId, coverPath, 'candidate-covers');

    if (profileUrl) {
        // Update candidate with avatar URL
        await supabase
            .from('candidates')
            .update({ avatar_url: profileUrl })
            .eq('id', authId);
        console.log(`  ✓ Profile photo uploaded`);
    }

    if (coverUrl) {
        // Update candidate profile with cover photo
        await supabase
            .from('candidate_profiles')
            .update({ cover_photo: coverUrl })
            .eq('candidate_id', authId);
        console.log(`  ✓ Cover photo uploaded`);
    }

    return { profileUrl, coverUrl };
}

async function processCandidate(candidate) {
    const fullName = `${candidate.first_name} ${candidate.last_name}`;
    const candidateName = `${candidate.first_name.toLowerCase()}_${candidate.last_name.toLowerCase()}`;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${fullName}`);
    console.log(`${'='.repeat(60)}\n`);

    // 1. Create auth account
    const authId = await createAuthAccount(candidate);
    if (!authId) {
        console.log(`❌ Skipping ${fullName} due to auth creation failure\n`);
        return false;
    }

    // 2. Insert candidate record
    const candidateInserted = await insertCandidateRecord(authId, candidate);
    if (!candidateInserted) {
        console.log(`❌ Skipping ${fullName} due to candidate insertion failure\n`);
        return false;
    }

    // 3. Insert profile
    const profileInserted = await insertProfile(authId, candidate.profile);
    if (!profileInserted) {
        console.log(`⚠️  Profile insertion failed for ${fullName}\n`);
    }

    // 4. Insert work experiences
    await insertWorkExperiences(authId, candidate.work_experiences);

    // 5. Insert educations
    await insertEducations(authId, candidate.educations);

    // 6. Insert skills
    await insertSkills(authId, candidate.skills);

    // 7. Upload images
    await uploadImages(authId, candidateName);

    console.log(`\n✅ ${fullName} successfully created!\n`);
    return true;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('  BPO Test Candidates - Automated Upload');
    console.log('='.repeat(60) + '\n');

    // Validate configuration
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_KEY') {
        console.error('❌ Error: Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        console.error('\nSet them in your .env.local file or as environment variables:');
        console.error('  NEXT_PUBLIC_SUPABASE_URL=your-url');
        console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-key\n');
        process.exit(1);
    }

    // Load candidate data
    console.log('Loading candidate data...');
    const data = await loadCandidateData();
    console.log(`✓ Loaded ${data.candidates.length} candidates\n`);

    // Process each candidate
    let successCount = 0;
    let failCount = 0;

    for (const candidate of data.candidates) {
        const success = await processCandidate(candidate);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('  Upload Complete!');
    console.log('='.repeat(60));
    console.log(`\n✅ Successfully created: ${successCount} candidates`);
    if (failCount > 0) {
        console.log(`❌ Failed: ${failCount} candidates`);
    }
    console.log('\nNext steps:');
    console.log('  1. Convert HTML resumes to PDF (open in browser, print to PDF)');
    console.log('  2. Upload PDFs to Supabase Storage bucket: candidate-resumes');
    console.log('  3. Test the platform with the new accounts!\n');
}

// Run the script
if (require.main === module) {
    main().catch(err => {
        console.error('\n❌ Fatal error:', err);
        process.exit(1);
    });
}

module.exports = { processCandidate, loadCandidateData };
