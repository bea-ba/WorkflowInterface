import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { processElectricityBill } from '@/lib/services/ocrService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { documentId, storagePath } = await request.json();

    if (!documentId || !storagePath) {
      return NextResponse.json(
        { error: 'Document ID and storage path required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(storagePath);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Process with OCR & AI
    const extractedData = await processElectricityBill(buffer);

    // Determine status based on confidence score
    const overallConfidence = extractedData.confidenceScores.overall;
    const status = overallConfidence >= 70 ? 'complete' : 'review';

    // Update document in database with extracted data
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        vendor_name: extractedData.vendor.name,
        total_amount: extractedData.amounts.total,
        currency: extractedData.amounts.currency,
        document_date: extractedData.dates.issued,
        due_date: extractedData.dates.due,
        category: extractedData.category,
        extraction_data: extractedData,
        confidence_score: overallConfidence / 100, // Store as decimal (0-1)
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update document: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      status,
      extractedData,
    });
  } catch (error: any) {
    console.error('Processing error:', error);

    // Update document status to failed if we have the documentId
    try {
      const body = await request.json();
      if (body.documentId) {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('documents')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.documentId);
      }
    } catch (updateError) {
      console.error('Failed to update document status:', updateError);
    }

    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
