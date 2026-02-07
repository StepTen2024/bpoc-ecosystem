import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

type AssessmentPayload = {
  wpm?: number;
  accuracy?: number;
  totalWords?: number;
  correctWords?: number;
  missedWords?: number;
  fires?: number;
  poos?: number;
  elapsedTime?: number;
  charactersTyped?: number;
  errorPatterns?: any[];
  difficultyLevel?: string;
  streakData?: {
    bestStreak?: number;
    currentStreak?: number;
  };
  wordsCorrect?: string[];
  wordsIncorrect?: string[];
};

type Analysis = {
  sessionMetadata: {
    timestamp: string;
    difficultyLevel: string;
    sessionDuration: number;
    totalWords: number;
    charactersTyped: number;
  };
  performanceMetrics: {
    wpm: number;
    accuracy: number;
    correctWords: number;
    missedWords: number;
    fires: number;
    poos: number;
    longestStreak: number;
    currentStreak: number;
    errorRate: number;
    charactersPerMinute: number;
  };
  aiAssessment: {
    overallAssessment: string;
    performanceLevel: string;
    strengths: string[];
    improvementAreas: string[];
    personalizedTips: { category: string; tip: string; explanation: string }[];
    encouragement: string;
    nextSessionGoal: string;
  };
  errorAnalysis?: Record<string, unknown>;
  streakAnalysis?: Record<string, unknown>;
  difficultyAssessment?: Record<string, unknown>;
  comparativeAnalysis?: Record<string, unknown>;
  recommendations?: Record<string, unknown>;
  sessionInsights?: Record<string, unknown>;
};

const toNumber = (value: unknown, fallback = 0) => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalizeAccuracy = (value: number) => {
  if (value <= 1) {
    return value * 100;
  }
  return value;
};

const buildFallbackAnalysis = (payload: AssessmentPayload): Analysis => {
  const wpm = clamp(Math.round(toNumber(payload.wpm)), 0, 200);
  const accuracyRaw = normalizeAccuracy(toNumber(payload.accuracy));
  const accuracy = clamp(Number(accuracyRaw.toFixed(2)), 0, 100);
  const totalWords = Math.max(0, Math.round(toNumber(payload.totalWords)));
  const correctWords = Math.max(0, Math.round(toNumber(payload.correctWords)));
  const missedWords = Math.max(
    0,
    Math.round(
      toNumber(payload.missedWords, totalWords > 0 ? totalWords - correctWords : 0)
    )
  );
  const elapsedTime = Math.max(0, Math.round(toNumber(payload.elapsedTime)));
  const charactersTyped = Math.max(0, Math.round(toNumber(payload.charactersTyped)));
  const fires = Math.max(0, Math.round(toNumber(payload.fires)));
  const poos = Math.max(0, Math.round(toNumber(payload.poos)));
  const longestStreak = Math.max(0, Math.round(toNumber(payload.streakData?.bestStreak)));
  const currentStreak = Math.max(0, Math.round(toNumber(payload.streakData?.currentStreak)));
  const errorRate = totalWords > 0 ? ((totalWords - correctWords) / totalWords) * 100 : 0;
  const charactersPerMinute =
    elapsedTime > 0 ? Math.round((charactersTyped / elapsedTime) * 60) : 0;

  const strengths: string[] = [];
  if (wpm >= 60) {
    strengths.push('Excellent typing speed');
  } else if (wpm >= 40) {
    strengths.push('Good typing speed');
  } else {
    strengths.push('Building typing fundamentals');
  }
  if (accuracy >= 90) strengths.push('High accuracy');
  if (longestStreak >= 20) strengths.push('Strong focus and consistency');

  if (strengths.length === 0) strengths.push('Session completion');

  const improvementAreas: string[] = [];
  if (accuracy < 85) improvementAreas.push('Accuracy');
  if (wpm < 40) improvementAreas.push('Typing speed');
  if (improvementAreas.length === 0) improvementAreas.push('Consistency');

  const performanceLevel =
    wpm >= 80 ? 'Expert' : wpm >= 60 ? 'Advanced' : wpm >= 40 ? 'Intermediate' : 'Developing';

  const overallAssessment = `You achieved ${wpm} WPM with ${accuracy.toFixed(
    1
  )}% accuracy. ${
    wpm >= 60
      ? 'Excellent work!'
      : wpm >= 40
      ? 'Good progress!'
      : 'Keep practicing to build speed and confidence.'
  }`;

  const personalizedTips = [
    {
      category: accuracy < 85 ? 'Accuracy' : 'Speed',
      tip:
        accuracy < 85
          ? 'Slow down slightly to reduce errors, then build speed back up'
          : 'Use short burst drills to raise your peak WPM safely',
      explanation:
        accuracy < 85
          ? 'Accurate typing builds better muscle memory than rushing through mistakes'
          : 'Short, focused sprints improve speed without sacrificing control',
    },
  ];

  const encouragement =
    wpm >= 60
      ? 'Great speed! Keep refining your technique.'
      : wpm >= 40
      ? 'Solid progress. Consistency will take you to the next level.'
      : 'Every session helps. Stay steady and celebrate small wins.';

  const nextSessionGoal =
    wpm < 30
      ? 'Aim for 30+ WPM while holding 85%+ accuracy'
      : wpm < 50
      ? 'Reach 50 WPM with steady accuracy'
      : 'Maintain your speed while improving precision';

  return {
    sessionMetadata: {
      timestamp: new Date().toISOString(),
      difficultyLevel: payload.difficultyLevel || 'rockstar',
      sessionDuration: elapsedTime,
      totalWords: totalWords || correctWords + missedWords,
      charactersTyped,
    },
    performanceMetrics: {
      wpm,
      accuracy,
      correctWords,
      missedWords,
      fires,
      poos,
      longestStreak,
      currentStreak,
      errorRate: Number(errorRate.toFixed(1)),
      charactersPerMinute,
    },
    aiAssessment: {
      overallAssessment,
      performanceLevel,
      strengths,
      improvementAreas,
      personalizedTips,
      encouragement,
      nextSessionGoal,
    },
  };
};

