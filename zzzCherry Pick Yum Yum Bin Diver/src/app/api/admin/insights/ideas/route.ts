import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const serperApiKey = process.env.SERPER_API_KEY || "";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const SILOS = [
  { id: "salary", name: "Salary & Compensation", slug: "bpo-salary-guide-philippines" },
  { id: "career", name: "Career Growth", slug: "how-to-get-promoted-bpo-call-center" },
  { id: "jobs", name: "Job Search", slug: "bpo-jobs-philippines-guide" },
  { id: "interview", name: "Interview Tips", slug: "how-to-get-hired-call-center-philippines" },
  { id: "benefits", name: "Benefits & Rights", slug: "bpo-employee-benefits-rights-philippines" },
  { id: "companies", name: "Company Reviews", slug: "best-bpo-companies-philippines" },
];

async function searchSerper(query: string) {
  if (!serperApiKey) return null;
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": serperApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        num: 3,
        gl: "ph",
        tbs: "qdr:y",
      }),
    });
    const data = await res.json();
    const first = data?.organic?.[0];
    if (!first) return null;
    return {
      title: first.title,
      url: first.link,
      domain: new URL(first.link).hostname,
      snippet: first.snippet,
    };
  } catch (_e) {
    return null;
  }
}

async function searchStat(query: string) {
  if (!serperApiKey) return null;
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": serperApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: `${query} statistics data Philippines`,
        num: 3,
        gl: "ph",
        tbs: "qdr:y",
      }),
    });
    const data = await res.json();
    const stats = (data?.organic || []).slice(0, 2).map((r: any) => ({
      title: r.title,
      url: r.link,
      domain: new URL(r.link).hostname,
      snippet: r.snippet,
    }));
    return stats;
  } catch (_e) {
    return null;
  }
}

function defaultOutline(siloId: string, target: string) {
  if (siloId === "jobs") {
    return [
      `Why ${target} matters in 2025 (PH)`,
      "Top hiring channels and required tests",
      "Salary/allowance ranges (fresh data)",
      "Day in the life / realistic expectations",
      "How to pass screening fast",
      "FAQ from real applicants",
    ];
  }
  if (siloId === "salary") {
    return [
      `How ${target} is computed in PH (2025)`,
      "Sample payslip math and allowances",
      "Negotiation scripts that work",
      "What HR checks before approving",
      "Red flags and gotchas",
      "FAQ with quick numbers",
    ];
  }
  if (siloId === "career") {
    return [
      `Path to ${target}: timeline and milestones`,
      "Skills and metrics you need",
      "Interview/assessment tips",
      "Manager expectations and politics",
      "Portfolio/examples to show",
      "FAQ from agents who leveled up",
    ];
  }
  return [
    `Why ${target} matters now`,
    "Key steps / playbook",
    "Numbers or benchmarks to watch",
    "Mistakes to avoid",
    "FAQ",
  ];
}

