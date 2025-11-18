'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Upload as UploadIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import { formatFileSize, cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  documentId?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useApp();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Real file upload and processing
  const processFile = async (fileId: string, file: File) => {
    if (!user?.id) {
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, status: 'error', error: 'User not authenticated' } : f
        )
      );
      return;
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                status: 'error',
                error: 'Supabase not configured. Please set up environment variables.',
              }
            : f
        )
      );
      return;
    }

    try {
      // Update to uploading
      setUploadFiles(prev =>
        prev.map(f => (f.id === fileId ? { ...f, status: 'uploading', progress: 20 } : f))
      );

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Update to processing
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                status: 'processing',
                progress: 50,
                documentId: data.document.id,
              }
            : f
        )
      );

      // Poll for completion (Supabase real-time will update the document)
      await pollForCompletion(fileId, data.document.id);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                status: 'error',
                error: error.message || 'Upload failed',
              }
            : f
        )
      );
    }
  };

  // Poll for document processing completion
  const pollForCompletion = async (fileId: string, documentId: string) => {
    const maxAttempts = 60; // 60 seconds max
    let attempts = 0;
    let intervalId: NodeJS.Timeout | null = null;

    const checkStatus = async () => {
      attempts++;

      try {
        const { data: document, error } = await supabase
          .from('documents')
          .select('status')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        if (document?.status === 'complete' || document?.status === 'review') {
          // Success!
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === fileId ? { ...f, status: 'complete', progress: 100 } : f
            )
          );
          if (intervalId) clearInterval(intervalId);
          return true;
        } else if (document?.status === 'failed') {
          // Failed
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'error', error: 'Processing failed' }
                : f
            )
          );
          if (intervalId) clearInterval(intervalId);
          return true;
        } else if (attempts >= maxAttempts) {
          // Timeout
          setUploadFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? {
                    ...f,
                    status: 'error',
                    error: 'Processing timeout. Check document status later.',
                  }
                : f
            )
          );
          if (intervalId) clearInterval(intervalId);
          return true;
        }

        // Still processing, check again
        return false;
      } catch (error) {
        console.error('Polling error:', error);
        if (intervalId) clearInterval(intervalId);
        return false;
      }
    };

    // Poll every second
    intervalId = setInterval(async () => {
      await checkStatus();
    }, 1000);

    // Return cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // For MVP, only handle one file at a time
      const file = acceptedFiles[0];
      if (!file) return;

      const fileId = `file_${Date.now()}_${Math.random()}`;

      const newFile: UploadFile = {
        id: fileId,
        file,
        status: 'pending',
        progress: 0,
      };

      setUploadFiles(prev => [...prev, newFile]);

      // Start processing
      processFile(fileId, file);
    },
    [user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 1, // Single file for MVP
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'complete'));
  };

  const completedCount = uploadFiles.filter(f => f.status === 'complete').length;
  const processingCount = uploadFiles.filter(f =>
    ['uploading', 'processing'].includes(f.status)
  ).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload an electricity bill PDF to extract and organize your financial data.
          </p>
        </div>

        {/* Configuration Warning */}
        {!isSupabaseConfigured() && (
          <div className="mb-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-warning-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-warning-800">
                  Supabase Not Configured
                </h3>
                <p className="mt-1 text-sm text-warning-700">
                  Please set up your environment variables (.env.local) with Supabase and OpenAI
                  credentials to enable real file uploads. See the README.md for instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {uploadFiles.length > 0 && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{uploadFiles.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-primary-600">{processingCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-success-600">{completedCount}</p>
            </div>
          </div>
        )}

        {/* Dropzone */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            )}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary-600">Drop PDF here...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop PDF here or click to browse
                </p>
                <p className="text-sm text-gray-600">
                  Supports PDF files only (max 20MB)
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Currently: Single electricity bill PDF
                </p>
              </>
            )}
          </div>
        </div>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload Queue ({uploadFiles.length})
              </h2>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Clear completed
                </button>
              )}
            </div>
            <ul className="divide-y divide-gray-200">
              {uploadFiles.map(uploadFile => (
                <li key={uploadFile.id} className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {uploadFile.file.type.startsWith('image/') ? (
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                      ) : (
                        <FileText className="h-10 w-10 text-gray-400" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadFile.file.size)}
                      </p>

                      {/* Progress Bar */}
                      {['uploading', 'processing'].includes(uploadFile.status) && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-600">
                            {uploadFile.status === 'uploading'
                              ? 'Uploading...'
                              : 'Processing with AI...'}
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <p className="mt-1 text-xs text-danger-600">{uploadFile.error}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      {uploadFile.status === 'pending' && (
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                      )}
                      {['uploading', 'processing'].includes(uploadFile.status) && (
                        <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                      )}
                      {uploadFile.status === 'complete' && (
                        <CheckCircle className="h-5 w-5 text-success-600" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-danger-600" />
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