const mergeAnalysis = (base: Analysis, incoming: Partial<Analysis>): Analysis => ({
  sessionMetadata: { ...base.sessionMetadata, ...incoming.sessionMetadata },
  performanceMetrics: { ...base.performanceMetrics, ...incoming.performanceMetrics },
  aiAssessment: { ...base.aiAssessment, ...incoming.aiAssessment },
  errorAnalysis: incoming.errorAnalysis || base.errorAnalysis,
  streakAnalysis: incoming.streakAnalysis || base.streakAnalysis,
  difficultyAssessment: incoming.difficultyAssessment || base.difficultyAssessment,
  comparativeAnalysis: incoming.comparativeAnalysis || base.comparativeAnalysis,
  recommendations: incoming.recommendations || base.recommendations,
  sessionInsights: incoming.sessionInsights || base.sessionInsights,
});

const buildPrompt = (payload: AssessmentPayload) => {
  return `You are an expert typing coach. Analyze the following typing session and return JSON only.

SESSION DATA:
- WPM: ${payload.wpm}
- Accuracy: ${payload.accuracy}
- Total Words: ${payload.totalWords}
- Correct Words: ${payload.correctWords}
- Missed Words: ${payload.missedWords}
- Fires: ${payload.fires}
- Poos: ${payload.poos}
- Elapsed Time (sec): ${payload.elapsedTime}
- Characters Typed: ${payload.charactersTyped}
- Difficulty: ${payload.difficultyLevel}
- Best Streak: ${payload.streakData?.bestStreak ?? 0}
- Current Streak: ${payload.streakData?.currentStreak ?? 0}

RESPONSE FORMAT (JSON ONLY):
{
  "sessionMetadata": {
    "timestamp": "ISO",
    "difficultyLevel": "rookie|rockstar|virtuoso|legend",
    "sessionDuration": number,
    "totalWords": number,
    "charactersTyped": number
  },
  "performanceMetrics": {
    "wpm": number,
    "accuracy": number,
    "correctWords": number,
    "missedWords": number,
    "fires": number,
    "poos": number,
    "longestStreak": number,
    "currentStreak": number,
    "errorRate": number,
    "charactersPerMinute": number
  },
  "aiAssessment": {
    "overallAssessment": "string",
    "performanceLevel": "Beginner|Developing|Intermediate|Advanced|Expert",
    "strengths": ["string"],
    "improvementAreas": ["string"],
    "personalizedTips": [
      { "category": "string", "tip": "string", "explanation": "string" }
    ],
    "encouragement": "string",
    "nextSessionGoal": "string"
  },
  "errorAnalysis": {},
  "streakAnalysis": {},
  "difficultyAssessment": {},
  "comparativeAnalysis": {},
  "recommendations": {},
  "sessionInsights": {}
}`;
};

export async function POST(request: NextRequest) {
  let payload: AssessmentPayload = {};

  try {
    payload = (await request.json()) || {};
  } catch {
    payload = {};
  }

  const fallbackAnalysis = buildFallbackAnalysis(payload);
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: true,
      assessment: fallbackAnalysis.aiAssessment,
      analysis: fallbackAnalysis,
      generatedBy: 'fallback',
    });
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1200,
      temperature: 0.6,
      messages: [
        {
          role: 'user',
          content: buildPrompt(payload),
        },
      ],
    });

    const content = aiResponse.content?.[0];
    const rawText = content && 'text' in content ? content.text : '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({
        success: true,
        assessment: fallbackAnalysis.aiAssessment,
        analysis: fallbackAnalysis,
        generatedBy: 'fallback',
      });
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<Analysis>;
    const merged = mergeAnalysis(fallbackAnalysis, parsed);

    return NextResponse.json({
      success: true,
      assessment: merged.aiAssessment,
      analysis: merged,
      generatedBy: 'claude',
    });
  } catch (error) {
    console.error('Typing Hero AI assessment error:', error);
    return NextResponse.json({
      success: true,
      assessment: fallbackAnalysis.aiAssessment,
      analysis: fallbackAnalysis,
      generatedBy: 'fallback',
    });
  }
}
