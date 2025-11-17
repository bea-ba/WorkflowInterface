'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Upload as UploadIcon,
  File,
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

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, addDocument } = useApp();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Simulate file processing
  const processFile = async (fileId: string) => {
    // Update to uploading
    setUploadFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, status: 'uploading' as const, progress: 0 } : f)
    );

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUploadFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, progress } : f)
      );
    }

    // Update to processing
    setUploadFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, status: 'processing' as const } : f)
    );

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // MOCK: In real app, this would call OCR/AI extraction API
    // For now, just mark as complete
    setUploadFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, status: 'complete' as const, progress: 100 } : f)
    );
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      file,
      status: 'pending',
      progress: 0,
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    // Start processing each file
    newFiles.forEach(f => processFile(f.id));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.heic', '.tiff'],
    },
    maxSize: 20 * 1024 * 1024, // 20MB
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearCompleted = () => {
    setUploadFiles(prev => prev.filter(f => f.status !== 'complete'));
  };

  const completedCount = uploadFiles.filter(f => f.status === 'complete').length;
  const processingCount = uploadFiles.filter(f => ['uploading', 'processing'].includes(f.status)).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload bills, receipts, or invoices to extract and organize your financial data.
          </p>
        </div>

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
              <p className="text-lg font-medium text-primary-600">Drop files here...</p>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-600">
                  Supports PDF, JPG, PNG, HEIC, TIFF (max 20MB per file)
                </p>
              </>
            )}
          </div>

          {/* MOCK Integration Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a mock upload interface. In production, files would be:
              <ul className="mt-2 ml-5 list-disc space-y-1">
                <li>Uploaded to Supabase Storage</li>
                <li>Processed with Google Vision API for OCR</li>
                <li>Analyzed with OpenAI GPT-4 for entity extraction</li>
                <li>Saved to Supabase database with extracted data</li>
              </ul>
            </p>
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
              {uploadFiles.map((uploadFile) => (
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
                            {uploadFile.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
                          </p>
                        </div>
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
