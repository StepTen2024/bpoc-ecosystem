import { supabaseAdmin } from '@/lib/supabase/admin';

// Confidence thresholds for auto-approval
const AUTO_APPROVE_THRESHOLD = 90;
const FLAG_THRESHOLD = 70;

interface ProcessResult {
  action: 'auto_approved' | 'flagged' | 'pending_review';
  confidence: number;
  reason?: string;
}

interface ExtractedData {
  [key: string]: any;
  _confidence?: number;
}

/**
 * Auto-process extracted document data
 * - High confidence (>90%) → Auto-approve
 * - Medium confidence (70-90%) → Pending review
 * - Low confidence (<70%) → Flag for human review
 */
export async function autoProcessDocument(
  onboardingId: string,
  docType: string,
  extractedData: ExtractedData
): Promise<ProcessResult> {
  
  // Calculate overall confidence from extracted data
  const confidence = calculateConfidence(docType, extractedData);
  
  // Determine action based on confidence
  let action: ProcessResult['action'];
  let reason: string | undefined;

  if (confidence >= AUTO_APPROVE_THRESHOLD) {
    action = 'auto_approved';
    
    // Auto-approve: Update status directly
    const statusField = `${docType}_status`;
    await supabaseAdmin
      .from('candidate_onboarding')
      .update({
        [statusField]: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', onboardingId);

    // Log the auto-approval
    await logActivity(onboardingId, 'auto_approve', docType, confidence);
    
  } else if (confidence >= FLAG_THRESHOLD) {
    action = 'pending_review';
    reason = 'Confidence below auto-approve threshold';
    
    // Update status to submitted (pending human review)
    const statusField = `${docType}_status`;
    await supabaseAdmin
      .from('candidate_onboarding')
      .update({
        [statusField]: 'submitted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', onboardingId);

    await logActivity(onboardingId, 'pending_review', docType, confidence);
    
  } else {
    action = 'flagged';
    reason = 'Low confidence - requires human verification';
    
    // Flag for review
    const statusField = `${docType}_status`;
    const feedbackField = `${docType}_feedback`;
    await supabaseAdmin
      .from('candidate_onboarding')
      .update({
        [statusField]: 'submitted',
        [feedbackField]: `Auto-flagged: ${reason} (${confidence}% confidence)`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', onboardingId);

    await logActivity(onboardingId, 'flagged', docType, confidence);
  }

  // Update completion percentage
  await updateCompletionPercent(onboardingId);

  return { action, confidence, reason };
}

/**
 * Calculate confidence score based on extracted data quality
 */
function calculateConfidence(docType: string, data: ExtractedData): number {
  // If AI provided confidence, use it
  if (data._confidence) {
    return data._confidence;
  }

  // Calculate based on data completeness and format validation
  let score = 100;
  const penalties: { reason: string; amount: number }[] = [];

  switch (docType) {
    case 'gov_id':
      // Check for required ID numbers
      if (!data.sss && !data.tin && !data.philhealth_no && !data.pagibig_no) {
        penalties.push({ reason: 'No ID numbers extracted', amount: 40 });
      }
      // Validate SSS format (XX-XXXXXXX-X)
      if (data.sss && !/^\d{2}-\d{7}-\d$/.test(data.sss)) {
        penalties.push({ reason: 'SSS format invalid', amount: 15 });
      }
      // Validate TIN format
      if (data.tin && !/^\d{3}-\d{3}-\d{3}(-\d{3})?$/.test(data.tin)) {
        penalties.push({ reason: 'TIN format invalid', amount: 15 });
      }
      break;

    case 'valid_id':
      if (!data.full_name) {
        penalties.push({ reason: 'Name not extracted', amount: 30 });
      }
      if (!data.date_of_birth) {
        penalties.push({ reason: 'DOB not extracted', amount: 20 });
      }
      // Validate date format
      if (data.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(data.date_of_birth)) {
        penalties.push({ reason: 'DOB format invalid', amount: 15 });
      }
      break;

    case 'education':
      if (!data.school_name && !data.education_level) {
        penalties.push({ reason: 'No education info extracted', amount: 30 });
      }
      break;

    case 'medical':
      if (!data.medical_cert_valid) {
        penalties.push({ reason: 'Could not validate medical certificate', amount: 25 });
      }
      if (!data.issue_date) {
        penalties.push({ reason: 'Issue date not found', amount: 15 });
      }
      // Check if medical cert is recent (within 6 months)
      if (data.issue_date) {
        const issueDate = new Date(data.issue_date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (issueDate < sixMonthsAgo) {
          penalties.push({ reason: 'Medical certificate may be expired', amount: 20 });
        }
      }
      break;
  }

  // Apply penalties
  penalties.forEach(p => {
    score -= p.amount;
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * Log activity for the command center feed
 */
async function logActivity(
  onboardingId: string,
  action: string,
  docType: string,
  confidence: number
) {
  try {
    // Get candidate info
    const { data: onboarding } = await supabaseAdmin
      .from('candidate_onboarding')
      .select('first_name, last_name')
      .eq('id', onboardingId)
      .single();

    const candidateName = onboarding 
      ? `${onboarding.first_name} ${onboarding.last_name}`
      : 'Unknown';

    // Insert activity log (create table if needed)
    await supabaseAdmin
      .from('onboarding_activity_log')
      .insert({
        onboarding_id: onboardingId,
        action,
        doc_type: docType,
        confidence,
        candidate_name: candidateName,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    // Log table might not exist yet - that's okay
    console.log('[Activity Log] Could not log activity:', error);
  }
}

/**
 * Update completion percentage after status change
 */
async function updateCompletionPercent(onboardingId: string) {
  const { data } = await supabaseAdmin
    .from('candidate_onboarding')
    .select('personal_info_status, gov_id_status, education_status, medical_status, data_privacy_status, resume_status, signature_status, emergency_contact_status')
    .eq('id', onboardingId)
    .single();

  if (!data) return;

  const statusFields = [
    'personal_info_status', 'gov_id_status', 'education_status', 'medical_status',
    'data_privacy_status', 'resume_status', 'signature_status', 'emergency_contact_status'
  ];

  let completed = 0;
  statusFields.forEach(field => {
    if ((data as any)[field] === 'approved') completed++;
  });

  const percentage = Math.round((completed / statusFields.length) * 100);
  const isComplete = completed === statusFields.length;

  await supabaseAdmin
    .from('candidate_onboarding')
    .update({
      completion_percent: percentage,
      is_complete: isComplete,
    })
    .eq('id', onboardingId);
}
