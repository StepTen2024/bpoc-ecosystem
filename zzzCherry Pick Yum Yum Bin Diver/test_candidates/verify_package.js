#!/usr/bin/env node

/**
 * Verification Script for Test Candidates Package
 * 
 * Validates that all required files exist and data is properly structured
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let totalChecks = 0;
let passedChecks = 0;
let warnings = 0;

function log(message, color = RESET) {
    console.log(`${color}${message}${RESET}`);
}

function check(condition, successMsg, failMsg) {
    totalChecks++;
    if (condition) {
        passedChecks++;
        log(`  ✓ ${successMsg}`, GREEN);
        return true;
    } else {
        log(`  ✗ ${failMsg}`, RED);
        return false;
    }
}

function warn(message) {
    warnings++;
    log(`  ⚠ ${message}`, YELLOW);
}

function fileExists(filepath) {
    try {
        return fs.existsSync(filepath);
    } catch {
        return false;
    }
}

function section(title) {
    console.log(`\n${BLUE}${'='.repeat(60)}${RESET}`);
    log(title, BLUE);
    console.log(`${BLUE}${'='.repeat(60)}${RESET}\n`);
}

// ============================================================================
// Verification Tests
// ============================================================================

section('📦 Package Structure Verification');

// Check main files
check(
    fileExists('candidate_data.json'),
    'candidate_data.json exists',
    'candidate_data.json is missing'
);

check(
    fileExists('README.md'),
    'README.md exists',
    'README.md is missing'
);

check(
    fileExists('QUICK_REFERENCE.md'),
    'QUICK_REFERENCE.md exists',
    'QUICK_REFERENCE.md is missing'
);

check(
    fileExists('IMAGE_MAPPING.md'),
    'IMAGE_MAPPING.md exists',
    'IMAGE_MAPPING.md is missing'
);

check(
    fileExists('generate_resumes.py'),
    'generate_resumes.py exists',
    'generate_resumes.py is missing'
);

check(
    fileExists('upload_candidates.js'),
    'upload_candidates.js exists',
    'upload_candidates.js is missing'
);

check(
    fileExists('package.json'),
    'package.json exists',
    'package.json is missing'
);

// ============================================================================
section('📊 Candidate Data Validation');

try {
    const data = JSON.parse(fs.readFileSync('candidate_data.json', 'utf8'));

    check(
        data.candidates && Array.isArray(data.candidates),
        'candidates array exists',
        'candidates array is missing or invalid'
    );

    check(
        data.candidates.length === 10,
        `Found all 10 candidates`,
        `Expected 10 candidates, found ${data.candidates.length}`
    );

    // Validate each candidate has required fields
    let validCandidates = 0;
    data.candidates.forEach((candidate, index) => {
        const hasRequired = candidate.email &&
            candidate.password &&
            candidate.first_name &&
            candidate.last_name &&
            candidate.profile;

        if (hasRequired) {
            validCandidates++;
        } else {
            warn(`Candidate ${index + 1} missing required fields`);
        }
    });

    check(
        validCandidates === 10,
        `All candidates have required fields`,
        `Only ${validCandidates}/10 candidates have all required fields`
    );

    // Check for profile data
    const candidatesWithProfiles = data.candidates.filter(c => c.profile && c.profile.bio).length;
    check(
        candidatesWithProfiles === 10,
        `All candidates have profile data`,
        `Only ${candidatesWithProfiles}/10 candidates have profile data`
    );

    // Check for work experience
    const candidatesWithWork = data.candidates.filter(c => c.work_experiences && c.work_experiences.length > 0).length;
    check(
        candidatesWithWork === 10,
        `All candidates have work experience`,
        `Only ${candidatesWithWork}/10 candidates have work experience`
    );

} catch (err) {
    check(false, '', `Error reading candidate_data.json: ${err.message}`);
}

// ============================================================================
section('🖼️  Profile Images Validation');

const expectedCandidates = [
    'maria_garcia', 'john_smith', 'sarah_chen', 'miguel_rodriguez',
    'jennifer_tuason', 'david_williams', 'angela_santos',
    'robert_johnson', 'michelle_reyes', 'carlos_fernandez'
];

let profilePhotosFound = 0;
let coverPhotosFound = 0;

expectedCandidates.forEach(name => {
    const profilePath = path.join('images', 'profiles', `${name}.png`);
    const coverPath = path.join('images', 'covers', `${name}.png`);

    if (fileExists(profilePath)) profilePhotosFound++;
    if (fileExists(coverPath)) coverPhotosFound++;
});

check(
    profilePhotosFound === 10,
    `All 10 profile photos exist`,
    `Only ${profilePhotosFound}/10 profile photos found`
);

check(
    coverPhotosFound === 10,
    `All 10 cover photos exist`,
    `Only ${coverPhotosFound}/10 cover photos found`
);

// ============================================================================
section('📄 Resume Files Validation');

let resumesFound = 0;

expectedCandidates.forEach(name => {
    const resumePath = path.join('resumes', `${name}_resume.html`);
    if (fileExists(resumePath)) resumesFound++;
});

check(
    resumesFound === 10,
    `All 10 HTML resumes exist`,
    `Only ${resumesFound}/10 HTML resumes found`
);

// Check if resumes have content
try {
    const sampleResume = fs.readFileSync(
        path.join('resumes', 'maria_garcia_resume.html'),
        'utf8'
    );

    check(
        sampleResume.includes('<html') && sampleResume.includes('Maria Garcia'),
        'Sample resume has valid HTML content',
        'Sample resume appears to be invalid'
    );

    check(
        sampleResume.length > 1000,
        'Sample resume has substantial content',
        'Sample resume appears to be too short'
    );
} catch (err) {
    warn('Could not validate resume content');
}

// ============================================================================
section('🔍 Quick Quality Checks');

// Check for unique emails
try {
    const data = JSON.parse(fs.readFileSync('candidate_data.json', 'utf8'));
    const emails = data.candidates.map(c => c.email);
    const uniqueEmails = new Set(emails);

    check(
        uniqueEmails.size === emails.length,
        'All candidate emails are unique',
        'Duplicate emails detected'
    );
} catch (err) {
    warn('Could not check email uniqueness');
}

// Check password consistency
try {
    const data = JSON.parse(fs.readFileSync('candidate_data.json', 'utf8'));
    const passwords = data.candidates.map(c => c.password);
    const allSame = passwords.every(p => p === 'TestBPO2024!');

    check(
        allSame,
        'All passwords are set to TestBPO2024!',
        'Password inconsistency detected'
    );
} catch (err) {
    warn('Could not check password consistency');
}

// ============================================================================
// Summary
// ============================================================================

section('📊 Verification Summary');

const percentage = Math.round((passedChecks / totalChecks) * 100);

console.log(`Total Checks: ${totalChecks}`);
log(`Passed: ${passedChecks}`, GREEN);

if (totalChecks - passedChecks > 0) {
    log(`Failed: ${totalChecks - passedChecks}`, RED);
}

if (warnings > 0) {
    log(`Warnings: ${warnings}`, YELLOW);
}

console.log(`\nSuccess Rate: ${percentage}%\n`);

if (percentage === 100) {
    log('✅ All checks passed! Package is ready to use.', GREEN);
} else if (percentage >= 90) {
    log('⚠️  Most checks passed, but some issues detected.', YELLOW);
    log('   Review the warnings above.', YELLOW);
} else if (percentage >= 75) {
    log('⚠️  Package has some issues that should be addressed.', YELLOW);
} else {
    log('❌ Package has significant issues. Review errors above.', RED);
}

console.log('');

// Exit code
process.exit(percentage === 100 ? 0 : 1);
