import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3003';

/**
 * POST /api/candidate/onboarding/documents/upload
 * Upload a document for staff onboarding
 * Stores file in Supabase Storage, then calls admin API for processing
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidateId = session.user.id;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const onboardingId = formData.get('onboardingId') as string;
    const hintDocumentType = formData.get('documentType') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!onboardingId) {
      return NextResponse.json({ error: 'Onboarding ID required' }, { status: 400 });
    }

    // Verify onboarding belongs to this candidate
    const { data: onboarding, error: onboardingError } = await supabaseAdmin
      .from('staff_onboarding')
      .select('id, status')
      .eq('id', onboardingId)
      .eq('candidate_id', candidateId)
      .single();

    if (onboardingError || !onboarding) {
      return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 });
    }

    if (onboarding.status === 'completed') {
      return NextResponse.json({ error: 'Onboarding already completed' }, { status: 400 });
    }

    // Convert file to buffer and base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Upload to Supabase Storage
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${candidateId}/201/${timestamp}-${safeName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('staff-onboarding')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      // Try creating bucket if it doesn't exist
      if (uploadError.message?.includes('not found')) {
        await supabaseAdmin.storage.createBucket('staff-onboarding', { 
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        // Retry upload
        const { error: retryError } = await supabaseAdmin.storage
          .from('staff-onboarding')
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: true,
          });
        
        if (retryError) {
          console.error('Upload retry failed:', retryError);
          throw new Error('Failed to upload file');
        }
      } else {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload file');
      }
    }

    // Get file URL
    const { data: urlData } = supabaseAdmin.storage
      .from('staff-onboarding')
      .getPublicUrl(storagePath);

    // For private buckets, create signed URL instead
    const { data: signedUrlData } = await supabaseAdmin.storage
      .from('staff-onboarding')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

    const fileUrl = signedUrlData?.signedUrl || urlData?.publicUrl;

    // Call admin API to process with AI
    console.log(`[Doc Upload] Calling admin processor for ${file.name}`);
    
    const adminResponse = await fetch(`${ADMIN_API_URL}/api/onboarding/process-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        onboardingId,
        candidateId,
        hintDocumentType,
      }),
    });

    if (!adminResponse.ok) {
      const error = await adminResponse.json().catch(() => ({}));
      console.error('Admin processing failed:', error);
      
      // Still save the document even if AI processing fails
      const { data: doc } = await supabaseAdmin
        .from('staff_onboarding_documents')
        .insert({
          onboarding_id: onboardingId,
          candidate_id: candidateId,
          document_type: hintDocumentType || 'unknown',
          file_name: file.name,
          file_url: fileUrl,
          file_size: file.size,
          mime_type: file.type,
          status: 'needs_review',
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        document: {
          id: doc?.id,
          file_name: file.name,
          status: 'needs_review',
          message: 'Document uploaded but needs manual review',
        },
      });
    }

    const result = await adminResponse.json();
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[Doc Upload] Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload document' 
    }, { status: 500 });
  }
}

/**
 * GET /api/candidate/onboarding/documents/upload
 * Get uploaded documents for current onboarding
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidateId = session.user.id;
    const { searchParams } = new URL(request.url);
    const onboardingId = searchParams.get('onboardingId');

    if (!onboardingId) {
      return NextResponse.json({ error: 'Onboarding ID required' }, { status: 400 });
    }

    // Get onboarding with documents
    const { data: onboarding, error: onboardingError } = await supabaseAdmin
      .from('staff_onboarding')
      .select(`
        *,
        documents:staff_onboarding_documents(*)
      `)
      .eq('id', onboardingId)
      .eq('candidate_id', candidateId)
      .single();

    if (onboardingError || !onboarding) {
      return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 });
    }

    return NextResponse.json({
      onboarding: {
        id: onboarding.id,
        status: onboarding.status,
        total_points: onboarding.total_points,
        identity_points: onboarding.identity_points,
        tax_points: onboarding.tax_points,
        sss_points: onboarding.sss_points,
        philhealth_points: onboarding.philhealth_points,
        pagibig_points: onboarding.pagibig_points,
        photo_points: onboarding.photo_points,
        is_complete: onboarding.total_points >= 155,
      },
      documents: onboarding.documents || [],
    });

  } catch (error: any) {
    console.error('[Doc Get] Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to get documents' 
    }, { status: 500 });
  }
}
