# Test Candidates for BPO Platform

This directory contains 10 complete test candidate profiles for simulating the entire BPOC platform flow from candidate registration through AI analysis.

## Directory Structure

```
test_candidates/
├── README.md (this file)
├── IMAGE_MAPPING.md (Guide to candidate images)
├── candidate_data.json (All candidate data in JSON format)
├── generate_resumes.py (Script to generate HTML resumes)
├── images/
│   ├── profiles/ (1:1 square profile photos)
│   │   ├── maria_garcia.png
│   │   ├── john_smith.png
│   │   ├── sarah_chen.png
│   │   ├── miguel_rodriguez.png
│   │   ├── jennifer_tuason.png
│   │   ├── david_williams.png
│   │   ├── angela_santos.png
│   │   ├── robert_johnson.png
│   │   ├── michelle_reyes.png
│   │   └── carlos_fernandez.png
│   └── covers/ (16:9 horizontal cover photos)
│       ├── maria_garcia.png
│       ├── john_smith.png
│       ├── sarah_chen.png
│       ├── miguel_rodriguez.png
│       ├── jennifer_tuason.png
│       ├── david_williams.png
│       ├── angela_santos.png
│       ├── robert_johnson.png
│       ├── michelle_reyes.png
│       └── carlos_fernandez.png
└── resumes/
    ├── maria_garcia_resume.html
    ├── john_smith_resume.html
    ├── sarah_chen_resume.html
    ├── miguel_rodriguez_resume.html
    ├── jennifer_tuason_resume.html
    ├── david_williams_resume.html
    ├── angela_santos_resume.html
    ├── robert_johnson_resume.html
    ├── michelle_reyes_resume.html
    └── carlos_fernandez_resume.html
```

## Test Candidate Profiles

### 1. Maria Garcia - Customer Service Representative
- **Email**: maria.garcia@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 5 years in customer service
- **Specialty**: Inbound customer support, excellent communication skills

### 2. John Smith - Technical Support Specialist
- **Email**: john.smith@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 4 years in technical support
- **Specialty**: IT helpdesk, troubleshooting, software support

### 3. Sarah Chen - Data Entry Specialist
- **Email**: sarah.chen@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 3 years in data management
- **Specialty**: High typing speed (75 WPM), accuracy, data verification

### 4. Miguel Rodriguez - Sales Support Representative
- **Email**: miguel.rodriguez@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 6 years in sales support
- **Specialty**: Lead generation, CRM management, client relations

### 5. Jennifer Tuason - Account Management Specialist
- **Email**: jennifer.tuason@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 7 years in account management
- **Specialty**: Client retention, upselling, relationship building

### 6. David Williams - Quality Assurance Analyst
- **Email**: david.williams@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 4 years in QA
- **Specialty**: Call monitoring, quality metrics, process improvement

### 7. Angela Santos - Email Support Specialist
- **Email**: angela.santos@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 3 years in email support
- **Specialty**: Written communication, ticket management, multi-tasking

### 8. Robert Johnson - Chat Support Agent
- **Email**: robert.johnson@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 5 years in live chat support
- **Specialty**: Concurrent chat handling, fast response times, empathy

### 9. Michelle Reyes - Back Office Processor
- **Email**: michelle.reyes@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 4 years in back office
- **Specialty**: Document processing, compliance, administrative support

### 10. Carlos Fernandez - Team Leader
- **Email**: carlos.fernandez@testbpo.com
- **Password**: TestBPO2024!
- **Experience**: 8 years (5 as agent, 3 as team lead)
- **Specialty**: Team management, coaching, performance monitoring

## How to Use

### Option 1: Automated Upload (Fastest) ⚡

**Complete automation in ~2 minutes:**

```bash
# Navigate to test_candidates directory
cd test_candidates

# Install dependencies
npm install

# Run automated upload (requires Supabase credentials in .env.local)
npm run upload
```

This will automatically:
- ✅ Create all 10 Supabase Auth accounts
- ✅ Insert candidate records
- ✅ Insert all profile data
- ✅ Insert work experiences, education, and skills
- ✅ Upload all profile and cover photos to Supabase Storage

**Requirements:**
- Supabase URL and Service Role Key in your `.env.local`
- Supabase Storage buckets: `candidate-avatars` and `candidate-covers` (created automatically if using default setup)

### Option 2: Manual Account Creation (For Learning/Testing)
1. **Create User Accounts:**
   - Navigate to the registration page
   - Create accounts using the emails and passwords listed above
   - Use `TestBPO2024!` as the password for all accounts

2. **Fill Profile Information:**
   - Use the data in `candidate_data.json` to fill in profile information
   - Copy bio, position, work status, salary expectations, etc.

3. **Upload Profile & Cover Photos:**
   - Upload profile photo from `images/profiles/[candidate_name].png`
   - Upload cover photo from `images/covers/[candidate_name].png`
   - See `IMAGE_MAPPING.md` for exact filename mapping

4. **Generate and Upload Resume:**
   - Open the corresponding HTML resume from `resumes/[candidate_name]_resume.html` in your browser
   - Use File > Print > Save as PDF (or Cmd/Ctrl + P)
   - Upload the generated PDF to the platform

### Option 2: Automated Script (For Bulk Testing)
1. Use `candidate_data.json` to programmatically create accounts via API
2. Upload images to Supabase Storage using the file paths in `IMAGE_MAPPING.md`
3. Convert HTML resumes to PDF using a headless browser (Puppeteer, Playwright)
4. Associate all data with candidate profiles via database inserts

### Generating PDF Resumes

To regenerate HTML resumes or convert to PDF:

```bash
# Regenerate HTML resumes
python3 generate_resumes.py

# Convert HTML to PDF (using browser)
# Open any .html file in resumes/ folder
# Press Cmd+P (Mac) or Ctrl+P (Windows)
# Select "Save as PDF"
```

### Testing the Complete Flow

1. **Registration**: Create account with email/password
2. **Profile Setup**: Fill in all candidate_profile fields
3. **Upload Assets**: Profile photo, cover photo, resume PDF
4. **Work Experience**: Add entries from work_experiences array
5. **Education**: Add entries from educations array
6. **Skills**: Add entries from skills array
7. **AI Analysis**: Trigger analysis on completed profile

## Notes

- All passwords are set to: **TestBPO2024!**
- All candidates are based in the Philippines (various cities)
- Each candidate has realistic work history, education, and skills
- Profiles are designed to test different BPO job categories
- All data is fictional and for testing purposes only
