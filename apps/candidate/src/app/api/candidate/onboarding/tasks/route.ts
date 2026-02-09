import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserFromRequest } from '@/lib/supabase/auth';

// Wizard section definitions - the 8 steps
const WIZARD_SECTIONS = [
  { key: 'personal_info', title: 'Personal Information', description: 'Verify your personal details', taskType: 'form', icon: 'user' },
  { key: 'gov_id', title: 'Government IDs', description: 'Upload SSS, TIN, PhilHealth, and Pag-IBIG documents', taskType: 'upload', icon: 'id-card' },
  { key: 'education', title: 'Educational Background', description: 'Upload highest educational attainment documents', taskType: 'upload', icon: 'graduation-cap' },
  { key: 'medical', title: 'Medical Certificate', description: 'Upload your medical certificate', taskType: 'upload', icon: 'file-medical' },
  { key: 'data_privacy', title: 'Data Privacy Consent', description: 'Read and acknowledge the data privacy agreement', taskType: 'acknowledge', icon: 'shield' },
  { key: 'resume', title: 'Updated Resume', description: 'Upload your most recent resume', taskType: 'upload', icon: 'file-text' },
  { key: 'signature', title: 'Digital Signature', description: 'Provide your digital signature for documents', taskType: 'sign', icon: 'pen-tool' },
  { key: 'emergency_contact', title: 'Emergency Contact', description: 'Provide emergency contact information', taskType: 'form', icon: 'phone' },
];

// GET - Fetch onboarding tasks for candidate
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    // Get candidate's onboarding record from the wizard table
    const { data: onboarding, error: onboardingError } = await supabaseAdmin
      .from('candidate_onboarding')
      .select('*')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (onboardingError && onboardingError.code !== 'PGRST116') {
      console.error('Error fetching onboarding:', onboardingError);
    }

    // If no onboarding record, check if they have an accepted offer
    if (!onboarding) {
      // Check for accepted offer
      const { data: applications } = await supabaseAdmin
        .from('job_applications')
        .select('id, status')
        .eq('candidate_id', user.id)
        .in('status', ['offer_accepted', 'hired', 'onboarding']);

      if (!applications || applications.length === 0) {
        return NextResponse.json({ 
          tasks: [], 
          progress: { total: 0, completed: 0, pending: 0, overdue: 0, percentage: 0 },
          onboardingStatus: null,
          message: 'No onboarding tasks available yet. Accept a job offer to begin onboarding.'
        });
      }

      return NextResponse.json({ 
        tasks: [], 
        progress: { total: 0, completed: 0, pending: 0, overdue: 0, percentage: 0 },
        onboardingStatus: null,
        message: 'Onboarding is being prepared. Please check back soon.'
      });
    }

    // Convert wizard sections to task format
    const tasks = WIZARD_SECTIONS.map((section, index) => {
      const statusKey = `${section.key}_status` as keyof typeof onboarding;
      const status = onboarding[statusKey] as string || 'pending';
      
      return {
        id: `${onboarding.id}-${section.key}`,
        applicationId: onboarding.job_application_id,
        jobTitle: onboarding.position || 'New Position',
        company: onboarding.assigned_client || 'Company',
        taskType: section.taskType,
        title: section.title,
        description: section.description,
        isRequired: true,
        dueDate: onboarding.start_date,
        status: status,
        submittedAt: status === 'approved' ? onboarding.updated_at : null,
        reviewedAt: status === 'approved' ? onboarding.updated_at : null,
        reviewerNotes: (onboarding as any)[`${section.key}_feedback`] || null,
        createdAt: onboarding.created_at,
        order: index + 1,
        icon: section.icon,
      };
    });

    // Calculate progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'approved').length;
    const pendingTasks = tasks.filter(t => ['pending', 'submitted'].includes(t.status)).length;
    const overdueTasks = 0; // Could calculate based on start_date

    return NextResponse.json({
      tasks,
      progress: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        percentage: onboarding.completion_percent || Math.round((completedTasks / totalTasks) * 100),
      },
      onboardingStatus: {
        employmentStarted: onboarding.employment_started || false,
        employmentStartDate: onboarding.employment_start_date,
        startDate: onboarding.start_date,
        contractSigned: onboarding.contract_signed || false,
        isComplete: onboarding.is_complete || false,
      },
      onboardingId: onboarding.id,
      salary: onboarding.basic_salary,
      position: onboarding.position,
      company: onboarding.assigned_client,
    });

  } catch (error) {
    console.error('[Onboarding Tasks API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch onboarding tasks' }, { status: 500 });
  }
}
