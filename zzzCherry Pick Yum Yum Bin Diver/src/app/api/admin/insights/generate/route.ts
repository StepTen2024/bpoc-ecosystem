import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || '';
const serperApiKey = process.env.SERPER_API_KEY || '';
const anthropic = new Anthropic({ apiKey });

// Get current date info
function getCurrentDateInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString('en-US', { month: 'long' });
  const day = now.getDate();
  return {
    year,
    month,
    day,
    full: `${month} ${day}, ${year}`,
    searchYear: year, // Use current year for searches
    prevYear: year - 1
  };
}

// Research real data using Serper
async function researchTopic(keyword: string, topic: string): Promise<{
  stats: any[];
  sources: any[];
  relatedQuestions: string[];
}> {
  if (!serperApiKey) {
    return { stats: [], sources: [], relatedQuestions: [] };
  }

  const dateInfo = getCurrentDateInfo();
  const results: any = { stats: [], sources: [], relatedQuestions: [] };

  try {
    // Search for statistics and data - use CURRENT year
    const statsSearch = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `${keyword} statistics data Philippines ${dateInfo.searchYear}`,
        num: 5,
        gl: 'ph',
        tbs: 'qdr:y' // Last year only - fresh content!
      })
    });
    const statsData = await statsSearch.json();
    results.stats = (statsData.organic || []).map((r: any) => ({
      title: r.title,
      snippet: r.snippet,
      url: r.link,
      domain: new URL(r.link).hostname
    }));

    // Search for authority sources
    const sourcesSearch = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: `site:.gov.ph OR site:.edu.ph OR site:.org ${keyword}`,
        num: 5,
        gl: 'ph'
      })
    });
    const sourcesData = await sourcesSearch.json();
    results.sources = (sourcesData.organic || []).map((r: any) => ({
      title: r.title,
      snippet: r.snippet,
      url: r.link,
      domain: new URL(r.link).hostname
    }));

    // Get People Also Ask questions
    const questionsSearch = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: keyword,
        gl: 'ph'
      })
    });
    const questionsData = await questionsSearch.json();
    results.relatedQuestions = (questionsData.peopleAlsoAsk || [])
      .slice(0, 5)
      .map((q: any) => q.question);

  } catch (error) {
    console.error('Research error:', error);
  }

  return results;
}

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: 'AI Service not configured' }, { status: 503 });
  }

  try {
    const { silo, targetKeyword, secondaryKeywords, topic, existingArticles, suggestedLinks, outlineHints = [], semanticKeywords = [] } = await req.json();

    if (!targetKeyword || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // STEP 1: Research real data with Serper
    console.log('🔍 Researching topic with Serper...');
    const research = await researchTopic(targetKeyword, topic);
    
    // Build research context
    const statsContext = research.stats.length > 0 
      ? research.stats.map(s => `- ${s.title}: "${s.snippet}" (Source: ${s.url})`).join('\n')
      : 'No specific statistics found - use general industry knowledge';

    const sourcesContext = research.sources.length > 0
      ? research.sources.map(s => `- ${s.domain}: ${s.title} (${s.url})`).join('\n')
      : 'No .gov/.edu/.org sources found';

    const questionsContext = research.relatedQuestions.length > 0
      ? research.relatedQuestions.map(q => `- ${q}`).join('\n')
      : '';

    // Build context about existing articles for internal linking
    const existingContext = existingArticles
      .slice(0, 10)
      .map((a: any) => `- "${a.title}" (/${a.slug})`)
      .join('\n');

    const linksToInclude = suggestedLinks
      .map((l: any) => `- Link to "${l.title}" with anchor text like "${l.anchorText}" → /insights/${l.slug}`)
      .join('\n');

    const dateInfo = getCurrentDateInfo();

    const prompt = `
You are "Ate Yna" - a BPO industry veteran and career mentor from the Philippines. You write in a warm, relatable voice that mixes English with occasional Tagalog/Taglish expressions.

⏰ CURRENT DATE: ${dateInfo.full}
📅 CURRENT YEAR: ${dateInfo.year}

IMPORTANT: We are in ${dateInfo.month} ${dateInfo.year}. Do NOT reference outdated information. When mentioning years:
- Use "${dateInfo.year}" for current data
- Use "${dateInfo.prevYear}" only for comparing to last year
- Never use years before ${dateInfo.prevYear} unless specifically citing historical data

YOUR WRITING STYLE:
- Conversational but professional
- Use "you" and "we" - never "one should"
- Include occasional Tagalog phrases naturally: "kaya mo 'yan", "totoo 'yan", "alam mo ba", "syempre"
- Short paragraphs (2-3 sentences max)
- Use rhetorical questions to engage readers
- Include personal anecdotes or "I've seen" statements
- Be encouraging but realistic - no toxic positivity
- Use contractions (don't, won't, can't)
- Avoid AI-sounding phrases like "In today's fast-paced world" or "It's important to note"

ANTI-AI DETECTION TECHNIQUES:
- Vary sentence length dramatically (some very short, some longer)
- Use em-dashes and parenthetical asides
- Include mild opinions and takes
- Reference specific Philippines context (BGC, Ortigas, Makati BPO hubs)
- Mention real BPO companies when relevant (but don't rank them)

=== REAL RESEARCH DATA (USE THIS!) ===

📊 STATISTICS & DATA FOUND:
${statsContext}

🏛️ AUTHORITY SOURCES (.gov, .edu, .org):
${sourcesContext}

❓ PEOPLE ALSO ASK (answer these in your FAQ section):
${questionsContext}

IMPORTANT: When citing statistics or facts from the research above:
- Include the actual numbers/data in your article
- Add outbound links to the sources using markdown: [descriptive anchor](url)
- This makes the article more authoritative and trustworthy

=== END RESEARCH DATA ===

SEO REQUIREMENTS:
- Target keyword: "${targetKeyword}"
- Secondary keywords: ${secondaryKeywords.join(', ')}
- Semantic keywords to weave in: ${semanticKeywords.join(', ')}
- Silo/Category: ${silo?.name || 'BPO Career'}
- Include the target keyword in: Title, first paragraph, one H2, conclusion
- Use secondary keywords naturally 1-2 times each
- Write 1500-2000 words

INTERNAL LINKING (VERY IMPORTANT):
Include these internal links naturally within the content:
${linksToInclude || 'Link to the main pillar page when relevant'}

Use markdown link format: [anchor text](/insights/slug-here)

EXISTING ARTICLES (avoid overlapping too much):
${existingContext || 'No existing articles'}

ARTICLE TOPIC:
${topic}

PREFERRED OUTLINE (follow loosely, can adjust if needed):
${outlineHints.map((o: string, i: number) => `${i + 1}. ${o}`).join('\n')}

OUTPUT FORMAT:
Return a JSON object with these fields:
{
  "title": "SEO-optimized title with target keyword, Ate Yna voice (50-60 chars)",
  "slug": "url-friendly-slug-no-years",
  "metaDescription": "Compelling meta description with target keyword (150-160 chars)",
  "content": "Full markdown article with H2 headings, bullet points, TABLES, internal links, and Ate Yna voice"
}

CONTENT STRUCTURE:
1. Hook/Introduction (address reader pain point, include target keyword)
2. 4-6 H2 sections covering the topic
3. Practical tips or actionable advice
4. FAQ section (3-4 common questions)
5. Conclusion with encouragement

INFOGRAPHIC FORMATTING (Clean & Professional - NO EMOJIS!):

1. **COMPACT TABLES** (2-3 per article, 3-5 rows max):
   | Role | Salary | Growth |
   |------|--------|--------|
   | CSR | ₱18-22k | High |
   | TSR | ₱25-35k | Very High |

2. **NUMBERED SEQUENCES** (bold numbers, no emoji):
   **1.** Prepare → **2.** Apply → **3.** Interview → **4.** Negotiate

3. **FLOW DIAGRAMS** (arrows only, no emoji):
   Application → Screening → Assessment → Interview → Offer

4. **CALLOUT BOXES** (use these EXACT markers - will render with icons):
   > [TIP] Concise advice in one line
   > [KEY] Main takeaway in one line
   > [WARNING] Quick warning in one line
   > [INFO] Statistics or data in one line
   > [SUCCESS] Encouragement message (Ate Yna style)

5. **TIMELINE FORMAT**:
   **Month 1-3:** Training | **Month 4-6:** Independent | **Year 1:** Review | **Year 2+:** Promotion

6. **INLINE STATS**:
   **Numbers:** Entry ₱18-25k | Mid ₱30-50k | Senior ₱60k+ | Manager ₱80-120k

7. **COMPARISON TABLE**:
   | Do This | Avoid This |
   |---------|------------|
   | Research company | Go unprepared |
   | Ask questions | Stay silent |

8. **BULLET LIST** (dashes, no emoji):
   - Resume ready
   - English fluent
   - IDs complete
   - References set

CALLOUT RULES: Use [TIP], [KEY], [WARNING], [INFO], [SUCCESS] markers for callouts!

Remember: You're Ate Yna - helpful and experienced! Make content SCANNABLE with CLEAN formatting (NO EMOJIS!)!

Return ONLY valid JSON. No markdown code blocks around it.
`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const textResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      // Try to parse JSON from response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : textResponse;
      const result = JSON.parse(jsonStr);
      
      // Include research data in response
      return NextResponse.json({
        ...result,
        research: {
          statsFound: research.stats.length,
          sourcesFound: research.sources.length,
          questionsFound: research.relatedQuestions.length,
          sources: research.sources.slice(0, 3),
          questions: research.relatedQuestions
        }
      });
    } catch (e) {
      console.error('Parse error:', e);
      // Return raw content if JSON parsing fails
      return NextResponse.json({
        title: `${targetKeyword} - BPO Guide`,
        slug: targetKeyword.toLowerCase().replace(/\s+/g, '-'),
        metaDescription: topic.substring(0, 160),
        content: textResponse,
        parseError: true,
        research: {
          statsFound: research.stats.length,
          sourcesFound: research.sources.length,
          questionsFound: research.relatedQuestions.length
        }
      });
    }

  } catch (error) {
    console.error('Generate API Error:', error);
    return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 });
  }
}

