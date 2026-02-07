import { NextRequest, NextResponse } from 'next/server'
import { saveTypingAssessment } from '@/lib/db/assessments'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Save Typing Hero session data to Supabase candidate_typing_assessments table
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')

  try {
    const body = await request.json()
    const {
      assessment_id, // ID of existing 'started' record to update
      score,
      wpm,
      longest_streak,
      correct_words,
      wrong_words,
      elapsed_time,
      overall_accuracy,
      ai_analysis,
      words_correct,
      words_incorrect,
      generated_story,
      difficulty_level = 'rockstar',
      vocabulary_strengths,
      vocabulary_weaknesses,
      anon_session_id,
    } = body || {}

    // Validate required fields
    if (typeof score !== 'number' || typeof wpm !== 'number' || typeof longest_streak !== 'number' ||
        typeof correct_words !== 'number' || typeof wrong_words !== 'number' || 
        typeof elapsed_time !== 'number' || typeof overall_accuracy !== 'number') {
      throw new Error('Missing required numeric fields')
    }

    // Validate word arrays
    const validatedWordsCorrect = Array.isArray(words_correct) ? words_correct : []
    const validatedWordsIncorrect = Array.isArray(words_incorrect) ? words_incorrect : []

    // For anonymous users, save to anonymous_sessions table
    if (!userId) {
      // Generate unique session ID if not provided
      const sessionId = anon_session_id || `typing-hero-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      // Prepare payload with all game data
      const payload = {
        game_type: 'typing-hero',
        score: Math.round(score),
        wpm: Math.round(wpm),
        longest_streak: Math.round(longest_streak),
        correct_words: Math.round(correct_words),
        wrong_words: Math.round(wrong_words),
        elapsed_time: Math.round(elapsed_time),
        overall_accuracy: Math.round(overall_accuracy * 100) / 100,
        words_correct: validatedWordsCorrect,
        words_incorrect: validatedWordsIncorrect,
        ai_analysis: ai_analysis || {},
        vocabulary_strengths: vocabulary_strengths || [],
        vocabulary_weaknesses: vocabulary_weaknesses || [],
        generated_story: generated_story || null,
        difficulty_level: difficulty_level || 'rockstar',
        completed_at: new Date().toISOString(),
      }
      
      // Save to anonymous_sessions table
      const { error: saveError } = await supabaseAdmin
        .from('anonymous_sessions')
        .upsert(
          {
            anon_session_id: sessionId,
            channel: 'typing-hero',
            email: null,
            payload: payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'anon_session_id' }
        )
      
      if (saveError) {
        console.error('❌ Failed to save anonymous typing hero session:', saveError)
        return NextResponse.json({ 
          success: false,
          error: 'Failed to save session',
          anonymous: true,
        }, { status: 500 })
      }
      
      console.log(`✅ Typing Hero session saved to anonymous_sessions:`, {
        anonSessionId: sessionId,
        score: Math.round(score),
        wpm: Math.round(wpm),
        accuracy: Math.round(overall_accuracy * 100) / 100,
      })
      
      return NextResponse.json({ 
        success: true, 
        sessionId: sessionId,
        message: 'Session saved! Sign up to link it to your account permanently.',
        anonymous: true,
      })
    }

    // If assessment_id is provided, UPDATE the existing record instead of creating new
    let sessionId: string
    
    if (assessment_id) {
      // Update existing 'started' record with game completion data
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('candidate_typing_assessments')
        .update({
          session_status: 'completed',
          difficulty_level,
          elapsed_time: Math.round(elapsed_time),
          score: Math.round(score),
          wpm: Math.round(wpm),
          overall_accuracy: Math.round(overall_accuracy * 100) / 100,
          longest_streak: Math.round(longest_streak),
          correct_words: Math.round(correct_words),
          wrong_words: Math.round(wrong_words),
          words_correct: validatedWordsCorrect,
          words_incorrect: validatedWordsIncorrect,
          ai_analysis: ai_analysis || {},
          vocabulary_strengths: vocabulary_strengths || [],
          vocabulary_weaknesses: vocabulary_weaknesses || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', assessment_id)
        .eq('candidate_id', userId)
        .select('id')
        .single()
      
      if (updateError) {
        console.error('❌ Failed to update assessment:', updateError)
        throw new Error(`Failed to update assessment: ${updateError.message}`)
      }
      
      sessionId = updated.id
      console.log(`✅ Updated existing typing assessment ${sessionId} to completed`)
    } else {
      // Create new record (fallback for when no assessment_id provided)
      const result = await saveTypingAssessment(userId, {
        difficulty_level,
        elapsed_time: Math.round(elapsed_time),
        score: Math.round(score),
        wpm: Math.round(wpm),
        overall_accuracy: Math.round(overall_accuracy * 100) / 100,
        longest_streak: Math.round(longest_streak),
        correct_words: Math.round(correct_words),
        wrong_words: Math.round(wrong_words),
        words_correct: validatedWordsCorrect,
        words_incorrect: validatedWordsIncorrect,
        ai_analysis: ai_analysis || {},
        vocabulary_strengths: vocabulary_strengths || [],
        vocabulary_weaknesses: vocabulary_weaknesses || [],
        generated_story: generated_story || null,
      })
      sessionId = result.id
    }

    console.log(`✅ Typing Hero session saved successfully for user ${userId}:`, {
      sessionId,
      score: Math.round(score),
      wpm: Math.round(wpm),
      accuracy: Math.round(overall_accuracy * 100) / 100,
    })
    
    return NextResponse.json({ 
      success: true, 
      sessionId,
      message: 'Session saved successfully',
      userId: userId,
    })
  } catch (e) {
    console.error('Failed to save typing hero session', e)
    return NextResponse.json({ 
      error: 'Failed to save session',
      details: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 })
  }
}

