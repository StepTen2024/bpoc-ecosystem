#!/usr/bin/env python3
"""
Generate HTML resumes for all test candidates that can be printed to PDF
"""
import json
from datetime import datetime

def format_date(date_str):
    """Format date string to readable format"""
    if not date_str:
        return "Present"
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        return date_obj.strftime("%B %Y")
    except:
        return date_str

def create_html_resume(candidate_data, output_path):
    """Generate a professional HTML resume for a candidate"""
    
    profile = candidate_data.get('profile', {})
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - {candidate_data['first_name']} {candidate_data['last_name']}</title>
    <style>
        @media print {{
            body {{ margin: 0; padding: 20px; }}
            @page {{ size: letter; margin: 0.75in; }}
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2563eb;
        }}
        
        h1 {{
            font-size: 32px;
            color: #1a1a1a;
            margin-bottom: 8px;
        }}
        
        .subtitle {{
            font-size: 16px;
            color: #666;
            margin-bottom: 6px;
        }}
        
        .contact-info {{
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }}
        
        .section {{
            margin-bottom: 25px;
        }}
        
        .section-title {{
            font-size: 18px;
            color: #2563eb;
            font-weight: bold;
            margin-bottom: 12px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e5e7eb;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        
        .job-entry {{
            margin-bottom: 20px;
        }}
        
        .job-title {{
            font-size: 14px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 4px;
        }}
        
        .company {{
            font-size: 12px;
            color: #666;
            font-style: italic;
            margin-bottom: 8px;
        }}
        
        .description {{
            font-size: 11px;
            margin-bottom: 8px;
            text-align: justify;
        }}
        
        .list-title {{
            font-weight: bold;
            font-size: 11px;
            margin-top: 8px;
            margin-bottom: 4px;
        }}
        
        ul {{
            margin-left: 20px;
            font-size: 11px;
        }}
        
        ul li {{
            margin-bottom: 4px;
        }}
        
        .skills-category {{
            margin-bottom: 8px;
            font-size: 11px;
        }}
        
        .skills-category strong {{
            color: #1a1a1a;
        }}
        
        .additional-info {{
            font-size: 11px;
            margin-bottom: 6px;
        }}
        
        .education-entry {{
            margin-bottom: 15px;
        }}
        
        .degree {{
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 4px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{candidate_data['first_name']} {candidate_data['last_name']}</h1>
"""
    
    if profile.get('position'):
        html += f'        <div class="subtitle">{profile["position"]}</div>\n'
    
    contact_parts = []
    if candidate_data.get('email'):
        contact_parts.append(candidate_data['email'])
    if profile.get('phone'):
        contact_parts.append(profile['phone'])
    if profile.get('location'):
        contact_parts.append(profile['location'])
    
    if contact_parts:
        html += f'        <div class="contact-info">{" | ".join(contact_parts)}</div>\n'
    
    if profile.get('linkedin'):
        html += f'        <div class="contact-info">{profile["linkedin"]}</div>\n'
    
    html += '    </div>\n\n'
    
    # Professional Summary
    if profile.get('bio'):
        html += f'''    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p class="description">{profile["bio"]}</p>
    </div>

'''
    
    # Work Experience
    if candidate_data.get('work_experiences'):
        html += '    <div class="section">\n'
        html += '        <div class="section-title">Work Experience</div>\n'
        
        for exp in candidate_data['work_experiences']:
            html += '        <div class="job-entry">\n'
            html += f'            <div class="job-title">{exp["job_title"]}</div>\n'
            
            company_line = f'{exp["company_name"]}, {exp["location"]}'
            if exp.get('start_date'):
                date_range = f'{format_date(exp["start_date"])} - {format_date(exp.get("end_date"))}'
                company_line += f' | {date_range}'
            
            html += f'            <div class="company">{company_line}</div>\n'
            
            if exp.get('description'):
                html += f'            <p class="description">{exp["description"]}</p>\n'
            
            if exp.get('responsibilities'):
                html += '            <div class="list-title">Key Responsibilities:</div>\n'
                html += '            <ul>\n'
                for resp in exp['responsibilities']:
                    html += f'                <li>{resp}</li>\n'
                html += '            </ul>\n'
            
            if exp.get('achievements'):
                html += '            <div class="list-title">Key Achievements:</div>\n'
                html += '            <ul>\n'
                for ach in exp['achievements']:
                    html += f'                <li>{ach}</li>\n'
                html += '            </ul>\n'
            
            html += '        </div>\n'
        
        html += '    </div>\n\n'
    
    # Education
    if candidate_data.get('educations'):
        html += '    <div class="section">\n'
        html += '        <div class="section-title">Education</div>\n'
        
        for edu in candidate_data['educations']:
            html += '        <div class="education-entry">\n'
            
            degree_text = f'{edu.get("degree", "")} in {edu.get("field_of_study", "")}'
            html += f'            <div class="degree">{degree_text}</div>\n'
            
            school_line = edu['institution']
            if edu.get('start_date'):
                date_range = f'{format_date(edu["start_date"])} - {format_date(edu.get("end_date"))}'
                school_line += f' | {date_range}'
            if edu.get('grade'):
                school_line += f' | {edu["grade"]}'
            
            html += f'            <div class="company">{school_line}</div>\n'
            
            if edu.get('description'):
                html += f'            <p class="description">{edu["description"]}</p>\n'
            
            html += '        </div>\n'
        
        html += '    </div>\n\n'
    
    # Skills
    if candidate_data.get('skills'):
        html += '    <div class="section">\n'
        html += '        <div class="section-title">Skills</div>\n'
        
        # Group skills by category
        skills_by_category = {}
        for skill in candidate_data['skills']:
            category = skill.get('category', 'Other')
            if category not in skills_by_category:
                skills_by_category[category] = []
            
            skill_text = skill['name']
            if skill.get('proficiency_level'):
                skill_text += f" ({skill['proficiency_level'].capitalize()})"
            
            skills_by_category[category].append(skill_text)
        
        for category, skills in skills_by_category.items():
            html += f'        <div class="skills-category"><strong>{category}:</strong> {", ".join(skills)}</div>\n'
        
        html += '    </div>\n\n'
    
    # Additional Information
    additional_info = []
    
    if profile.get('work_status'):
        status_map = {
            'actively_looking': 'Actively seeking opportunities',
            'open_to_opportunities': 'Open to new opportunities',
            'employed_but_looking': 'Employed but open to opportunities'
        }
        status = status_map.get(profile['work_status'], profile['work_status'])
        additional_info.append(f'<strong>Status:</strong> {status}')
    
    if profile.get('preferred_work_setup'):
        setup = profile['preferred_work_setup'].capitalize()
        additional_info.append(f'<strong>Preferred Work Setup:</strong> {setup}')
    
    if profile.get('preferred_shift'):
        shift = profile['preferred_shift'].capitalize()
        additional_info.append(f'<strong>Preferred Shift:</strong> {shift}')
    
    if profile.get('expected_salary_min') and profile.get('expected_salary_max'):
        currency = profile.get('currency', 'PHP')
        salary = f'{currency} {profile["expected_salary_min"]:,} - {profile["expected_salary_max"]:,}'
        additional_info.append(f'<strong>Expected Salary:</strong> {salary}')
    
    if additional_info:
        html += '    <div class="section">\n'
        html += '        <div class="section-title">Additional Information</div>\n'
        for info in additional_info:
            html += f'        <div class="additional-info">{info}</div>\n'
        html += '    </div>\n'
    
    html += '''</body>
</html>'''
    
    # Save HTML file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✓ Generated HTML resume for {candidate_data['first_name']} {candidate_data['last_name']}")

def main():
    # Load candidate data
    with open('test_candidates/candidate_data.json', 'r') as f:
        data = json.load(f)
    
    print("Generating HTML resumes for all candidates...\n")
    
    # Generate a resume for each candidate
    for candidate in data['candidates']:
        # Create filename from name
        first = candidate['first_name'].lower()
        last = candidate['last_name'].lower()
        filename = f"test_candidates/resumes/{first}_{last}_resume.html"
        
        create_html_resume(candidate, filename)
    
    print(f"\n✓ Successfully generated {len(data['candidates'])} HTML resumes in test_candidates/resumes/")
    print("✓ Open any HTML file in a browser and use 'Print to PDF' to create PDF versions")
    print("✓ All profile images saved in test_candidates/images/profiles/")
    print("✓ All cover images saved in test_candidates/images/covers/")

if __name__ == "__main__":
    main()