export async function POST(req: NextRequest) {
  try {
    const { siloId } = await req.json();
    if (!siloId) {
      return NextResponse.json({ error: "siloId required" }, { status: 400 });
    }

    const silo = SILOS.find((s) => s.id === siloId);
    if (!silo) {
      return NextResponse.json({ error: "Invalid silo" }, { status: 400 });
    }

    // Fetch existing posts to avoid cannibalization
    let existing: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from("insights_posts")
        .select("id,title,slug,category,seo:seo_metadata(keywords)");
      if (!error && data) existing = data;
    }

    const existingSlugs = new Set(existing.map((p) => p.slug));
    const existingKeywords = new Set(
      existing
        .flatMap((p) => p.seo?.[0]?.keywords ?? [])
        .filter(Boolean)
        .map((k) => k.toLowerCase())
    );

    // Heuristic: location gaps for Job Search silo
    const locationTokens = ["clark", "cebu", "bgc", "ortigas", "makati", "iloilo", "davao"];

    function hasToken(token: string) {
      const tokenLower = token.toLowerCase();
      return (
        Array.from(existingSlugs).some((s) => s.includes(tokenLower)) ||
        Array.from(existingKeywords).some((k) => k.includes(tokenLower))
      );
    }

    const ideas: any[] = [];

    // Base ideas per silo
    // Rich ideas with full briefs, Ate Yna's angle, and detailed outlines
    const baseIdeas: Record<string, any[]> = {
      salary: [
        {
          title: "BPO Salary Negotiation Script (Philippines)",
          target: "bpo salary negotiation philippines",
          secondary: ["call center salary negotiation", "how to ask for raise bpo"],
          brief: `Most agents just accept the first offer—and leave ₱5k-10k/month on the table. This article gives them the exact scripts to use during hiring AND during performance reviews.

We'll cover: when to negotiate (hint: after the job offer but before signing), what numbers to quote based on account type, and the psychology behind why HR expects you to push back. Real examples from agents who successfully negotiated.`,
          ateYnaAngle: `Ate Yna shares her own negotiation story—how she went from accepting ₱18k to confidently asking for ₱25k. She'll call out the BS excuses HR gives ("budget is fixed") and what actually works. Tough love with real numbers.`,
          outline: [
            "H2: Why Most BPO Agents Leave Money on the Table",
            "H3: The 'grateful to be hired' trap",
            "H2: When to Negotiate (The 3 Golden Windows)",
            "H3: After job offer, before signing",
            "H3: During regularization",
            "H3: Performance review time",
            "H2: The Negotiation Script That Works",
            "H3: Opening line",
            "H3: Handling pushback",
            "H3: The walk-away move",
            "H2: Sample Numbers by Account Type",
            "H2: FAQ: Common Objections and Comebacks"
          ]
        },
        {
          title: "Night Differential Pay: How Much Extra You Really Get",
          target: "bpo night differential pay philippines",
          secondary: ["graveyard shift allowance", "night premium call center"],
          brief: `Night differential is required by DOLE law—but most agents don't know how to compute it, and some companies lowball it. This article breaks down the exact math, shows sample payslip computations, and explains what to do if you're being shortchanged.

We'll include real payslip screenshots (anonymized), the DOLE formula, and how ND stacks with overtime and holiday pay.`,
          ateYnaAngle: `Ate Yna has seen payslips from 50+ agents. She'll show the difference between companies that compute ND correctly vs those that "round down." No sugarcoating—if your company is cheating you, she'll tell you how to spot it.`,
          outline: [
            "H2: What is Night Differential Pay? (DOLE Definition)",
            "H2: The Exact Computation Formula",
            "H3: Basic daily rate to hourly",
            "H3: 10% premium breakdown",
            "H2: Sample Payslip Math (Screenshots)",
            "H3: Good example",
            "H3: Bad example (how they cheat)",
            "H2: ND + Overtime + Holiday: Triple Stack",
            "H2: What To Do If You're Being Shortchanged",
            "H2: FAQ"
          ]
        },
      ],
      career: [
        {
          title: "How to Become Team Leader in 12 Months (BPO)",
          target: "how to become team leader bpo philippines",
          secondary: ["team leader promotion call center", "tl interview tips"],
          brief: `Most agents stay at Agent level for 3+ years because they don't know the specific criteria for TL promotion. This article gives the exact timeline, metrics, and political moves needed to get that promotion in 12 months or less.

We'll cover: what scores you need (QA, CSAT, AHT), how to get visible to management, and what to say in your TL interview.`,
          ateYnaAngle: `Ate Yna got promoted to TL in 11 months at her first BPO. She'll share the exact playbook—including the "volunteer for everything" strategy and why your metrics alone won't get you promoted. Also the uncomfortable truth: sometimes you need to switch companies to level up.`,
          outline: [
            "H2: The Promotion Timeline (Reality Check)",
            "H3: Month 1-3: Prove you can hit metrics",
            "H3: Month 4-6: Get visible",
            "H3: Month 7-9: Build your portfolio",
            "H3: Month 10-12: Interview prep",
            "H2: The Metrics You Actually Need",
            "H2: Political Moves That Work",
            "H3: Volunteer strategically",
            "H3: Solve problems publicly",
            "H2: The TL Interview Questions (With Answers)",
            "H2: When to Stay vs Jump Ship",
            "H2: FAQ"
          ]
        },
        {
          title: "From Agent to QA: Career Path Without Managing People",
          target: "qa career path bpo philippines",
          secondary: ["quality analyst bpo", "qa interview questions call center"],
          brief: `Not everyone wants to manage people. QA is the best non-manager career path in BPO—higher pay, better hours, and you get to catch other people's mistakes. This article shows how to make the switch.

We'll cover: skills needed, how to get QA experience while still an agent, and what the QA interview looks like.`,
          ateYnaAngle: `Ate Yna's best friend is a QA Analyst making ₱45k without managing anyone. She'll break down why QA is underrated, the secret to getting noticed by the QA team, and the "calibration" skills you need to practice.`,
          outline: [
            "H2: Why QA is the Best Non-Manager Path",
            "H3: Pay comparison",
            "H3: Work-life balance",
            "H2: Skills You Need (Not What You Think)",
            "H2: How to Get QA Experience as an Agent",
            "H2: The QA Interview: What They Actually Ask",
            "H2: Day in the Life of a QA Analyst",
            "H2: FAQ"
          ]
        },
      ],
      jobs: [
        {
          title: "Non-Voice BPO Jobs for Introverts (Philippines)",
          target: "non voice bpo jobs philippines",
          secondary: ["email support jobs", "chat support no calls"],
          brief: `Hate phone calls? There are thousands of non-voice BPO jobs in PH that pay the same or better. This article lists the best non-voice accounts (email, chat, back-office), where to find them, and what tests you need to pass.

We'll name specific companies hiring for non-voice right now and what the interview process looks like.`,
          ateYnaAngle: `Ate Yna started in voice but switched to chat support after 8 months. She'll explain the pros and cons honestly—yes, chat is less stressful, but the typing speed requirements are brutal. Real talk about which non-voice jobs are worth it.`,
          outline: [
            "H2: Types of Non-Voice BPO Jobs",
            "H3: Email support",
            "H3: Chat support",
            "H3: Back-office/Data entry",
            "H3: Social media moderation",
            "H2: Pay Comparison: Voice vs Non-Voice",
            "H2: Companies Hiring Non-Voice Right Now",
            "H2: Tests You Need to Pass",
            "H3: Typing test (WPM requirements)",
            "H3: Grammar/Writing test",
            "H2: The Interview Process",
            "H2: FAQ"
          ]
        },
        {
          title: "BPO Jobs Without Experience: Exact Steps to Get Hired",
          target: "bpo jobs no experience philippines",
          secondary: ["entry level call center", "first job bpo"],
          brief: `First job? No experience? BPO is literally designed for people like you—but you need to know where to apply and what to say. This article gives the exact steps from resume to first day.

We'll cover: which companies hire freshers (and which don't), what to put on your resume when you have nothing, and the interview answers that work.`,
          ateYnaAngle: `Ate Yna's first job was BPO straight out of college with zero experience. She'll share her exact resume (before and after), the interview question that tripped her up, and why she almost didn't get hired. Real story, real lessons.`,
          outline: [
            "H2: Why BPO Hires People With No Experience",
            "H2: Companies That Hire Fresh Grads",
            "H3: Tier 1 (Concentrix, TELUS, etc.)",
            "H3: Tier 2 (easier to get in)",
            "H2: Your Resume: What to Put When You Have Nothing",
            "H3: Format that works",
            "H3: Skills to highlight",
            "H3: Sample bullet points",
            "H2: The Application Process Step-by-Step",
            "H2: Interview Questions (With Sample Answers)",
            "H2: FAQ"
          ]
        },
      ],
      interview: [
        {
          title: "Versant Test Tips: Pass on First Try",
          target: "versant test tips philippines",
          secondary: ["versant practice", "call center english test"],
          brief: `The Versant test eliminates 40% of applicants. It's not about your English skills—it's about understanding how the automated scoring works. This article gives the exact strategies to pass on your first try.

We'll cover: how Versant actually scores you, timing tricks, and what to do in each section.`,
          ateYnaAngle: `Ate Yna failed Versant twice before she figured out the system. She'll share the exact mistakes she made (speaking too fast, pausing wrong) and the strategy that finally got her a passing score. Includes practice exercises.`,
          outline: [
            "H2: What is Versant and Why BPOs Use It",
            "H2: How Versant Scoring Actually Works",
            "H3: The robot is listening for...",
            "H2: Section-by-Section Strategy",
            "H3: Reading",
            "H3: Repeat",
            "H3: Questions",
            "H3: Story retelling",
            "H2: Common Mistakes That Tank Your Score",
            "H2: Practice Exercises (Try These Now)",
            "H2: FAQ"
          ]
        },
        {
          title: "Tell Me About Yourself (BPO Version): Scripts That Work",
          target: "tell me about yourself bpo answer",
          secondary: ["call center interview answers", "self introduction bpo"],
          brief: `"Tell me about yourself" is the first question in every BPO interview—and most people blow it with rambling, irrelevant stories. This article gives plug-and-play scripts for fresh grads, career changers, and experienced agents.

We'll show the exact structure: what to include, what to skip, and how long to talk.`,
          ateYnaAngle: `Ate Yna has helped 100+ friends prep for BPO interviews. She'll share the script template she uses, real examples that worked, and the "humble brag" technique that makes you memorable without sounding arrogant.`,
          outline: [
            "H2: Why This Question is Actually a Test",
            "H2: The 60-Second Structure",
            "H3: Hook (5 seconds)",
            "H3: Background (20 seconds)",
            "H3: Why BPO (20 seconds)",
            "H3: Close (15 seconds)",
            "H2: Script for Fresh Grads",
            "H2: Script for Career Changers",
            "H2: Script for Experienced Agents",
            "H2: Common Mistakes to Avoid",
            "H2: FAQ"
          ]
        },
      ],
      benefits: [
        {
          title: "Maternity Leave BPO Philippines: SSS + Company Pay",
          target: "bpo maternity leave philippines",
          secondary: ["sss maternity benefit", "105 days maternity leave call center"],
          brief: `The 105-day maternity leave law is real—but most BPO employees don't know how to maximize both SSS benefits AND company pay. This article shows the exact computation and what documents you need.

We'll cover: timeline for filing, how much you'll actually receive, and common mistakes that delay your benefits.`,
          ateYnaAngle: `Ate Yna helped her officemate navigate maternity leave last year. She'll share the real timeline (spoiler: start preparing 4 months before due date), the forms you need, and how to handle HR if they're being difficult.`,
          outline: [
            "H2: Maternity Leave in the Philippines (The Law)",
            "H2: SSS Maternity Benefit: How Much You Get",
            "H3: Computation formula",
            "H3: Sample computation",
            "H2: Company Pay: What BPOs Add On Top",
            "H2: Documents You Need (Complete List)",
            "H2: Timeline: When to File What",
            "H2: Common Mistakes That Delay Benefits",
            "H2: FAQ"
          ]
        },
        {
          title: "HMO in BPO: Which Benefits Matter (and Red Flags)",
          target: "bpo hmo benefits philippines",
          secondary: ["healthcard call center", "hmo coverage dependents"],
          brief: `Not all HMO plans are equal—some BPOs give you a health card that covers almost nothing. This article explains which HMO benefits actually matter, how to check your coverage, and red flags to watch for.

We'll compare HMO plans across major BPOs and explain the fine print that companies hide.`,
          ateYnaAngle: `Ate Yna learned the hard way when her "free HMO" didn't cover her ER visit. She'll break down the important coverage limits, how to read your HMO card's fine print, and which companies have the best health benefits.`,
          outline: [
            "H2: What Your HMO Card Actually Covers",
            "H2: Coverage Limits That Matter",
            "H3: Room and board",
            "H3: ER coverage",
            "H3: Outpatient",
            "H3: Dental",
            "H2: Dependents: Who Can You Add?",
            "H2: Pre-Existing Conditions: The Truth",
            "H2: Red Flags in HMO Plans",
            "H2: Best HMO Plans in BPO (Comparison)",
            "H2: FAQ"
          ]
        },
      ],
      companies: [
        {
          title: "Teleperformance vs Concentrix: Which BPO Is Better in PH?",
          target: "teleperformance vs concentrix philippines",
          secondary: ["best bpo company comparison", "tp vs concentrix salary"],
          brief: `TP and Concentrix are the two biggest BPOs in the Philippines—but which one should you work for? This article compares pay, accounts, culture, career growth, and location to help you decide.

We'll use real data from current and former employees, not just company PR.`,
          ateYnaAngle: `Ate Yna worked at both companies. She'll share the honest differences: TP's metrics culture vs Concentrix's work-life balance, which one promotes faster, and which accounts to avoid at each company.`,
          outline: [
            "H2: Company Overview (Quick Stats)",
            "H2: Salary Comparison",
            "H3: Entry-level",
            "H3: Team Leader",
            "H3: Allowances and bonuses",
            "H2: Account Types Available",
            "H2: Work Culture: The Real Difference",
            "H2: Career Growth: Who Promotes Faster?",
            "H2: Locations and Commute",
            "H2: Which One Should You Choose?",
            "H2: FAQ"
          ]
        },
        {
          title: "Best BPOs for Night Shift Allowance (Actual Numbers)",
          target: "best bpo night shift allowance philippines",
          secondary: ["night differential bpo companies", "graveyard allowance call center"],
          brief: `Night differential is required by law—but some BPOs add extra allowances on top (transport, meal, hazard pay). This article compares the actual night shift packages across major BPOs.

We'll show real numbers from current employees and explain which "allowances" are actually just marketing.`,
          ateYnaAngle: `Ate Yna collected payslip data from 30+ graveyard shift agents. She'll expose which companies have the best night packages (spoiler: it's not always the biggest names) and which "allowances" disappear after regularization.`,
          outline: [
            "H2: What Counts as Night Shift Allowance",
            "H3: Legal ND (the baseline)",
            "H3: Additional company allowances",
            "H2: Company-by-Company Comparison",
            "H3: TELUS",
            "H3: Concentrix",
            "H3: Teleperformance",
            "H3: Accenture",
            "H3: TaskUs",
            "H2: Hidden Tricks: Allowances That Disappear",
            "H2: How to Negotiate Night Shift Pay",
            "H2: FAQ"
          ]
        },
      ],
    };

    const base = baseIdeas[siloId] || [];
    ideas.push(...base);

    // Add location gaps for jobs silo
    if (siloId === "jobs") {
      for (const loc of locationTokens) {
        if (!hasToken(loc)) {
          ideas.push({
            title: `BPO Jobs in ${loc.charAt(0).toUpperCase() + loc.slice(1)}`,
            target: `bpo jobs ${loc} philippines`,
            secondary: [`call center hiring ${loc}`, `${loc} bpo companies`],
            brief: `Location guide for ${loc}: hiring companies, salary bands, commute tips.`,
          });
        }
      }
    }

    // Build link plan: always link to pillar and related (same category)
    function linkPlan() {
      const links: any[] = [];
      const pillar = existing.find((p) => p.slug === silo.slug);
      if (pillar) {
        links.push({ title: pillar.title, slug: pillar.slug, type: "pillar" });
      }
      const related = existing.filter(
        (p) => p.category === silo.name && p.slug !== silo.slug
      );
      related.slice(0, 3).forEach((p) =>
        links.push({ title: p.title, slug: p.slug, type: "related" })
      );
      return links;
    }

    // Enrich each idea with cannibal risk and source
    const enriched = await Promise.all(
      ideas.slice(0, 8).map(async (idea) => {
        const overlaps = Array.from(existingKeywords).filter((kw) =>
          kw.includes(idea.target.toLowerCase().split(" ")[0] || "")
        );
        const risk =
          overlaps.length >= 2 ? "high" : overlaps.length === 1 ? "medium" : "low";

        const [source, stats] = await Promise.all([
          searchSerper(idea.target),
          searchStat(idea.target),
        ]);

        return {
          ...idea,
          risk,
          links: linkPlan(),
          source,
          stats: stats || [],
          // Use the detailed Ate Yna angle from the idea, or fallback
          ateYnaAngle: idea.ateYnaAngle || `Ate Yna will share real stories and call out the BS. No generic advice—practical tips with actual numbers.`,
          semanticKeywords: [
            idea.target,
            ...(idea.secondary || []),
            silo.name,
            "Philippines",
            "2025",
          ],
          titleSuggestion: idea.title,
          // Use the detailed outline from the idea, or fallback
          outline: idea.outline || defaultOutline(siloId, idea.target),
        };
      })
    );

    return NextResponse.json({ ideas: enriched });
  } catch (error) {
    console.error("Ideas API error:", error);
    return NextResponse.json({ error: "Failed to generate ideas" }, { status: 500 });
  }
}

