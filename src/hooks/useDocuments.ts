import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Document } from '@/types';

export function useDocuments(userId: string | undefined) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If Supabase is not configured, use mock data
    if (!isSupabaseConfigured() || !userId) {
      setLoading(false);
      return;
    }

    fetchDocuments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time update:', payload);

          if (payload.eventType === 'INSERT') {
            setDocuments((prev) => [transformDocument(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === payload.new.id
                  ? transformDocument(payload.new)
                  : doc
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDocuments((prev) =>
              prev.filter((doc) => doc.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  async function fetchDocuments() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        setDocuments(data.map(transformDocument));
      }
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
  };
}

/**
 * Transform database document to match our Document type
 */
function transformDocument(dbDoc: any): Document {
  return {
    id: dbDoc.id,
    organizationId: dbDoc.user_id, // Using user_id as org for now
    uploadedBy: dbDoc.user_id,
    sourceType: 'upload',
    sourceReference: dbDoc.id,
    vendorName: dbDoc.vendor_name || 'Unknown Vendor',
    vendorNormalized: (dbDoc.vendor_name || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-'),
    totalAmount: parseFloat(dbDoc.total_amount) || 0,
    currency: dbDoc.currency || 'USD',
    documentDate: dbDoc.document_date
      ? new Date(dbDoc.document_date)
      : new Date(),
    dueDate: dbDoc.due_date ? new Date(dbDoc.due_date) : undefined,
    category: dbDoc.category || 'Utilities',
    documentType: 'bill',
    tags: [],
    extractionData: dbDoc.extraction_data || {
      vendor: {
        name: dbDoc.vendor_name || 'Unknown',
        normalizedId: 'unknown',
      },
      amounts: {
        subtotal: 0,
        tax: 0,
        total: parseFloat(dbDoc.total_amount) || 0,
        currency: dbDoc.currency || 'USD',
      },
      dates: {
        issued: dbDoc.document_date
          ? new Date(dbDoc.document_date)
          : new Date(),
      },
      category: dbDoc.category || 'Utilities',
      documentType: 'bill',
      confidenceScores: {
        overall: (dbDoc.confidence_score || 0) * 100,
        perField: {},
      },
    },
    confidenceScore: dbDoc.confidence_score || 0,
    status: dbDoc.status || 'pending',
    fileUrl: dbDoc.file_url || '',
    thumbnailUrl: dbDoc.file_url || '', // Using same URL for now
    createdAt: new Date(dbDoc.created_at),
    updatedAt: new Date(dbDoc.updated_at),
  };
}
