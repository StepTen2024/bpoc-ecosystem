import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * POST /api/games/typing-hero/load-user-story
 * Loads the user's active story from their most recent typing assessment
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    console.log('📖 Loading story from Supabase for user:', userId)

    // Get the most recent 'started' (incomplete) typing assessment with a generated story
    // If none found, fall back to most recent assessment with a story
    let { data: assessment, error } = await supabaseAdmin
      .from('candidate_typing_assessments')
      .select('id, generated_story, session_status')
      .eq('candidate_id', userId)
      .eq('session_status', 'started')
      .not('generated_story', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    // If no 'started' session found, get the most recent one regardless of status
    if (!assessment) {
      const result = await supabaseAdmin
        .from('candidate_typing_assessments')
        .select('id, generated_story, session_status')
        .eq('candidate_id', userId)
        .not('generated_story', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      assessment = result.data
      error = result.error
    }

    if (error) {
      // If no rows found, that's okay - user just doesn't have a story yet
      if (error.code === 'PGRST116') {
        console.log('📖 No story found in database for user:', userId)
        return NextResponse.json(
          { story: null, hasStory: false },
          { status: 200 }
        )
      }
      console.error('❌ Error querying Supabase:', error)
      throw error
    }

    if (!assessment || !assessment.generated_story) {
      console.log('📖 No story found in database for user:', userId)
      return NextResponse.json(
        { story: null, hasStory: false },
        { status: 200 }
      )
    }

    // Parse the story JSON
    let story
    try {
      story = typeof assessment.generated_story === 'string' 
        ? JSON.parse(assessment.generated_story)
        : assessment.generated_story
    } catch (parseError) {
      console.error('❌ Error parsing story JSON:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse story data' },
        { status: 500 }
      )
    }

    console.log('✅ Story loaded from database:', {
      assessmentId: assessment.id,
      sessionStatus: assessment.session_status,
      storyId: story.id,
      title: story.title,
      chapters: story.chapters?.length || 0,
      createdAt: story.createdAt
    })

    return NextResponse.json({
      story,
      hasStory: true,
      assessmentId: assessment.id, // Return ID so frontend can update this record
      sessionStatus: assessment.session_status
    })

  } catch (error) {
    console.error('❌ Error loading user story:', error)
    return NextResponse.json(
      { error: `Failed to load story: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

