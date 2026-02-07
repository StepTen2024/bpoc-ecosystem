import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { story } = body;

    if (!story) {
      return NextResponse.json({ error: 'Missing story' }, { status: 400 });
    }

    console.log('💾 Saving story to DB for user:', userId);

    // Save story to candidate_typing_assessments with a "started" session
    const { data, error } = await supabaseAdmin
      .from('candidate_typing_assessments')
      .insert({
        candidate_id: userId,
        session_status: 'started',
        difficulty_level: 'rookie',
        wpm: 0,
        score: 0,
        overall_accuracy: 0,
        elapsed_time: 0,
        longest_streak: 0,
        correct_words: 0,
        wrong_words: 0,
        words_correct: [],
        words_incorrect: [],
        generated_story: JSON.stringify(story),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ DB save error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code 
      }, { status: 500 });
    }

    console.log('✅ Story saved successfully, ID:', data.id);
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Save story error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
