import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyRecruiterAuth } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyRecruiterAuth(request);
    if (!auth.isValid) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const logo = formData.get('logo') as File | null;
    const companyId = formData.get('companyId') as string;

    if (!logo) {
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    // Upload to Supabase storage
    const fileExt = logo.name.split('.').pop() || 'png';
    const fileName = `${companyId}/logo-${Date.now()}.${fileExt}`;
    const fileBuffer = Buffer.from(await logo.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('company-logos')
      .upload(fileName, fileBuffer, {
        contentType: logo.type,
        upsert: true,
      });

    if (uploadError) {
      // Try creating bucket if it doesn't exist
      if (uploadError.message.includes('Bucket not found')) {
        await supabaseAdmin.storage.createBucket('company-logos', { public: true });
        // Retry upload
        const { data: retryData, error: retryError } = await supabaseAdmin.storage
          .from('company-logos')
          .upload(fileName, fileBuffer, {
            contentType: logo.type,
            upsert: true,
          });
        if (retryError) throw retryError;
      } else {
        throw uploadError;
      }
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('company-logos')
      .getPublicUrl(fileName);

    // Update company with new logo URL
    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({ logo_url: publicUrl })
      .eq('id', companyId);

    if (updateError) {
      console.error('Failed to update company logo:', updateError);
    }

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
