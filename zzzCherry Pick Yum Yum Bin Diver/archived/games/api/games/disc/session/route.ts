import { NextRequest, NextResponse } from 'next/server'
import { saveDiscAssessment } from '@/lib/db/assessments'
import { getProfileByCandidate } from '@/lib/db/profiles'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Save DISC personality session data to Supabase candidate_disc_assessments table
export async function POST(request: NextRequest) {
  try {
    let userId = request.headers.get('x-user-id')
    
    // If x-user-id not present, try to extract from Authorization header
    if (!userId) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        try {
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
          if (!error && user) {
            userId = user.id
            console.log('✅ Extracted user ID from Authorization token:', userId)
          }
        } catch (e) {
          console.warn('⚠️ Failed to extract user from token:', e)
        }
      }
    }
    
    const body = await request.json()
    
    // For anonymous users, save to anonymous_sessions table
    if (!userId) {
      const { 
        sessionStartTime,
        finalResults, 
        coreScores, 
        aiAssessment, 
        aiBpoRoles, 
        coreResponses, 
        personalizedResponses,
        userContext,
        anon_session_id,
        sessionId: providedSessionId,
        personalizedQuestions,
        questionBankVersion
      } = body || {}
      
      // Generate unique session ID if not provided
      const sessionId = anon_session_id || providedSessionId || `disc-personality-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      // Calculate scores for anonymous user
      const safeScores = {
        D: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.D || coreScores?.D || 0))),
        I: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.I || coreScores?.I || 0))),
        S: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.S || coreScores?.S || 0))),
        C: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.C || coreScores?.C || 0)))
      }
      
      // Calculate session duration
      const startTime = sessionStartTime ? new Date(sessionStartTime) : new Date()
      const endTime = new Date()
      const durationSeconds = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000))
      
      // Determine primary and secondary types
      const pickPrimary = () => {
        if (finalResults?.primaryType && ['D','I','S','C'].includes(finalResults.primaryType)) return finalResults.primaryType
        const entries = Object.entries(safeScores).sort((a,b) => (b[1] as number) - (a[1] as number))
        return (entries[0]?.[0] as 'D'|'I'|'S'|'C') || 'D'
      }
      const pickSecondary = () => {
        if (finalResults?.secondaryType && ['D','I','S','C'].includes(finalResults.secondaryType)) return finalResults.secondaryType
        const entries = Object.entries(safeScores).sort((a,b) => (b[1] as number) - (a[1] as number))
        return (entries[1]?.[0] as 'D'|'I'|'S'|'C') || null
      }
      
      const primaryType = pickPrimary()
      const secondaryType = pickSecondary()
      const confidenceScore = Math.round(finalResults?.confidence || 85)
      const culturalAlignment = Math.round(finalResults?.culturalAlignment || 95)
      
      const xpEarned = Math.round(
        (confidenceScore * 2) + (culturalAlignment * 1.5) +
        ((coreResponses?.length || 30) + (personalizedResponses?.length || 0)) * 5
      )
      
      // Prepare AI assessment
      const aiAssessmentObj = (aiAssessment && typeof aiAssessment === 'string' && aiAssessment.trim().length > 0)
        ? { text: aiAssessment, generated_at: new Date().toISOString() }
        : {
            text: `Your comprehensive assessment reveals a ${primaryType === 'D' ? 'dynamic leader' : primaryType === 'I' ? 'natural influencer' : primaryType === 'S' ? 'steady supporter' : 'analytical thinker'} with strong potential.`,
            generated_at: new Date().toISOString(),
            isFallback: true
          }
      
      // Prepare payload with all game data
      const payload = {
        game_type: 'disc-personality',
        started_at: startTime.toISOString(),
        finished_at: endTime.toISOString(),
        duration_seconds: durationSeconds,
        total_questions: (coreResponses?.length || 30) + (personalizedResponses?.length || 0),
        d_score: safeScores.D,
        i_score: safeScores.I,
        s_score: safeScores.S,
        c_score: safeScores.C,
        primary_type: primaryType,
        secondary_type: secondaryType,
        confidence_score: confidenceScore,
        consistency_index: finalResults?.consistency || null,
        cultural_alignment: culturalAlignment,
        authenticity_score: finalResults?.authenticity ? Math.round(finalResults.authenticity) : null,
        ai_assessment: aiAssessmentObj,
        ai_bpo_roles: Array.isArray(aiBpoRoles) ? aiBpoRoles : [],
        core_responses: Array.isArray(coreResponses) ? coreResponses : [],
        personalized_responses: Array.isArray(personalizedResponses) ? personalizedResponses : [],
        response_patterns: {
          total_responses: (coreResponses?.length || 0) + (personalizedResponses?.length || 0),
          avg_response_time: coreResponses?.length > 0 ? 
            Math.round(coreResponses.reduce((sum: number, r: any) => sum + (r.responseTime || 0), 0) / coreResponses.length) : 0,
          consistency_score: confidenceScore
        },
        personalized_questions: Array.isArray(personalizedQuestions) ? personalizedQuestions : [],
        question_bank_version: questionBankVersion || null,
        session_id: sessionId,
        user_position: userContext?.position || null,
        user_location: userContext?.location || null,
        user_experience: userContext?.bio || null,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      }
      
      // Save to anonymous_sessions table
      const { error: saveError } = await supabaseAdmin
        .from('anonymous_sessions')
        .upsert(
          {
            anon_session_id: sessionId,
            channel: 'disc-personality',
            email: null,
            payload: payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'anon_session_id' }
        )
      
      if (saveError) {
        console.error('❌ Failed to save anonymous DISC session:', saveError)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to save session',
          anonymous: true,
        }, { status: 500 })
      }
      
      console.log('✅ DISC session saved to anonymous_sessions:', {
        anonSessionId: sessionId,
        primaryType,
        scores: safeScores,
      })
      
      return NextResponse.json({ 
        success: true, 
        sessionId: sessionId,
        message: 'Session saved! Sign up to link it to your account permanently.',
        anonymous: true,
        totals: {
          total_xp: xpEarned,
          latest_session_xp: xpEarned,
          badges_earned: 0
        }
      })
    }

    console.log('💾 Saving DISC session to Supabase for user:', userId)
    console.log('📊 Request body keys:', Object.keys(body || {}))

    const {
      sessionStartTime,
      coreResponses,
      coreScores,
      personalizedResponses,
      finalResults,
      aiAssessment,
      aiBpoRoles,
      userContext,
      sessionId,
      personalizedQuestions,
      questionBankVersion
    } = body || {}
    
    // Fetch profile data as fallback if userContext is missing data
    // Use admin client to bypass RLS
    let profileData: any = null;
    try {
      profileData = await getProfileByCandidate(userId, true); // useAdmin = true
      console.log('📋 Profile data fetched:', {
        hasProfile: !!profileData,
        position: profileData?.position,
        current_position: profileData?.current_position,
        location: profileData?.location,
        bio: profileData?.bio,
        fullProfile: profileData
      });
    } catch (profileError) {
      console.warn('⚠️ Failed to fetch profile:', profileError);
    }
    
    // Helper to check if value is meaningful (not null, undefined, or empty string)
    const hasValue = (val: any): boolean => {
      return val !== null && val !== undefined && val !== '' && String(val).trim() !== '';
    };
    
    // Merge userContext with profile data (profile takes precedence if userContext is missing)
    // Try multiple field names for position
    const finalUserContext = {
      position: (hasValue(userContext?.position) ? userContext.position : null) || 
                (hasValue(profileData?.position) ? profileData.position : null) || 
                (hasValue(profileData?.current_position) ? profileData.current_position : null) || 
                null,
      location: (hasValue(userContext?.location) ? userContext.location : null) || 
               (hasValue(profileData?.location) ? profileData.location : null) || 
               (hasValue(profileData?.location_city) ? profileData.location_city : null) || 
               null,
      bio: (hasValue(userContext?.bio) ? userContext.bio : null) || 
           (hasValue(profileData?.bio) ? profileData.bio : null) || 
           null
    };
    
    console.log('🔍 Final userContext after merge:', {
      finalUserContext,
      userContextFromRequest: userContext,
      profileDataAvailable: !!profileData
    });

    // Calculate session duration
    let startTime: Date
    if (sessionStartTime) {
      // Handle both Date objects (from toISOString) and timestamps
      startTime = typeof sessionStartTime === 'string' 
        ? new Date(sessionStartTime) 
        : sessionStartTime instanceof Date 
        ? sessionStartTime 
        : new Date(sessionStartTime)
    } else {
      startTime = new Date()
    }
    
    const endTime = new Date()
    const durationSeconds = Math.max(0, Math.floor((endTime.getTime() - startTime.getTime()) / 1000))
    
    console.log('⏱️ Session timing:', {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds
    })

    // Prepare session data for Supabase schema
    const safeScores = {
      D: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.D || coreScores?.D || 0))),
      I: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.I || coreScores?.I || 0))),
      S: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.S || coreScores?.S || 0))),
      C: Math.max(0, Math.min(100, Math.round(finalResults?.scores?.C || coreScores?.C || 0)))
    }

    const pickPrimary = () => {
      if (finalResults?.primaryType && ['D','I','S','C'].includes(finalResults.primaryType)) return finalResults.primaryType
      const entries = Object.entries(safeScores).sort((a,b) => (b[1] as number) - (a[1] as number))
      return (entries[0]?.[0] as 'D'|'I'|'S'|'C') || 'D'
    }
    const pickSecondary = () => {
      if (finalResults?.secondaryType && ['D','I','S','C'].includes(finalResults.secondaryType)) return finalResults.secondaryType
      const entries = Object.entries(safeScores).sort((a,b) => (b[1] as number) - (a[1] as number))
      return (entries[1]?.[0] as 'D'|'I'|'S'|'C') || null
    }

    const primaryType = pickPrimary()
    const secondaryType = pickSecondary()
    const confidenceScore = Math.round(finalResults?.confidence || 85)
    const culturalAlignment = Math.round(finalResults?.culturalAlignment || 95)
    
    // Calculate XP
    const xpEarned = Math.round(
      (confidenceScore * 2) +
      (culturalAlignment * 1.5) +
      ((coreResponses?.length || 30) + (personalizedResponses?.length || 0)) * 5 +
      (durationSeconds < 600 ? 50 : 0)
    )

    // Prepare AI assessment
    const aiAssessmentObj = (aiAssessment && typeof aiAssessment === 'string' && aiAssessment.trim().length > 0)
      ? { text: aiAssessment, generated_at: new Date().toISOString() }
      : {
          text: `Your comprehensive assessment reveals a ${primaryType === 'D' ? 'dynamic leader' : primaryType === 'I' ? 'natural influencer' : primaryType === 'S' ? 'steady supporter' : 'analytical thinker'} with strong potential. Your response patterns show consistent decision-making that indicates excellent professional capabilities and cultural adaptability in the Philippine workplace.`,
          generated_at: new Date().toISOString(),
          isFallback: true
        }

    // Prepare assessment data
    const assessmentData = {
      started_at: startTime.toISOString(),
      finished_at: endTime.toISOString(),
      duration_seconds: durationSeconds,
      total_questions: (coreResponses?.length || 30) + (personalizedResponses?.length || 0),
      d_score: safeScores.D,
      i_score: safeScores.I,
      s_score: safeScores.S,
      c_score: safeScores.C,
      primary_type: primaryType,
      secondary_type: secondaryType,
      confidence_score: confidenceScore,
      consistency_index: finalResults?.consistency || null,
      cultural_alignment: culturalAlignment,
      authenticity_score: finalResults?.authenticity ? Math.round(finalResults.authenticity) : null,
      ai_assessment: aiAssessmentObj,
      ai_bpo_roles: Array.isArray(aiBpoRoles) ? aiBpoRoles : [],
      core_responses: Array.isArray(coreResponses) ? coreResponses : [],
      personalized_responses: Array.isArray(personalizedResponses) ? personalizedResponses : [],
      response_patterns: {
        total_responses: (coreResponses?.length || 0) + (personalizedResponses?.length || 0),
        avg_response_time: coreResponses?.length > 0 ? 
          Math.round(coreResponses.reduce((sum: number, r: any) => sum + (r.responseTime || 0), 0) / coreResponses.length) : 0,
        consistency_score: confidenceScore
      },
      personalized_questions: Array.isArray(personalizedQuestions) ? personalizedQuestions : [],
      question_bank_version: questionBankVersion || null,
      session_id: sessionId || null,
      user_position: finalUserContext.position,
      user_location: finalUserContext.location,
      user_experience: finalUserContext.bio,
      xp_earned: xpEarned,
    }

    console.log('💾 Saving assessment data:', {
      userId,
      primaryType,
      scores: safeScores,
      responsesCount: coreResponses?.length || 0,
      hasAiAssessment: !!aiAssessmentObj,
      hasBpoRoles: Array.isArray(aiBpoRoles) && aiBpoRoles.length > 0,
      userContextFromRequest: userContext,
      profileData: {
        position: profileData?.position || profileData?.current_position,
        location: profileData?.location,
        bio: profileData?.bio
      },
      finalUserContext: finalUserContext,
      userPosition: finalUserContext.position,
      userLocation: finalUserContext.location,
      userExperience: finalUserContext.bio,
      assessmentDataFields: {
        user_position: assessmentData.user_position,
        user_location: assessmentData.user_location,
        user_experience: assessmentData.user_experience
      }
    })

    // Save to Supabase candidate_disc_assessments table
    const result = await saveDiscAssessment(userId, assessmentData)
    
    console.log('✅ Assessment saved successfully:', {
      assessmentId: result.id,
      xpEarned: result.xp_earned
    })

    // Get updated profile for XP totals
    const profile = await getProfileByCandidate(userId)
    const totalXp = profile?.gamification?.total_xp || 0

    return NextResponse.json({ 
      success: true, 
      sessionId: result.id,
      message: 'DISC session saved successfully',
      totals: {
        total_xp: totalXp,
        latest_session_xp: xpEarned,
        badges_earned: confidenceScore >= 85 ? 1 : 0
      }
    })

  } catch (error) {
    console.error('❌ Failed to save DISC session:', error)
    return NextResponse.json({ 
      error: 'Failed to save session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Patch AI results after initial save (non-blocking)
export async function PATCH(request: NextRequest) {
  try {
    let userId = request.headers.get('x-user-id')
    if (!userId) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        try {
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
          if (!error && user) {
            userId = user.id
          }
        } catch {
          // ignore
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, aiAssessment, aiBpoRoles } = body || {}

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const updatePayload: any = {}
    if (typeof aiAssessment === 'string' && aiAssessment.trim().length > 0) {
      updatePayload.ai_assessment = { text: aiAssessment, generated_at: new Date().toISOString() }
    }
    if (Array.isArray(aiBpoRoles)) {
      updatePayload.ai_bpo_roles = aiBpoRoles
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ success: true, updated: false })
    }

    const { error } = await supabaseAdmin
      .from('candidate_disc_assessments')
      .update(updatePayload)
      .eq('candidate_id', userId)
      .eq('session_id', sessionId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: true })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to update session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
