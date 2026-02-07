#!/usr/bin/env python3
"""
Import Outsource Accelerator data into Supabase bpo_companies_database
"""

import json
import re
import os
from typing import Optional
from supabase import create_client
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)


def parse_employee_count(seats_str: str) -> Optional[int]:
    """Convert seats string like '500-999' to average employee count"""
    if not seats_str or seats_str == 'N/A':
        return None

    try:
        if '-' in seats_str:
            parts = seats_str.split('-')
            if len(parts) == 2:
                min_val = int(parts[0].replace('+', '').strip())
                max_val = int(parts[1].replace('+', '').strip())
                return (min_val + max_val) // 2

        seats_str = seats_str.replace('+', '').strip()
        return int(seats_str)
    except:
        return None


def parse_revenue(revenue_str: str) -> Optional[str]:
    """Parse revenue string"""
    if not revenue_str or revenue_str == 'N/A':
        return None
    return revenue_str.strip()


def parse_year(year_str: str) -> Optional[int]:
    """Parse founded year"""
    if not year_str or year_str == 'N/A':
        return None

    try:
        match = re.search(r'\d{4}', year_str)
        if match:
            year = int(match.group())
            if 1900 < year < 2100:
                return year
    except:
        pass

    return None


def parse_services(sectors_str: str) -> list:
    """Parse services/sectors into list"""
    if not sectors_str or sectors_str == 'N/A':
        return []

    return [s.strip() for s in sectors_str.split(',') if s.strip()]


def import_companies_to_supabase(json_file: str):
    """Import companies from JSON to Supabase"""

    # Get credentials from environment
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not supabase_key:
        logger.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        logger.error("   Add these to your environment or .env file")
        return False

    # Initialize Supabase
    logger.info(f"🔌 Connecting to Supabase...")
    supabase = create_client(supabase_url, supabase_key)

    # Load data
    logger.info(f"📂 Loading {json_file}...")
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    companies = data.get('companies', [])
    total = len(companies)

    logger.info(f"📊 Found {total} companies to import\n")

    # Import companies
    imported = 0
    errors = 0

    for i, company in enumerate(companies, 1):
        try:
            company_record = {
                'company_name': company['name'],
                'company_legal_name': company['name'],
                'company_type': 'BPO',
                'website': company['profile_url'] if company['profile_url'] else None,
                'address': None,
                'city': None,
                'email': None,
                'phone': None,
                'employee_count_estimated': parse_employee_count(company['employee_seats']),
                'years_in_operation': None,
                'main_services': parse_services(company['sectors']),
                'linkedin_url': None,
                'tin': None,
                'confidence_score': 0.95,
                'data_sources': ['outsource_accelerator'],
                'verified_by_bpoc': False,
            }

            response = supabase.table('bpo_companies_database').insert(company_record).execute()
            imported += 1

            if i % 50 == 0:
                logger.info(f"  ✓ {i}/{total} companies imported...")

        except Exception as e:
            errors += 1
            logger.warning(f"  ⚠️ Error importing '{company['name']}': {str(e)[:100]}")

    logger.info(f"\n{'='*60}")
    logger.info(f"✅ IMPORT COMPLETE")
    logger.info(f"{'='*60}")
    logger.info(f"Imported: {imported}")
    logger.info(f"Errors: {errors}")
    logger.info(f"Total: {total}")

    if errors == 0:
        logger.info(f"\n🎉 All companies imported successfully!")
        return True
    else:
        logger.info(f"\n⚠️ {errors} companies failed - check errors above")
        return False


if __name__ == '__main__':
    success = import_companies_to_supabase('oa_philippines_bpos.json')
    exit(0 if success else 1)
