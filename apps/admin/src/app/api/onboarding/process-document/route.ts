import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { 
  processDocument, 
  crossValidateDocuments,
  canAutoVerify 
} from '@/lib/onboarding/document-processor';
import { DOCUMENT_TYPES, MINIMUM_POINTS } from '@/lib/onboarding/document-types';

/**
 * POST /api/onboarding/process-document
 * Process an uploaded document with AI classification and extraction
 * Called from candidate app after file upload
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      imageBase64,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      onboardingId,
      candidateId,
      hintDocumentType, // Optional: if candidate selected a type
    } = body;

    if (!imageBase64 || !onboardingId || !candidateId) {
      return NextResponse.json({ 
        error: 'Missing required fields: imageBase64, onboardingId, candidateId' 
      }, { status: 400 });
    }

    console.log(`[Doc Process] Processing document for onboarding ${onboardingId}`);

    // Process document with AI
    const { classification, extraction, points } = await processDocument(imageBase64, hintDocumentType);

    console.log(`[Doc Process] Classified as: ${classification.document_type} (${classification.confidence})`);

    // Check if we can auto-verify
    const autoVerifyCheck = canAutoVerify(extraction, classification);
    
    // Determine status
    let status = 'pending';
    if (autoVerifyCheck.canAutoVerify && classification.confidence >= 0.95) {
      status = 'verified';
    } else if (classification.confidence < 0.7 || !extraction.success) {
      status = 'needs_review';
    }

    // Save document to database
    const { data: doc, error: docError } = await supabaseAdmin
      .from('staff_onboarding_documents')
      .insert({
        onboarding_id: onboardingId,
        candidate_id: candidateId,
        document_type: classification.document_type,
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize,
        mime_type: mimeType,
        ai_detected_type: classification.document_type,
        ai_confidence: classification.confidence,
        extracted_data: extraction.extracted_data,
        extraction_confidence: extraction.confidence_scores,
        points_awarded: status === 'verified' ? points : 0,
        status,
        auto_verified: status === 'verified',
        auto_verify_reason: status === 'verified' ? autoVerifyCheck.reason : null,
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (docError) {
      console.error('Failed to save document:', docError);
      throw new Error('Failed to save document');
    }

    // Update onboarding points if verified
    if (status === 'verified') {
      await updateOnboardingPoints(onboardingId);
    }

    // Get current onboarding status
    const { data: onboarding } = await supabaseAdmin
      .from('staff_onboarding')
      .select('total_points, status')
      .eq('id', onboardingId)
      .single();

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        document_type: classification.document_type,
        document_name: DOCUMENT_TYPES[classification.document_type]?.name || 'Unknown',
        classification_confidence: classification.confidence,
        extracted_data: extraction.extracted_data,
        points_awarded: status === 'verified' ? points : 0,
        possible_points: points,
        status,
        auto_verified: status === 'verified',
      },
      onboarding: {
        total_points: onboarding?.total_points || 0,
        minimum_required: MINIMUM_POINTS,
        is_complete: (onboarding?.total_points || 0) >= MINIMUM_POINTS,
      },
      message: status === 'verified' 
        ? `✅ ${DOCUMENT_TYPES[classification.document_type]?.name} verified! +${points} points`
        : status === 'needs_review'
        ? '⏳ Document submitted for review'
        : '📄 Document uploaded successfully',
    });

  } catch (error: any) {
    console.error('[Doc Process] Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process document' 
    }, { status: 500 });
  }
}

/**
 * Recalculate and update onboarding points
 */
async function updateOnboardingPoints(onboardingId: string) {
  // Get all verified documents
  const { data: docs } = await supabaseAdmin
    .from('staff_onboarding_documents')
    .select('document_type, points_awarded')
    .eq('onboarding_id', onboardingId)
    .eq('status', 'verified');

  if (!docs) return;

  // Calculate points by category
  const pointsByCategory = {
    identity: 0,
    tax: 0,
    sss: 0,
    philhealth: 0,
    pagibig: 0,
    photos: 0,
  };

  let totalPoints = 0;

  for (const doc of docs) {
    const docConfig = DOCUMENT_TYPES[doc.document_type];
    if (docConfig) {
      const category = docConfig.category as keyof typeof pointsByCategory;
      if (category in pointsByCategory) {
        pointsByCategory[category] += doc.points_awarded;
      }
      totalPoints += doc.points_awarded;
    }
  }

  // Update onboarding record
  const isComplete = totalPoints >= MINIMUM_POINTS;
  
  await supabaseAdmin
    .from('staff_onboarding')
    .update({
      total_points: totalPoints,
      identity_points: pointsByCategory.identity,
      tax_points: pointsByCategory.tax,
      sss_points: pointsByCategory.sss,
      philhealth_points: pointsByCategory.philhealth,
      pagibig_points: pointsByCategory.pagibig,
      photo_points: pointsByCategory.photos,
      status: isComplete ? 'completed' : 'in_progress',
      completed_at: isComplete ? new Date().toISOString() : null,
    })
    .eq('id', onboardingId);
}

/**
 * GET /api/onboarding/process-document
 * Get document types and their requirements
 */
export async function GET() {
  const categories = ['identity', 'tax', 'sss', 'philhealth', 'pagibig', 'personal', 'employment', 'medical', 'photos'];
  
  const docTypesByCategory = categories.map(category => ({
    category,
    documents: Object.values(DOCUMENT_TYPES)
      .filter(d => d.category === category)
      .map(d => ({
        id: d.id,
        name: d.name,
        points: d.points,
        isPrimary: d.isPrimary,
      })),
  }));

  return NextResponse.json({
    documentTypes: docTypesByCategory,
    minimumPoints: MINIMUM_POINTS,
    requirements: {
      identity: 50,
      tax: 25,
      sss: 25,
      philhealth: 25,
      pagibig: 25,
      photos: 5,
    },
  });
}
