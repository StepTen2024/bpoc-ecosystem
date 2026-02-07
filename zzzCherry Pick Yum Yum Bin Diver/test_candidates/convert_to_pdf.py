#!/usr/bin/env python3
"""
Convert HTML resumes to PDF using weasyprint
"""
import json
import subprocess
import os

def convert_html_to_pdf(html_file, pdf_file):
    """Convert HTML to PDF using wkhtmltopdf or browser print"""
    try:
        # Try using wkhtmltopdf if available
        result = subprocess.run(
            ['wkhtmltopdf', html_file, pdf_file],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print(f"✓ {os.path.basename(pdf_file)}")
            return True
    except FileNotFoundError:
        pass
    
    # Fallback: instructions for manual conversion
    return False

# Load candidate data
with open('candidate_data.json', 'r') as f:
    data = json.load(f)

print("Converting HTML resumes to PDF...\n")

success = 0
for candidate in data['candidates']:
    first = candidate['first_name'].lower()
    last = candidate['last_name'].lower()
    
    html_file = f"resumes/{first}_{last}_resume.html"
    pdf_file = f"resumes/{first}_{last}_resume.pdf"
    
    if convert_html_to_pdf(html_file, pdf_file):
        success += 1

if success == 0:
    print("❌ wkhtmltopdf not found. Installing it now...")
    print("\nRun: brew install wkhtmltopdf")
    print("Then run this script again.\n")
else:
    print(f"\n✓ Converted {success}/{len(data['candidates'])} resumes to PDF")
