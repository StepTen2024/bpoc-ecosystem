import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - Get real-time command center stats
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get onboarding stats
    const { data: onboardings, error: onboardingError } = await supabaseAdmin
      .from('candidate_onboarding')
      .select('id, is_complete, completion_percent, created_at, updated_at, personal_info_status, gov_id_status, education_status, medical_status, data_privacy_status, resume_status, signature_status, emergency_contact_status');

    if (onboardingError) {
      console.error('Error fetching onboardings:', onboardingError);
    }

    const allOnboardings = onboardings || [];
    
    // Calculate stats
    const activeOnboarding = allOnboardings.filter(o => !o.is_complete).length;
    const completedToday = allOnboardings.filter(o => 
      o.is_complete && new Date(o.updated_at) >= today
    ).length;

    // Count all status fields to get processing metrics
    const statusFields = ['personal_info_status', 'gov_id_status', 'education_status', 'medical_status', 'data_privacy_status', 'resume_status', 'signature_status', 'emergency_contact_status'];
    
    let totalProcessed = 0;
    let autoApproved = 0;
    let flagged = 0;
    let processing = 0;

    allOnboardings.forEach(o => {
      statusFields.forEach(field => {
        const status = (o as any)[field];
        if (status === 'approved') {
          totalProcessed++;
          autoApproved++;
        } else if (status === 'submitted') {
          totalProcessed++;
          processing++;
        } else if (status === 'rejected') {
          totalProcessed++;
          flagged++;
        } else if (status === 'pending') {
          // Not processed yet
        }
      });
    });

    return NextResponse.json({
      stats: {
        processing,
        todayProcessed: totalProcessed,
        autoApproved,
        flagged,
        activeOnboarding,
        completedToday,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[Command Center Stats] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
