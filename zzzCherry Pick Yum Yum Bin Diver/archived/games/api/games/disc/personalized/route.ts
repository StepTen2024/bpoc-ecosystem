import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { isAssessment, isBpoRoles, prompt, discScores, responses, userId, questionBankVersion } = body || {}

    // Check for API key
    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) {
      console.warn('⚠️ CLAUDE_API_KEY not found in environment variables, returning fallback responses')
      console.warn('⚠️ Please set CLAUDE_API_KEY in your .env file')
      return getFallbackResponse(isAssessment, discScores, prompt)
    }
    console.log('✅ CLAUDE_API_KEY found, proceeding with AI generation')

    if (isAssessment) {
      // Generate AI assessment using Claude
      try {
        console.log('🤖 Calling Claude API for assessment...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1500, // Reduced for faster response
            temperature: 0.7,
            messages: [{
              role: 'user',
              content: prompt
            }]
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('📦 Claude API raw response:', JSON.stringify(data, null, 2));
          
          // Handle different response structures
          let aiAssessment = '';
          if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            // Standard format: { content: [{ type: 'text', text: '...' }] }
            aiAssessment = data.content[0]?.text || data.content[0]?.content || '';
          } else if (data.text) {
            // Alternative format: { text: '...' }
            aiAssessment = data.text;
          } else if (typeof data === 'string') {
            // Direct string response
            aiAssessment = data;
          }
          
          console.log('✅ Claude API success:', {
            hasAssessment: !!aiAssessment,
            length: aiAssessment.length,
            firstChars: aiAssessment.substring(0, 100)
          });
          
          if (!aiAssessment || aiAssessment.trim().length === 0) {
            console.error('❌ Empty AI assessment received from Claude API');
            return getFallbackResponse(true, discScores, prompt)
          }
          
          return NextResponse.json({ aiAssessment, generatedBy: 'claude-sonnet-4' })
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('❌ Claude API error for assessment:', response.status, errorText);
          return getFallbackResponse(true, discScores, prompt)
        }
      } catch (error) {
        console.error('❌ Error calling Claude for assessment:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        return getFallbackResponse(true, discScores, prompt)
      }
    }

    if (isBpoRoles) {
      try {
        console.log('🤖 Calling Claude API for BPO roles...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1200,
            temperature: 0.6,
            messages: [{
              role: 'user',
              content: prompt
            }]
          })
        })

        if (response.ok) {
          const data = await response.json()
          let content = ''
          if (data.content && Array.isArray(data.content) && data.content.length > 0) {
            content = data.content[0]?.text || data.content[0]?.content || ''
          } else if (data.text) {
            content = data.text
          }

          const jsonMatch = content.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            try {
              const aiBpoRoles = JSON.parse(jsonMatch[0])
              if (Array.isArray(aiBpoRoles)) {
                return NextResponse.json({ aiBpoRoles, generatedBy: 'claude-sonnet-4' })
              }
            } catch {
              // fall through
            }
          }
        }
        return NextResponse.json({ aiBpoRoles: [], generatedBy: 'fallback' })
      } catch (error) {
        console.error('❌ Error calling Claude for BPO roles:', error)
        return NextResponse.json({ aiBpoRoles: [], generatedBy: 'fallback' })
      }
    }

    // Fetch user data for personalization from Supabase
    // Use admin client to bypass RLS and ensure we get all profile data
    let user = null
    if (userId) {
      try {
        const { getCandidateById } = await import('@/lib/db/candidates')
        const { getProfileByCandidate } = await import('@/lib/db/profiles')
        
        console.log('🔍 [PERSONALIZED] Fetching user data from tables:', {
          userId,
          tables: ['candidates', 'candidate_profiles']
        });
        
        // Use admin client (useAdmin: true) to bypass RLS for both queries
        const candidate = await getCandidateById(userId, true)
        const profile = await getProfileByCandidate(userId, true)
        
        console.log('📋 [PERSONALIZED] Fetched data from database:', {
          hasCandidate: !!candidate,
          hasProfile: !!profile,
          candidateData: candidate ? {
            id: candidate.id,
            email: candidate.email,
            first_name: candidate.first_name,
            last_name: candidate.last_name,
          } : null,
          profileData: profile ? {
            position: profile.position,
            current_position: profile.current_position,
            location: profile.location,
            location_city: profile.location_city,
            location_province: profile.location_province,
            bio: profile.bio ? `${profile.bio.substring(0, 50)}...` : null,
            birthday: profile.birthday,
          } : null
        });
        
        if (candidate) {
          // Build location string from available fields
          let locationString = profile?.location || 
                              profile?.location_city || 
                              profile?.location_province || 
                              'Metro Manila';
          
          // Build position string from available fields
          let positionString = profile?.position || 
                              profile?.current_position || 
                              'Professional';
          
          user = {
            id: candidate.id,
            email: candidate.email,
            first_name: candidate.first_name || 'User',
            last_name: candidate.last_name || '',
            location: locationString,
            position: positionString,
            bio: profile?.bio || null,
            birthday: profile?.birthday || null,
          }
          
          console.log('👤 [PERSONALIZED] Final user data for AI prompt:', {
            name: `${user.first_name} ${user.last_name}`.trim(),
            location: user.location,
            position: user.position,
            hasBio: !!user.bio,
            bioLength: user.bio?.length || 0,
            hasBirthday: !!user.birthday,
            age: user.birthday ? 'will be calculated' : 'default (25)'
          });
        } else {
          console.warn('⚠️ [PERSONALIZED] No candidate found in candidates table for userId:', userId);
        }
      } catch (error) {
        console.error('❌ [PERSONALIZED] Error fetching user data:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          userId
        });
      }
    } else {
      console.warn('⚠️ [PERSONALIZED] No userId provided in request body');
    }

    // Generate personalized questions using Claude
    try {
      // Calculate age from birthday if available
      let age = 25 // default
      if (user?.birthday) {
        const birthDate = new Date(user.birthday)
        const today = new Date()
        age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
      }

      // Create response analysis
      const responseAnalysis = responses ? responses.map((r: any, i: number) => {
        const optionText = r.selectedOptionText || '';
        const optionReaction = r.selectedOptionReaction || '';
        const context = r.context || 'UNKNOWN';
        const title = r.title || '';
        const scenario = r.scenario || '';
        return `Q${i+1} [${context}] ${title}\nScenario: ${scenario}\nSelected: "${optionText}" (Choice ${r.selectedChoice}, ${r.discType})\nReaction: "${optionReaction}"\nResponse time: ${r.responseTime}ms`;
      }).join('\n\n') : 'No detailed responses available'

      // Calculate personality patterns by context
      const personalityPatterns: any = {}
      if (responses) {
        // Group responses by context and calculate DISC patterns
        responses.forEach((r: any) => {
          const context = r.context || 'UNKNOWN'
          if (!personalityPatterns[context]) {
            personalityPatterns[context] = { D: 0, I: 0, S: 0, C: 0, total: 0 }
          }
          personalityPatterns[context][r.discType]++
          personalityPatterns[context].total++
        })
      }

      // Safe scores calculation
      const safeScores = {
        D: discScores?.D || 0,
        I: discScores?.I || 0,
        S: discScores?.S || 0,
        C: discScores?.C || 0
      }

      const personalizedPrompt = `You are a Filipino psychology expert creating brutally honest personality assessment questions.

REAL USER PROFILE:
Name: ${user?.first_name || 'User'} ${user?.last_name || ''}
Age: ${age}
Location: ${user?.location || 'Metro Manila'}
Position: ${user?.position || 'Professional'}
Bio: ${user?.bio || 'No bio provided'}
Email: ${user?.email || 'No email provided'}

ACTUAL 30 RESPONSES ANALYSIS:
${responseAnalysis}

PERSONALITY PATTERNS BY CONTEXT:
${JSON.stringify(personalityPatterns, null, 2)}

QUESTION BANK VERSION:
${questionBankVersion || 'unknown'}

CURRENT DISC SCORES AFTER 30 QUESTIONS:
D (Eagle): ${safeScores.D || 0} - ${Math.round(((safeScores.D || 0) / 30) * 100)}% dominance
I (Peacock): ${safeScores.I || 0} - ${Math.round(((safeScores.I || 0) / 30) * 100)}% influence  
S (Turtle): ${safeScores.S || 0} - ${Math.round(((safeScores.S || 0) / 30) * 100)}% steadiness
C (Owl): ${safeScores.C || 0} - ${Math.round(((safeScores.C || 0) / 30) * 100)}% conscientiousness

PERSONALITY CONFLICTS TO EXPLOIT:
Based on the actual responses, ${user?.first_name || 'this person'} shows conflicting patterns that need deeper testing.

Create 5 BRUTAL personalized questions that:
1. Use ${user?.first_name || 'the user'}'s exact name and situation
2. Reference their actual location (${user?.location || 'Metro Manila'})
3. Match their professional level (${user?.position || 'Professional'})
4. Force choices between their competing personality sides
5. Make it impossible to fake - reveal their TRUE authentic self

Each question MUST:
- Address ${user?.first_name || 'the user'} directly by name
- Reference their real location and work situation
- Create conflict between their different personality patterns
- Have consequences that reveal their deepest values
- Be authentically Filipino in context and language

Format as JSON array with 5 questions:
[
  {
    "id": 31,
    "context": "PERSONALIZED",
    "title": "Brutally honest title using ${user?.first_name || 'User'}'s name",
    "scenario": "Specific situation with ${user?.first_name || 'User'}'s exact context in ${user?.location || 'Metro Manila'}, addressing them directly",
    "options": [
      {"id": "A", "disc": "D", "animal": "🦅 ACTION NAME", "text": "What ${user?.first_name || 'User'} would do", "reaction": "Real outcome for ${user?.first_name || 'User'}"},
      {"id": "B", "disc": "I", "animal": "🦚 SOCIAL NAME", "text": "Alternative for ${user?.first_name || 'User'}", "reaction": "Different result"},
      {"id": "C", "disc": "S", "animal": "🐢 STEADY NAME", "text": "Safe option for ${user?.first_name || 'User'}", "reaction": "Stable outcome"},
      {"id": "D", "disc": "C", "animal": "🦉 WISE NAME", "text": "Logical approach for ${user?.first_name || 'User'}", "reaction": "Analytical result"}
    ]
  }
]

Make it PERSONAL. Use ${user?.first_name || 'User'}'s name throughout. Make it impossible to game.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: personalizedPrompt
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.content?.[0]?.text || data.content?.[0]?.content || ''
        
        console.log('📦 Claude API response for personalized questions:', {
          hasContent: !!content,
          contentLength: content.length,
          firstChars: content.substring(0, 200)
        });
        
        // Extract JSON from Claude's response
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          try {
            const personalizedQuestions = JSON.parse(jsonMatch[0])
            
            // Validate that we got actual personalized questions (not empty)
            if (personalizedQuestions && Array.isArray(personalizedQuestions) && personalizedQuestions.length > 0) {
              // Check if questions are actually personalized (contain user name or location)
              const isPersonalized = personalizedQuestions.some((q: any) => 
                (q.title && (q.title.includes(user?.first_name || '') || q.title !== `Personal Challenge ${q.id - 30}`)) ||
                (q.scenario && q.scenario !== 'Based on your earlier choices, how would you respond in this situation?')
              );
              
              if (isPersonalized) {
                console.log(`✅ Generated ${personalizedQuestions.length} personalized questions via Claude`)
                return NextResponse.json({ personalizedQuestions })
              } else {
                console.warn('⚠️ Questions generated but appear to be generic, using fallback')
                return getFallbackResponse(false, discScores)
              }
            } else {
              console.error('❌ Empty or invalid personalized questions array')
              return getFallbackResponse(false, discScores)
            }
          } catch (parseError) {
            console.error('❌ Error parsing Claude JSON:', parseError)
            console.error('❌ Raw content:', content.substring(0, 500))
            return getFallbackResponse(false, discScores)
          }
        } else {
          console.error('❌ No JSON found in Claude response')
          console.error('❌ Raw content:', content.substring(0, 500))
          return getFallbackResponse(false, discScores)
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error('❌ Claude API error for personalized questions:', response.status, errorText)
        return getFallbackResponse(false, discScores)
      }
    } catch (error) {
      console.error('Error calling Claude for personalized questions:', error)
      return getFallbackResponse(false, discScores)
    }

  } catch (error) {
    console.error('Error in personalized API:', error)
    return NextResponse.json({ personalizedQuestions: [] })
  }
}

// Fallback function for when Claude API is unavailable
function getFallbackResponse(isAssessment: boolean, discScores?: any, prompt?: string) {
  if (isAssessment) {
    const primary = discScores ? Object.entries(discScores).sort(([,a],[,b]) => (b as number) - (a as number))[0]?.[0] : 'D'
    const primaryTypeName = primary === 'D' ? 'dynamic leader' : primary === 'I' ? 'natural influencer' : primary === 'S' ? 'steady supporter' : 'analytical thinker'
    const totalQuestions = discScores ? Object.values(discScores).reduce((a: number, b: number) => a + b, 0) : 29
    const text = `Your comprehensive ${totalQuestions}-question assessment reveals a ${primaryTypeName} with strong potential. Your response patterns show consistent decision-making that indicates excellent professional capabilities and cultural adaptability in the Philippine workplace.`
    console.warn('⚠️ Using fallback assessment (AI unavailable)');
    return NextResponse.json({ aiAssessment: text, generatedBy: 'fallback' })
  }

  // Fallback personalized questions
  const baseId = 31
  const makeOption = (id: string, disc: 'D'|'I'|'S'|'C', text: string, reaction: string) => ({ 
    id, disc, animal: disc === 'D' ? '🦅 LEADER' : disc === 'I' ? '🦚 CONNECTOR' : disc === 'S' ? '🐢 SUPPORTER' : '🦉 ANALYST', text, reaction 
  })

  const questions = Array.from({ length: 5 }).map((_, idx) => ({
    id: baseId + idx,
    context: 'PERSONALIZED',
    title: `Personal Challenge ${idx + 1}`,
    scenario: 'Based on your earlier choices, how would you respond in this situation?',
    options: [
      makeOption('A', 'D', 'Take charge and set the direction for everyone', 'You lead decisively and inspire confidence'),
      makeOption('B', 'I', 'Bring people together and energize the team', 'Your positivity creates momentum'),
      makeOption('C', 'S', 'Support steadily and keep things calm', 'Your consistency grounds the group'),
      makeOption('D', 'C', 'Analyze carefully and design a solid plan', 'Your clarity improves quality for all'),
    ],
  }))

  return NextResponse.json({ personalizedQuestions: questions })
}
