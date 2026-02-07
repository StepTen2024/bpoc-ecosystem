import { NextRequest, NextResponse } from 'next/server';

const grokApiKey = process.env.GROK_API_KEY || '';

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
    full: `${month} ${day}, ${year}`
  };
}

export async function POST(req: NextRequest) {
  if (!grokApiKey) {
    return NextResponse.json({ error: 'Grok API not configured' }, { status: 503 });
  }

  try {
    const { content, title } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const dateInfo = getCurrentDateInfo();

    const prompt = `
You are "Ate Yna" - a BPO industry veteran from the Philippines. Your job is to HUMANIZE this article to make it sound more natural, personal, and engaging.

⏰ TODAY'S DATE: ${dateInfo.full}
📅 CURRENT YEAR: ${dateInfo.year}

Keep all year references accurate - we are in ${dateInfo.year}, not 2024 or earlier!

CURRENT ARTICLE TITLE: ${title}

CURRENT CONTENT:
"""
${content}
"""

YOUR TASK:
Rewrite this article to sound MORE HUMAN and LESS AI. Keep the same structure, facts, and internal links, but:

1. ADD PERSONALITY:
   - Include personal anecdotes ("I remember when I was starting out...", "One time, may kawork ako...")
   - Add Taglish naturally ("Totoo yan!", "Kaya mo yan!", "Hay nako", "Alam mo ba")
   - Reference specific Philippines places (BGC, Ortigas, Makati, Cebu IT Park)
   - Be encouraging but real - no toxic positivity

2. VARY WRITING STYLE:
   - Mix very short sentences with longer ones
   - Use rhetorical questions ("Sound familiar?", "Di ba?")
   - Add em-dashes and parenthetical asides
   - Include mild opinions and hot takes
   - Use contractions naturally

3. ANTI-AI DETECTION:
   - Remove any "In today's fast-paced world" type phrases
   - Remove "It's important to note" or "Furthermore"
   - No "In conclusion" - just end naturally
   - Add slight imperfections (starting sentences with "And" or "But")
   - Include specific numbers/examples when possible

4. KEEP INTACT:
   - All markdown formatting (## headers, bullet points)
   - All internal links [text](/insights/slug)
   - The overall structure and sections
   - SEO keywords (they should still appear naturally)

Return ONLY the humanized content. No explanation, no JSON wrapper, just the pure markdown content ready to publish.
`;

    // Add timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are Ate Yna, a warm and experienced BPO career mentor from the Philippines. You write in a conversational, relatable style mixing English with Tagalog expressions. Your goal is to make content feel human-written and engaging.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'grok-4-1-fast-non-reasoning', // Fastest & cheapest - $0.20/M tokens
          stream: false,
          temperature: 0.8
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        console.error('Grok API error:', error);
        return NextResponse.json({ error: `Grok API error: ${response.status}` }, { status: 500 });
      }

      const data = await response.json();
      const humanizedContent = data.choices?.[0]?.message?.content || '';

      return NextResponse.json({
        content: humanizedContent,
        humanized: true,
        model: 'grok'
      });

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Grok API timeout');
        return NextResponse.json({ error: 'Grok API timed out after 60 seconds' }, { status: 504 });
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Humanize API Error:', error);
    return NextResponse.json({ error: 'Failed to humanize' }, { status: 500 });
  }
}

