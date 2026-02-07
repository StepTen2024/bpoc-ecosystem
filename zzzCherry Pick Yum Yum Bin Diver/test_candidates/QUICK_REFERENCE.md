# Test Candidates - Quick Reference

## All Login Credentials
**Universal Password for All Accounts:** `TestBPO2024!`

| # | Name | Email | Position |
|---|------|-------|----------|
| 1 | Maria Garcia | maria.garcia@testbpo.com | Customer Service Representative |
| 2 | John Smith | john.smith@testbpo.com | Technical Support Specialist |
| 3 | Sarah Chen | sarah.chen@testbpo.com | Data Entry Specialist |
| 4 | Miguel Rodriguez | miguel.rodriguez@testbpo.com | Sales Support Representative |
| 5 | Jennifer Tuason | jennifer.tuason@testbpo.com | Account Management Specialist |
| 6 | David Williams | david.williams@testbpo.com | Quality Assurance Analyst |
| 7 | Angela Santos | angela.santos@testbpo.com | Email Support Specialist |
| 8 | Robert Johnson | robert.johnson@testbpo.com | Chat Support Agent |
| 9 | Michelle Reyes | michelle.reyes@testbpo.com | Back Office Processor |
| 10 | Carlos Fernandez | carlos.fernandez@testbpo.com | Team Leader |

## What's Included for Each Candidate

✅ **Complete Profile Data** - Bio, contact info, preferences, work status  
✅ **Work Experience** - Detailed job history with responsibilities and achievements  
✅ **Education** - Degree, institution, dates  
✅ **Skills** - Categorized with proficiency levels  
✅ **Profile Photo** - 1:1 square professional headshot  
✅ **Cover Photo** - 16:9 banner image  
✅ **Resume** - HTML format (convertible to PDF)  

## File Locations

```
test_candidates/
├── candidate_data.json          # All data in structured JSON
├── IMAGE_MAPPING.md             # Image-to-candidate guide  
├── README.md                    # Full documentation
├── QUICK_REFERENCE.md           # This file
├── generate_resumes.py          # Python script for resumes
├── images/
│   ├── profiles/                # Profile photos (1:1)
│   └── covers/                  # Cover photos (16:9)
└── resumes/                     # HTML resumes
```

## Quick Start

### Option A: Automated Upload (Fastest)
```bash
cd test_candidates
npm install
node upload_candidates.js
```

This will automatically:
- Create all 10 auth accounts
- Insert all profile data
- Upload all images
- Complete in ~2 minutes

### Option B: Manual Testing (Detailed)

#### 1. Create an Account
```
Email: maria.garcia@testbpo.com
Password: TestBPO2024!
```

#### 2. Fill Profile
Open `candidate_data.json` and copy data for Maria Garcia

#### 3. Upload Images
- Profile: `images/profiles/maria_garcia.png`
- Cover: `images/covers/maria_garcia.png`

### 4. Upload Resume
- Open `resumes/maria_garcia_resume.html` in browser
- Print to PDF (Cmd+P / Ctrl+P)
- Upload the PDF

### 5. Repeat for Other Candidates
Follow the same pattern for all 10 test candidates

## Database Tables Coverage

This test data is designed to populate:

- ✅ `candidates` - Basic account info
- ✅ `candidate_profiles` - Extended profile data
- ✅ `candidate_work_experiences` - Job history
- ✅ `candidate_educations` - Academic background
- ✅ `candidate_skills` - Skills with proficiency
- ✅ `candidate_resumes` - Resume files (after upload)
- ✅ `candidate_ai_analysis` - Ready for AI analysis

## Testing Scenarios

### Diversity of Profiles
- **Entry Level:** Sarah Chen (3 years), Angela Santos (3 years)
- **Mid Level:** Maria Garcia (5 years), John Smith (4 years), Robert Johnson (5 years), David Williams (4 years), Michelle Reyes (4 years)
- **Senior Level:** Miguel Rodriguez (6 years), Jennifer Tuason (7 years)
- **Leadership:** Carlos Fernandez (8 years, Team Leader)

### Different BPO Roles
- Customer Service
- Technical Support  
- Data Entry
- Sales Support
- Account Management
- Quality Assurance
- Email Support
- Chat Support
- Back Office
- Team Leadership

### Various Locations
- Metro Manila: Quezon City, Pasig, Makati, BGC, Manila, Alabang
- Cebu: Cebu City
- Davao: Davao City

### Work Setup Preferences
- Remote
- Hybrid
- Onsite

## Tips for Testing

1. **Start with 1-2 candidates** to understand the flow
2. **Test different roles** to validate job-specific features
3. **Use varied locations** to test location-based features
4. **Try different work setups** to test filtering
5. **Check AI analysis** on complete profiles

## Need Help?

- Check `README.md` for detailed instructions
- See `IMAGE_MAPPING.md` for image locations
- Review `candidate_data.json` for complete data structure
