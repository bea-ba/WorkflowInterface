import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Note: Next.js App Router handles multipart/form-data automatically via request.formData()
// The default body size limits are sufficient for PDF uploads up to 20MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Validate file type - only PDF for now
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${userId}/${timestamp}_${sanitizedFileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL (even though bucket is private, we store the path)
    const {
      data: { publicUrl },
    } = supabase.storage.from('documents').getPublicUrl(storagePath);

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        status: 'processing',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from('documents').remove([storagePath]);
      throw new Error(`Failed to create document record: ${dbError.message}`);
    }

    // Trigger OCR processing asynchronously
    // We don't await this - it will update the document when done
    triggerOCRProcessing(document.id, storagePath);

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}

/**
 * Trigger OCR processing in the background
 * This calls the process-document API route
 */
async function triggerOCRProcessing(documentId: string, storagePath: string) {
  try {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Call the process-document API route
    await fetch(`${appUrl}/api/process-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId,
        storagePath,
      }),
    });
  } catch (error) {
    console.error('Failed to trigger OCR processing:', error);
    // Don't throw - we've already returned success to the user
    // The document status will remain 'processing' and can be retried
  }
}
