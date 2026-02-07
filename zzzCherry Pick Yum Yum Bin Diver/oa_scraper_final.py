#!/usr/bin/env python3
"""
Outsource Accelerator Philippines BPO Directory Scraper
Extracts all 700+ Philippines companies with full details
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import csv
from typing import List, Dict, Optional
from urllib.parse import urljoin
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - %(message)s'
)
logger = logging.getLogger(__name__)


class OAPhilippinesScraper:
    """Scrapes Outsource Accelerator directory for Philippines BPOs"""

    def __init__(self, timeout: int = 15, delay: float = 1.5):
        self.base_url = "https://www.outsourceaccelerator.com/directory/"
        self.companies = []
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        self.timeout = timeout
        self.delay = delay

    def fetch_page(self, page_num: int = 1) -> Optional[str]:
        """Fetch a directory page"""
        params = {
            'paged': page_num,
            'posts_per_page': 25  # Match default page size
        }

        try:
            logger.info(f"📄 Fetching page {page_num}...")
            response = self.session.get(
                self.base_url,
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()

            if 'No companies found' in response.text or len(response.text) < 1000:
                logger.warning(f"Page {page_num} returned empty or minimal content")
                return None

            return response.text

        except requests.exceptions.Timeout:
            logger.error(f"⏱️ Timeout fetching page {page_num}")
            return None
        except requests.exceptions.ConnectionError:
            logger.error(f"🔌 Connection error on page {page_num}")
            return None
        except Exception as e:
            logger.error(f"❌ Error fetching page {page_num}: {e}")
            return None

    def extract_company_data(self, company_element) -> Optional[Dict]:
        """Extract data from a single company listing element"""
        try:
            name_link = company_element.find(['h3', 'h4', 'a'])
            if not name_link:
                return None

            name = name_link.get_text(strip=True)
            profile_url = name_link.get('href', '')

            if not name or name == '' or len(name) < 2:
                return None

            description = ''
            desc_p = company_element.find('p')
            if desc_p:
                description = desc_p.get_text(strip=True)[:300]

            glassdoor = 'N/A'
            rank = 'N/A'
            seats = 'N/A'
            domain_authority = 'N/A'
            revenue = 'N/A'
            founded = 'N/A'
            locations = 'N/A'
            sectors = []

            text_elements = company_element.find_all(string=True)

            for i, elem in enumerate(text_elements):
                text = elem.strip()

                if 'Glassdoor rating' in text:
                    try:
                        next_elem = text_elements[i+1] if i+1 < len(text_elements) else None
                        if next_elem:
                            glassdoor = next_elem.strip()
                    except:
                        pass

                if text.startswith('Rank'):
                    try:
                        next_elem = text_elements[i+1] if i+1 < len(text_elements) else None
                        if next_elem:
                            rank = next_elem.strip()
                    except:
                        pass

                if 'Seat:' in text:
                    try:
                        next_elem = text_elements[i+1] if i+1 < len(text_elements) else None
                        if next_elem:
                            seats = next_elem.strip()
                    except:
                        pass

                if 'DA:' in text or 'Domain Authority' in text:
                    try:
                        for j in range(i+1, min(i+4, len(text_elements))):
                            if text_elements[j].strip() and not any(c.isalpha() for c in text_elements[j].strip()[:3]):
                                domain_authority = text_elements[j].strip()
                                break
                    except:
                        pass

                if 'Revenue:' in text:
                    try:
                        next_elem = text_elements[i+1] if i+1 < len(text_elements) else None
                        if next_elem:
                            revenue = next_elem.strip()
                    except:
                        pass

                if 'Founded:' in text:
                    try:
                        next_elem = text_elements[i+1] if i+1 < len(text_elements) else None
                        if next_elem:
                            founded = next_elem.strip()
                    except:
                        pass

                if 'Locations:' in text:
                    try:
                        next_elem = text_elements[i+1] if i+1 < len(text_elements) else None
                        if next_elem:
                            locations = next_elem.strip()
                    except:
                        pass

            sector_containers = company_element.find_all(['li', 'span'], class_=lambda x: x and 'sector' in x.lower())
            for sector in sector_containers:
                sector_text = sector.get_text(strip=True)
                if sector_text and sector_text not in sectors:
                    sectors.append(sector_text)

            sectors = sectors[:10]

            # Filter for Philippines companies only
            if locations == 'N/A' or 'philippines' not in locations.lower():
                # Check description and name as fallback
                full_text = f"{name} {description} {locations}".lower()
                if 'philippines' not in full_text and 'manila' not in full_text and 'cebu' not in full_text and 'davao' not in full_text:
                    return None  # Not a Philippines company

            company_data = {
                'name': name.strip(),
                'profile_url': profile_url,
                'description': description,
                'glassdoor_rating': glassdoor,
                'rank': rank,
                'employee_seats': seats,
                'domain_authority': domain_authority,
                'revenue': revenue,
                'founded': founded,
                'locations': locations,
                'sectors': ', '.join(sectors) if sectors else 'N/A',
                'country': 'Philippines'
            }

            return company_data

        except Exception as e:
            logger.debug(f"Error parsing company element: {e}")
            return None

    def parse_page_content(self, html: str) -> List[Dict]:
        """Parse all companies from page HTML"""
        if not html:
            return []

        soup = BeautifulSoup(html, 'html.parser')
        companies_on_page = []

        selectors = [
            ('div[class*="company"]', 'div with company class'),
            ('article', 'article tags'),
            ('div[class*="listing"]', 'div with listing class'),
            ('div[class*="bpo"]', 'div with bpo class'),
        ]

        company_elements = []
        for selector, description in selectors:
            try:
                elements = soup.select(selector)
                if elements and len(elements) > 2:
                    logger.debug(f"  → Using selector: {description} ({len(elements)} elements)")
                    company_elements = elements
                    break
            except:
                continue

        if not company_elements:
            logger.debug("  → Trying generic div approach...")
            all_divs = soup.find_all('div', recursive=True)
            for div in all_divs:
                links = div.find_all('a', limit=1)
                if links and len(div.get_text()) > 100:
                    company_elements.append(div)

        logger.info(f"  📦 Found {len(company_elements)} potential company elements")

        for i, element in enumerate(company_elements):
            company = self.extract_company_data(element)
            if company:
                companies_on_page.append(company)
                logger.debug(f"    ✓ {company['name']}")

        logger.info(f"  ✅ Extracted {len(companies_on_page)} Philippines companies from page")
        return companies_on_page

    def scrape_all_pages(self, max_pages: Optional[int] = None) -> List[Dict]:
        """Scrape all pages of Philippines BPOs"""
        page = 1
        consecutive_empty = 0

        while True:
            logger.info(f"\n{'='*70}")
            logger.info(f"PAGE {page} | Total so far: {len(self.companies)}")
            logger.info(f"{'='*70}")

            html = self.fetch_page(page)

            if not html:
                consecutive_empty += 1
                if consecutive_empty >= 2:
                    logger.info("🛑 No more pages available (2 consecutive failures)")
                    break
                page += 1
                time.sleep(self.delay)
                continue

            companies_on_page = self.parse_page_content(html)

            if not companies_on_page:
                consecutive_empty += 1
                if consecutive_empty >= 3:
                    logger.info("🛑 Reached end of results (3 consecutive empty pages)")
                    break
                page += 1
                time.sleep(self.delay)
                continue

            consecutive_empty = 0
            self.companies.extend(companies_on_page)

            time.sleep(self.delay)

            if max_pages and page >= max_pages:
                logger.info(f"⏹️ Reached max pages limit ({max_pages})")
                break

            page += 1

        return self.companies

    def remove_duplicates(self):
        """Remove duplicate entries"""
        seen_names = set()
        unique_companies = []

        for company in self.companies:
            name_lower = company['name'].lower().strip()
            if name_lower not in seen_names:
                seen_names.add(name_lower)
                unique_companies.append(company)

        removed = len(self.companies) - len(unique_companies)
        self.companies = unique_companies

        if removed > 0:
            logger.info(f"🧹 Removed {removed} duplicate entries")

    def save_json(self, filename: str = 'oa_philippines_bpos.json'):
        """Save to JSON"""
        output = {
            'metadata': {
                'source': 'Outsource Accelerator Directory',
                'country': 'Philippines',
                'total_companies': len(self.companies),
                'scrape_timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            },
            'companies': self.companies
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        logger.info(f"\n💾 Saved to {filename}")

    def save_csv(self, filename: str = 'oa_philippines_bpos.csv'):
        """Save to CSV for spreadsheet import"""
        if not self.companies:
            logger.warning("No companies to export")
            return

        fieldnames = self.companies[0].keys()

        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.companies)

        logger.info(f"📊 Saved to {filename}")

    def print_summary(self):
        """Print final summary"""
        logger.info(f"\n{'='*70}")
        logger.info(f"✅ SCRAPING COMPLETE")
        logger.info(f"{'='*70}")
        logger.info(f"Total companies scraped: {len(self.companies)}")

        if self.companies:
            counts = {}
            for company in self.companies:
                seats = company['employee_seats']
                counts[seats] = counts.get(seats, 0) + 1

            logger.info(f"\n📊 Companies by Employee Size:")
            for size, count in sorted(counts.items()):
                logger.info(f"  {size}: {count}")

            logger.info(f"\n🏢 Sample Companies (first 10):")
            for i, company in enumerate(self.companies[:10], 1):
                logger.info(f"  {i}. {company['name']}")
                if company['revenue'] != 'N/A':
                    logger.info(f"     Revenue: {company['revenue']}")
                if company['employee_seats'] != 'N/A':
                    logger.info(f"     Employees: {company['employee_seats']}")


def main():
    """Main execution"""
    logger.info("🚀 Starting Outsource Accelerator Philippines Scraper")
    logger.info(f"📍 Target: https://www.outsourceaccelerator.com/directory/")
    logger.info(f"📋 Filtering for Philippines companies only")
    logger.info(f"⏳ This will take 10-20 minutes to scan all pages\n")

    scraper = OAPhilippinesScraper(timeout=20, delay=1.5)

    try:
        companies = scraper.scrape_all_pages(max_pages=200)  # ~196 pages according to site
        scraper.remove_duplicates()
        scraper.save_json('oa_philippines_bpos.json')
        scraper.save_csv('oa_philippines_bpos.csv')
        scraper.print_summary()

        logger.info(f"\n✨ Done! Files created:")
        logger.info(f"   - oa_philippines_bpos.json")
        logger.info(f"   - oa_philippines_bpos.csv")

    except KeyboardInterrupt:
        logger.info("\n⚠️ Scraping interrupted by user")
        logger.info(f"Companies scraped so far: {len(scraper.companies)}")
        scraper.save_json('oa_philippines_bpos_partial.json')
    except Exception as e:
        logger.error(f"\n💥 Fatal error: {e}")
        raise


if __name__ == '__main__':
    main()
