#!/usr/bin/env python3
"""
Create simple TXT files with all candidate details
"""
import json
from datetime import datetime

def format_date(date_str):
    """Format date string"""
    if not date_str:
        return "Present"
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        return date_obj.strftime("%B %Y")
    except:
        return date_str

def create_txt_file(candidate, output_path):
    """Create a simple TXT file with all candidate details"""
    
    profile = candidate.get('profile', {})
    
    txt = f"""================================================================================
CANDIDATE PROFILE - {candidate['first_name'].upper()} {candidate['last_name'].upper()}
================================================================================

LOGIN CREDENTIALS
-----------------
Email: {candidate['email']}
Password: {candidate['password']}
Username: {candidate['username']}

PERSONAL INFORMATION
--------------------
Full Name: {candidate['first_name']} {candidate['last_name']}
Position: {profile.get('position', '')}
Birthday: {profile.get('birthday', '')}
Gender: {profile.get('gender', '').capitalize()}
Phone: {profile.get('phone', '')}

LOCATION
--------
Address: {profile.get('location', '')}
City: {profile.get('location_city', '')}
Province: {profile.get('location_province', '')}
Country: {profile.get('location_country', '')}
Region: {profile.get('location_region', '')}

PROFESSIONAL BIO
----------------
{profile.get('bio', '')}

HEADLINE
--------
{profile.get('headline', '')}

WORK PREFERENCES
----------------
Work Status: {profile.get('work_status', '').replace('_', ' ').title()}
Preferred Shift: {profile.get('preferred_shift', '').capitalize()}
Preferred Work Setup: {profile.get('preferred_work_setup', '').capitalize()}
Expected Salary: {profile.get('currency', 'PHP')} {profile.get('expected_salary_min', 0):,} - {profile.get('expected_salary_max', 0):,}

SOCIAL LINKS
------------
LinkedIn: {profile.get('linkedin', '')}

"""

    # Work Experience
    if candidate.get('work_experiences'):
        txt += "================================================================================\n"
        txt += "WORK EXPERIENCE\n"
        txt += "================================================================================\n\n"
        
        for exp in candidate['work_experiences']:
            txt += f"{exp['job_title']}\n"
            txt += f"{exp['company_name']}, {exp['location']}\n"
            txt += f"{format_date(exp.get('start_date'))} - {format_date(exp.get('end_date'))}\n"
            if exp.get('is_current'):
                txt += "(Current Position)\n"
            txt += f"\n{exp.get('description', '')}\n\n"
            
            if exp.get('responsibilities'):
                txt += "Key Responsibilities:\n"
                for resp in exp['responsibilities']:
                    txt += f"  • {resp}\n"
                txt += "\n"
            
            if exp.get('achievements'):
                txt += "Key Achievements:\n"
                for ach in exp['achievements']:
                    txt += f"  • {ach}\n"
                txt += "\n"
            
            txt += "-" * 80 + "\n\n"
    
    # Education
    if candidate.get('educations'):
        txt += "================================================================================\n"
        txt += "EDUCATION\n"
        txt += "================================================================================\n\n"
        
        for edu in candidate['educations']:
            txt += f"{edu.get('degree', '')} in {edu.get('field_of_study', '')}\n"
            txt += f"{edu['institution']}\n"
            txt += f"{format_date(edu.get('start_date'))} - {format_date(edu.get('end_date'))}\n"
            if edu.get('grade'):
                txt += f"Grade: {edu['grade']}\n"
            if edu.get('description'):
                txt += f"\n{edu['description']}\n"
            txt += "\n" + "-" * 80 + "\n\n"
    
    # Skills
    if candidate.get('skills'):
        txt += "================================================================================\n"
        txt += "SKILLS\n"
        txt += "================================================================================\n\n"
        
        # Group by category
        skills_by_cat = {}
        for skill in candidate['skills']:
            cat = skill.get('category', 'Other')
            if cat not in skills_by_cat:
                skills_by_cat[cat] = []
            
            skill_txt = f"{skill['name']}"
            if skill.get('proficiency_level'):
                skill_txt += f" ({skill['proficiency_level'].capitalize()})"
            if skill.get('years_experience'):
                skill_txt += f" - {skill['years_experience']} years"
            
            skills_by_cat[cat].append(skill_txt)
        
        for category, skills in skills_by_cat.items():
            txt += f"{category}:\n"
            for skill in skills:
                txt += f"  • {skill}\n"
            txt += "\n"
    
    txt += "================================================================================\n"
    txt += "END OF PROFILE\n"
    txt += "================================================================================\n"
    
    # Save file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(txt)
    
    print(f"✓ {output_path}")

def main():
    # Load candidate data
    with open('candidate_data.json', 'r') as f:
        data = json.load(f)
    
    print("Creating TXT profile files...\n")
    
    for candidate in data['candidates']:
        first = candidate['first_name'].lower()
        last = candidate['last_name'].lower()
        filename = f"profiles/{first}_{last}_profile.txt"
        
        create_txt_file(candidate, filename)
    
    print(f"\n✓ Created {len(data['candidates'])} TXT profile files")

if __name__ == "__main__":
    main()
