import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropicApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || "";

function getCurrentDateInfo() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.toLocaleString("en-US", { month: "long" }),
    day: now.getDate(),
    fullDate: now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      targetKeyword,
      secondaryKeywords,
      currentBrief,
      currentAngle,
      currentOutline,
      siloId,
    } = body;

    if (!anthropicApiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const dateInfo = getCurrentDateInfo();
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    const siloContext: Record<string, string> = {
      salary:
        "Focus on actual PHP amounts, payslip math, negotiation scripts, and DOLE regulations.",
      career:
        "Focus on timelines, metrics needed, political moves, and real promotion stories.",
      jobs: "Focus on hiring channels, test requirements, company comparisons, and location-specific info.",
      interview:
        "Focus on scripts, practice exercises, scoring systems, and common mistakes.",
      benefits:
        "Focus on computations (SSS/PhilHealth/Pag-IBIG), eligibility rules, and timelines.",
      companies:
        "Focus on salary comparisons, account types, culture differences, and ND allowances.",
    };

    const prompt = `You are helping refine an article direction for a BPO career guide website targeting Filipino call center agents. Today's date is ${dateInfo.fullDate}.

The article will be written by "Ate Yna" - a relatable, experienced BPO veteran who gives real talk, practical advice, and isn't afraid to call out BS. She shares personal stories and actual numbers.

CURRENT DIRECTION:
- Title: ${title}
- Target Keyword: ${targetKeyword}
- Secondary Keywords: ${(secondaryKeywords || []).join(", ")}
- Silo Context: ${siloContext[siloId] || "Make it practical with real PH examples."}

Current Brief:
${currentBrief || "(none yet)"}

Current Ate Yna Angle:
${currentAngle || "(none yet)"}

Current Outline:
${(currentOutline || []).join("\n") || "(none yet)"}

YOUR TASK:
Refine and improve this direction. Make it more specific, more actionable, and more aligned with what Filipino BPO agents actually need. 

Return a JSON object with:
1. "title": An improved headline (keep it punchy, benefit-focused, avoid generic AI-speak)
2. "brief": A 2-3 paragraph description of what the article covers. Be specific about the value - what questions will be answered? What problems solved? Include specific examples of what you'll cover.
3. "angle": Ate Yna's unique angle - how does she approach this differently? What personal stories or tough love will she share? What BS will she call out? (1-2 paragraphs)
4. "outline": An array of H2/H3 headings that form the article structure. Format as "H2: Section Title" or "H3: Subsection Title". Include 8-12 items mixing H2s and H3s.

Important:
- Be SPECIFIC, not generic. Use actual Philippine context (specific BPO companies, real salary ranges in PHP, DOLE rules, etc.)
- The title should hook readers and promise clear value
- The brief should make readers feel like "this is exactly what I needed"
- Ate Yna's angle should feel human, not corporate
- The outline should be comprehensive but focused

Return ONLY valid JSON, no markdown.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response
    let refined;
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        refined = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      title: refined.title || title,
      brief: refined.brief || currentBrief,
      angle: refined.angle || currentAngle,
      outline: refined.outline || currentOutline,
    });
  } catch (error) {
    console.error("Refine direction error:", error);
    return NextResponse.json(
      { error: "Failed to refine direction" },
      { status: 500 }
    );
  }
}

