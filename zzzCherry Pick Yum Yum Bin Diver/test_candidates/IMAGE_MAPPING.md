# Test Candidate Image Mapping Guide

This document maps each test candidate to their profile and cover photo assets.

## Image Locations

- **Profile Photos (1:1 square):** `test_candidates/images/profiles/`
- **Cover Photos (16:9 horizontal):** `test_candidates/images/covers/`

## Candidate Image Mapping

### 1. Maria Garcia - Customer Service Representative
- **Profile Photo:** `images/profiles/maria_garcia.png`
- **Cover Photo:** `images/covers/maria_garcia.png`
- **Resume:** `resumes/maria_garcia_resume.html`

### 2. John Smith - Technical Support Specialist
- **Profile Photo:** `images/profiles/john_smith.png`
- **Cover Photo:** `images/covers/john_smith.png`
- **Resume:** `resumes/john_smith_resume.html`

### 3. Sarah Chen - Data Entry Specialist
- **Profile Photo:** `images/profiles/sarah_chen.png`
- **Cover Photo:** `images/covers/sarah_chen.png`
- **Resume:** `resumes/sarah_chen_resume.html`

### 4. Miguel Rodriguez - Sales Support Representative
- **Profile Photo:** `images/profiles/miguel_rodriguez.png`
- **Cover Photo:** `images/covers/miguel_rodriguez.png`
- **Resume:** `resumes/miguel_rodriguez_resume.html`

### 5. Jennifer Tuason - Account Management Specialist
- **Profile Photo:** `images/profiles/jennifer_tuason.png`
- **Cover Photo:** `images/covers/jennifer_tuason.png`
- **Resume:** `resumes/jennifer_tuason_resume.html`

### 6. David Williams - Quality Assurance Analyst
- **Profile Photo:** `images/profiles/david_williams.png`
- **Cover Photo:** `images/covers/david_williams.png`
- **Resume:** `resumes/david_williams_resume.html`

### 7. Angela Santos - Email Support Specialist
- **Profile Photo:** `images/profiles/angela_santos.png`
- **Cover Photo:** `images/covers/angela_santos.png`
- **Resume:** `resumes/angela_santos_resume.html`

### 8. Robert Johnson - Chat Support Agent
- **Profile Photo:** `images/profiles/robert_johnson.png`
- **Cover Photo:** `images/covers/robert_johnson.png`
- **Resume:** `resumes/robert_johnson_resume.html`

### 9. Michelle Reyes - Back Office Processor
- **Profile Photo:** `images/profiles/michelle_reyes.png`
- **Cover Photo:** `images/covers/michelle_reyes.png`
- **Resume:** `resumes/michelle_reyes_resume.html`

### 10. Carlos Fernandez - Team Leader
- **Profile Photo:** `images/profiles/carlos_fernandez.png`
- **Cover Photo:** `images/covers/carlos_fernandez.png`
- **Resume:** `resumes/carlos_fernandez_resume.html`

## Using the Images

### For Manual Testing:
1. Navigate to the candidate profile page
2. Upload the corresponding profile photo from `images/profiles/`
3. Upload the corresponding cover photo from `images/covers/`
4. Open the HTML resume in a browser and use File > Print > Save as PDF

### For Automated Testing:
The `candidate_data.json` file contains all the data needed to populate profiles programmatically. Images can be uploaded via your API or Supabase Storage.

## Image Specifications

### Profile Photos
- **Aspect Ratio:** 1:1 (Square)
- **Format:** PNG
- **Style:** Professional headshots appropriate for each role
- **Usage:** Avatar/profile picture in candidate profiles

### Cover Photos
- **Aspect Ratio:** 16:9 (Horizontal)
- **Format:** PNG
- **Style:** Professional banners matching each candidate's role
- **Usage:** Profile banner/header image

## Notes

All images are AI-generated and for testing purposes only. Each image is themed appropriately for the candidate's role and professional level.
