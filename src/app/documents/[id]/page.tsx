'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  FileText,
  Calendar,
  DollarSign,
  Tag,
  Building,
  CreditCard,
  Sheet,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import { formatCurrency, formatDate, cn, getStatusColor, getConfidenceBadgeColor } from '@/lib/utils';
import { mockCategories } from '@/data/mockData';
import { writeDocumentToSheet } from '@/services/integrations/sheetWriter';

export default function DocumentViewPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, documents, updateDocument, deleteDocument, preferences, integrations } = useApp();

  const [zoom, setZoom] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [exportingToSheets, setExportingToSheets] = useState(false);

  const documentId = params.id as string;
  const document = documents.find(d => d.id === documentId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
    if (document && !editedData) {
      setEditedData({
        vendorName: document.vendorName,
        totalAmount: document.totalAmount,
        documentDate: document.documentDate,
        dueDate: document.dueDate,
        category: document.category,
      });
    }
  }, [isAuthenticated, router, document, editedData]);

  if (!isAuthenticated || !document) {
    return null;
  }

  const handleSave = () => {
    updateDocument(documentId, {
      ...editedData,
      status: 'complete' as const,
    });
    setIsEditing(false);
  };

  const handleApprove = () => {
    updateDocument(documentId, { status: 'complete' });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument(documentId);
      router.push('/documents');
    }
  };

  const handleExportToSheets = async () => {
    if (!preferences.googleSheetsId || !user?.id) {
      alert('Please configure Google Sheets integration in Settings first.');
      return;
    }

    setExportingToSheets(true);
    try {
      await writeDocumentToSheet(preferences.googleSheetsId, document, user.id);
      alert('Document exported to Google Sheets successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export document. Please try again.');
    } finally {
      setExportingToSheets(false);
    }
  };

  const confidenceScore = document.confidenceScore * 100;
  const sheetsConnected = integrations.find(i => i.type === 'sheets')?.connected;
  const canExportToSheets = sheetsConnected && preferences.googleSheetsId;

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/documents"
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Documents
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{document.vendorName}</h1>
              <p className="mt-2 text-sm text-gray-600">
                {document.documentType} • {formatDate(document.createdAt, 'long')}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              {canExportToSheets && (
                <button
                  onClick={handleExportToSheets}
                  disabled={exportingToSheets}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportingToSheets ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sheet className="h-4 w-4 mr-2" />
                  )}
                  Export to Sheets
                </button>
              )}
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-danger-700 bg-white hover:bg-danger-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Review Alert */}
        {document.status === 'review' && !isEditing && (
          <div className="mb-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-warning-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-warning-800">
                  This document needs your review
                </h3>
                <p className="mt-1 text-sm text-warning-700">
                  The extraction confidence score is {confidenceScore.toFixed(0)}%. Please verify the extracted data below.
                </p>
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-warning-700 bg-warning-100 hover:bg-warning-200"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit & Approve
                  </button>
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-success-700 bg-success-100 hover:bg-success-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve as-is
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Preview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Document Preview</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex items-center justify-center min-h-[600px]">
              {/* MOCK: In real app, this would show actual document */}
              <div className="text-center">
                <FileText className="mx-auto h-32 w-32 text-gray-300 mb-4" />
                <p className="text-gray-500">Document preview placeholder</p>
                <p className="text-xs text-gray-400 mt-2">
                  In production, this would display the actual PDF/image
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Data */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Extracted Data</h2>
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getConfidenceBadgeColor(confidenceScore)
                )}
              >
                {confidenceScore.toFixed(0)}% confidence
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Vendor Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Vendor Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Vendor Name
                      {document.extractionData.confidenceScores.perField.vendor && (
                        <span className={cn(
                          'ml-2',
                          getConfidenceBadgeColor(document.extractionData.confidenceScores.perField.vendor).split(' ')[0]
                        )}>
                          ({document.extractionData.confidenceScores.perField.vendor}%)
                        </span>
                      )}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.vendorName}
                        onChange={(e) => setEditedData({ ...editedData, vendorName: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{document.vendorName}</p>
                    )}
                  </div>

                  {document.extractionData.vendor.address && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                      <p className="text-sm text-gray-900">{document.extractionData.vendor.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financial Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Total Amount
                      {document.extractionData.confidenceScores.perField.total && (
                        <span className={cn(
                          'ml-2',
                          getConfidenceBadgeColor(document.extractionData.confidenceScores.perField.total).split(' ')[0]
                        )}>
                          ({document.extractionData.confidenceScores.perField.total}%)
                        </span>
                      )}
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedData.totalAmount}
                        onChange={(e) => setEditedData({ ...editedData, totalAmount: parseFloat(e.target.value) })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(document.totalAmount)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Subtotal</label>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(document.extractionData.amounts.subtotal)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tax</label>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(document.extractionData.amounts.tax)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Dates
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Document Date
                      {document.extractionData.confidenceScores.perField.date && (
                        <span className={cn(
                          'ml-2',
                          getConfidenceBadgeColor(document.extractionData.confidenceScores.perField.date).split(' ')[0]
                        )}>
                          ({document.extractionData.confidenceScores.perField.date}%)
                        </span>
                      )}
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedData.documentDate ? new Date(editedData.documentDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedData({ ...editedData, documentDate: new Date(e.target.value) })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formatDate(document.documentDate)}</p>
                    )}
                  </div>

                  {document.dueDate && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedData.dueDate ? new Date(editedData.dueDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditedData({ ...editedData, dueDate: new Date(e.target.value) })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{formatDate(document.dueDate)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Classification
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Category
                      {document.extractionData.confidenceScores.perField.category && (
                        <span className={cn(
                          'ml-2',
                          getConfidenceBadgeColor(document.extractionData.confidenceScores.perField.category).split(' ')[0]
                        )}>
                          ({document.extractionData.confidenceScores.perField.category}%)
                        </span>
                      )}
                    </label>
                    {isEditing ? (
                      <select
                        value={editedData.category}
                        onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        {mockCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-900">{document.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Document Type</label>
                    <p className="text-sm text-gray-900 capitalize">{document.documentType}</p>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              {document.extractionData.lineItems && document.extractionData.lineItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Line Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {document.extractionData.lineItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 text-gray-900">{item.description}</td>
                            <td className="px-3 py-2 text-right text-gray-900">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save & Approve
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
