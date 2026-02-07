#!/usr/bin/env python3
"""
Smart BPO Company Finder using Serper & Perplexity APIs
Searches multiple sources to compile comprehensive Philippines BPO list
"""

import os
import json
import requests
import time
from typing import List, Dict, Set
from dotenv import load_dotenv

load_dotenv('.env.local')

SERPER_API_KEY = os.getenv('SERPER_API_KEY')
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')

class BPOCompanyFinder:
    def __init__(self):
        self.companies = []
        self.seen_names = set()

    def search_serper(self, query: str) -> List[Dict]:
        """Search Google via Serper API"""
        print(f"🔍 Searching: {query}")

        url = "https://google.serper.dev/search"
        headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        }
        payload = {
            'q': query,
            'num': 100  # Get up to 100 results
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()

            results = []

            # Extract organic results
            for result in data.get('organic', []):
                results.append({
                    'title': result.get('title', ''),
                    'link': result.get('link', ''),
                    'snippet': result.get('snippet', '')
                })

            print(f"  ✓ Found {len(results)} results")
            return results

        except Exception as e:
            print(f"  ✗ Error: {e}")
            return []

    def ask_perplexity(self, prompt: str) -> str:
        """Query Perplexity AI for structured data"""
        print(f"🤖 Asking Perplexity: {prompt[:80]}...")

        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            'model': 'llama-3.1-sonar-large-128k-online',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a business research assistant. Provide accurate, structured data about companies.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.2,
            'max_tokens': 4000
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()

            content = data['choices'][0]['message']['content']
            print(f"  ✓ Got response ({len(content)} chars)")
            return content

        except Exception as e:
            print(f"  ✗ Error: {e}")
            return ""

    def extract_companies_from_text(self, text: str, source: str) -> List[Dict]:
        """Extract company names and details from text"""
        companies = []

        # Look for common patterns: company names followed by descriptions
        lines = text.split('\n')
        current_company = None

        for line in lines:
            line = line.strip()

            # Skip empty lines
            if not line:
                continue

            # Look for bullet points or numbered lists
            if line.startswith(('- ', '* ', '• ')) or (len(line) > 0 and line[0].isdigit() and '.' in line[:3]):
                # Extract company name
                clean_line = line.lstrip('-*•0123456789. ').strip()

                # Check if it looks like a company name
                if len(clean_line) > 3 and len(clean_line) < 100:
                    # Split on common separators
                    parts = clean_line.split(' - ')
                    if len(parts) > 0:
                        company_name = parts[0].strip()

                        # Basic validation
                        if company_name and len(company_name) > 2:
                            company = {
                                'name': company_name,
                                'description': parts[1] if len(parts) > 1 else '',
                                'source': source,
                                'website': '',
                                'location': 'Philippines'
                            }
                            companies.append(company)

        return companies

    def search_all_sources(self):
        """Search multiple sources for BPO companies"""

        # Serper searches
        serper_queries = [
            "top BPO companies Philippines 2024",
            "largest call center companies Manila",
            "BPO companies Cebu Philippines",
            "outsourcing companies Philippines list",
            "IBPAP member companies Philippines",
            "IT-BPM companies Manila",
            "contact center Philippines companies",
            "shared services center Philippines",
            "offshoring companies Manila Cebu"
        ]

        all_serper_results = []
        for query in serper_queries:
            results = self.search_serper(query)
            all_serper_results.extend(results)
            time.sleep(1)  # Rate limiting

        print(f"\n📊 Total Serper results: {len(all_serper_results)}\n")

        # Perplexity queries
        perplexity_prompts = [
            """List the top 50 BPO (Business Process Outsourcing) companies in the Philippines with their:
            - Company name
            - Website (if available)
            - Primary location (city)
            - Brief description

            Format as a numbered list.""",

            """List 50 more major contact center and IT-BPM companies operating in Manila, Cebu, and Davao with:
            - Company name
            - Location
            - Website

            Format as a numbered list. Focus on companies NOT in the typical "top 10" lists.""",

            """List 50 medium-sized BPO and outsourcing firms in the Philippines (excluding the largest players like Concentrix, Teleperformance). Include:
            - Company name
            - City/location
            - Website

            Format as numbered list.""",

            """List IBPAP (IT and Business Process Association of the Philippines) member companies. Include:
            - Company name
            - Location
            - Website if known

            Format as numbered list. Provide at least 50 companies.""",

            """List BPO companies in Makati, Taguig, Ortigas, and Clark Freeport Zone Philippines:
            - Company name
            - Specific location
            - Website

            Format as numbered list. At least 50 companies."""
        ]

        all_perplexity_results = []
        for i, prompt in enumerate(perplexity_prompts, 1):
            print(f"\n--- Perplexity Query {i}/{len(perplexity_prompts)} ---")
            response = self.ask_perplexity(prompt)
            if response:
                companies = self.extract_companies_from_text(response, f'Perplexity-{i}')
                all_perplexity_results.extend(companies)
                print(f"  → Extracted {len(companies)} companies")
            time.sleep(2)  # Rate limiting

        print(f"\n📊 Total companies from Perplexity: {len(all_perplexity_results)}\n")

        # Combine and deduplicate
        for company in all_perplexity_results:
            name_lower = company['name'].lower().strip()
            if name_lower not in self.seen_names:
                self.seen_names.add(name_lower)
                self.companies.append(company)

        print(f"✅ Total unique companies: {len(self.companies)}")

    def save_results(self):
        """Save results to JSON and CSV"""
        # JSON
        output = {
            'metadata': {
                'source': 'Serper + Perplexity API Search',
                'country': 'Philippines',
                'total_companies': len(self.companies),
                'search_timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            },
            'companies': self.companies
        }

        with open('bpo_companies_search.json', 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Saved to bpo_companies_search.json")

        # CSV
        import csv
        with open('bpo_companies_search.csv', 'w', newline='', encoding='utf-8') as f:
            if self.companies:
                writer = csv.DictWriter(f, fieldnames=self.companies[0].keys())
                writer.writeheader()
                writer.writerows(self.companies)

        print(f"📊 Saved to bpo_companies_search.csv")

        # Print summary
        print(f"\n{'='*60}")
        print(f"✅ SEARCH COMPLETE")
        print(f"{'='*60}")
        print(f"Total companies found: {len(self.companies)}")
        print(f"\nSample companies (first 10):")
        for i, company in enumerate(self.companies[:10], 1):
            print(f"  {i}. {company['name']}")
            if company.get('location'):
                print(f"     Location: {company['location']}")


def main():
    if not SERPER_API_KEY or not PERPLEXITY_API_KEY:
        print("❌ Missing API keys in .env.local")
        print("   SERPER_API_KEY:", "✓" if SERPER_API_KEY else "✗")
        print("   PERPLEXITY_API_KEY:", "✓" if PERPLEXITY_API_KEY else "✗")
        return

    print("🚀 Starting Smart BPO Company Search")
    print("📍 Target: Philippines BPO/IT-BPM companies")
    print("🔧 Using: Serper + Perplexity APIs\n")

    finder = BPOCompanyFinder()
    finder.search_all_sources()
    finder.save_results()

    print(f"\n✨ Done! Check the generated files.")


if __name__ == '__main__':
    main()
