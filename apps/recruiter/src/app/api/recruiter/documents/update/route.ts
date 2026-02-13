import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * POST /api/recruiter/documents/update
 * Upload updated documents to storage - Admin will verify via AI
 * Allows uploading 1, 2, or 3 documents (not all required)
 */

// Map slot to document type and field
const DOC_MAPPING: Record<number, { type: string; label: string; urlField: string; folder: string }> = {
  1: { type: 'sec', label: 'SEC Certificate', urlField: 'sec_registration_url', folder: 'sec' },
  2: { type: 'bir', label: 'BIR Certificate/Form 2303', urlField: 'dti_certificate_url', folder: 'bir' },
  3: { type: 'business_permit', label: 'Authority To Operate', urlField: 'business_permit_url', folder: 'ato' },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Accept any combination of doc1, doc2, doc3 (at least 1 required)
    const doc1 = formData.get('doc1') as File | null;
    const doc2 = formData.get('doc2') as File | null;
    const doc3 = formData.get('doc3') as File | null;

    const docs: { file: File; slot: number }[] = [];
    if (doc1) docs.push({ file: doc1, slot: 1 });
    if (doc2) docs.push({ file: doc2, slot: 2 });
    if (doc3) docs.push({ file: doc3, slot: 3 });

    if (docs.length === 0) {
      return NextResponse.json({ error: 'Please upload at least 1 document' }, { status: 400 });
    }

    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get recruiter
    const { data: recruiter, error: recruiterError } = await supabaseAdmin
      .from('agency_recruiters')
      .select('id, agency_id, role')
      .eq('user_id', user.id)
      .single();

    if (recruiterError || !recruiter) {
      return NextResponse.json({ error: 'Recruiter profile not found' }, { status: 404 });
    }

    if (!['admin', 'owner'].includes(recruiter.role)) {
      return NextResponse.json({ error: 'Only agency admins can upload documents' }, { status: 403 });
    }

    const agencyId = recruiter.agency_id;
    const bucket = 'agency-documents';

    console.log(`📄 [DOC-UPDATE] Processing ${docs.length} document(s) for agency ${agencyId}`);

    // Get current agency data including existing docs
    const { data: agency } = await supabaseAdmin
      .from('agencies')
      .select('name, sec_registration_url, dti_certificate_url, business_permit_url, document_verification, business_permit_expiry')
      .eq('id', agencyId)
      .single();

    const results: { slot: number; url: string; type: string; label: string; fileName: string }[] = [];
    const updateData: Record<string, unknown> = {
      documents_uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upload each document
    for (const { file, slot } of docs) {
      const mapping = DOC_MAPPING[slot];
      if (!mapping) continue;

      const fileExt = file.name.split('.').pop() || 'pdf';
      const fileName = `${agencyId}/${mapping.folder}/${Date.now()}.${fileExt}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload ${mapping.label}: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      // Set the URL field
      updateData[mapping.urlField] = publicUrl;
      results.push({ 
        slot, 
        url: publicUrl, 
        type: mapping.type, 
        label: mapping.label,
        fileName: file.name 
      });

      console.log(`✅ [DOC-UPDATE] Uploaded ${mapping.label} to ${publicUrl}`);
    }

    // Build document_verification object that preserves existing docs and adds/updates new ones
    const existingVerification = agency?.document_verification as Record<string, unknown> || {};
    const existingDocs = (existingVerification.documents as Array<Record<string, unknown>>) || [];
    
    // Create a map of existing docs by type
    const docsMap = new Map<string, Record<string, unknown>>();
    for (const doc of existingDocs) {
      if (doc.documentType) {
        docsMap.set(String(doc.documentType).toLowerCase(), doc);
      }
    }

    // Add existing docs from URL fields if not in verification yet
    if (agency?.sec_registration_url && !docsMap.has('sec certificate')) {
      docsMap.set('sec certificate', {
        documentType: 'SEC Certificate',
        file_url: agency.sec_registration_url,
        confidence: 'HIGH',
        status: 'verified',
      });
    }
    if (agency?.dti_certificate_url && !docsMap.has('bir certificate')) {
      docsMap.set('bir certificate', {
        documentType: 'BIR Certificate/Form 2303',
        file_url: agency.dti_certificate_url,
        confidence: 'HIGH',
        status: 'verified',
      });
    }
    if (agency?.business_permit_url && !docsMap.has('authority to operate')) {
      docsMap.set('authority to operate', {
        documentType: 'Authority To Operate',
        file_url: agency.business_permit_url,
        confidence: 'HIGH',
        status: 'verified',
        expiryDate: agency.business_permit_expiry,
      });
    }

    // Update/add the newly uploaded docs
    for (const result of results) {
      const docKey = result.label.toLowerCase();
      docsMap.set(docKey, {
        documentType: result.label,
        file_url: result.url,
        originalFileName: result.fileName,
        uploadedAt: new Date().toISOString(),
        confidence: 'PENDING',
        status: 'pending_verification',
      });
    }

    // Build the final documents array
    const finalDocs = Array.from(docsMap.values());

    updateData.document_verification = {
      ...existingVerification,
      documents: finalDocs,
      lastUpdated: new Date().toISOString(),
      overallStatus: 'NEEDS_REVIEW', // Mark for admin review
      pendingDocs: results.map(r => r.label),
    };

    // Update agency
    const { error: updateError } = await supabaseAdmin
      .from('agencies')
      .update(updateData)
      .eq('id', agencyId);

    if (updateError) {
      throw new Error(`Failed to update agency: ${updateError.message}`);
    }

    // Create notification for admin to verify
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: null,
          type: 'documents_updated',
          title: 'Agency Documents Updated',
          message: `${agency?.name || 'An agency'} has uploaded ${results.length} new document(s) for verification.`,
          data: {
            agencyId,
            agencyName: agency?.name,
            documentsUpdated: results.map(r => r.label),
          },
          created_at: new Date().toISOString(),
        });
    } catch (e) {
      console.warn('Failed to create notification:', e);
    }

    console.log(`🎉 [DOC-UPDATE] Successfully uploaded ${results.length} document(s) for agency ${agencyId}`);

    return NextResponse.json({
      success: true,
      message: 'Documents uploaded successfully. Awaiting admin verification.',
      uploaded: results.length,
      results: results.map(r => ({
        slot: r.slot,
        type: r.label,
        status: 'pending_verification',
      })),
    });

  } catch (error) {
    console.error('[DOC-UPDATE] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update documents' },
      { status: 500 }
    );
  }
}
