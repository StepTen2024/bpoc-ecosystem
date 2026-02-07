import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
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
    const { sessionId, response, questionBankVersion } = body || {}

    if (!response) {
      return NextResponse.json({ error: 'Missing response' }, { status: 400 })
    }

    const payload = {
      candidate_id: userId,
      session_id: sessionId || null,
      question_id: response.questionId || null,
      question_index: response.questionIndex || null,
      question_type: response.questionType || null,
      context: response.context || null,
      title: response.title || null,
      scenario: response.scenario || null,
      options: response.options || [],
      selected_choice: response.selectedChoice || null,
      selected_option_text: response.selectedOptionText || null,
      selected_option_reaction: response.selectedOptionReaction || null,
      disc_type: response.discType || null,
      response_time_ms: response.responseTime || null,
      answered_at: response.timestamp || new Date().toISOString(),
      question_bank_version: questionBankVersion || response.questionBankVersion || null
    }

    const { error } = await supabaseAdmin
      .from('candidate_disc_responses')
      .insert(payload)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to save answer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
