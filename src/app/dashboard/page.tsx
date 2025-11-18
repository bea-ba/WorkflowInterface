'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertCircle,
  Calendar,
  ArrowRight,
  RefreshCw,
  Mail,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import SpendingTrendChart from '@/components/charts/SpendingTrendChart';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart';
import {
  mockDashboardMetrics,
  mockSpendingTrend,
  mockCategoryBreakdown,
  mockDocuments,
} from '@/data/mockData';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { getStoredTokens } from '@/services/integrations/googleOAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, documents, integrations, syncGmailBills } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const metrics = mockDashboardMetrics;
  const budgetPercentage = (metrics.currentMonthSpending / metrics.budgetComparison) * 100;
  const isOverBudget = budgetPercentage > 100;

  // Get recent documents (last 5)
  const recentDocuments = mockDocuments.slice(0, 5);

  // Documents needing review
  const reviewDocuments = documents.filter(d => d.status === 'review');

  // Check if Gmail is connected
  const gmailIntegration = integrations.find(i => i.type === 'gmail');
  const isGmailConnected = gmailIntegration?.connected && getStoredTokens() !== null;

  const handleGmailSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const result = await syncGmailBills(3); // Search last 3 months

      if (result.success) {
        setSyncMessage({
          type: 'success',
          text: `Found ${result.count} bill${result.count !== 1 ? 's' : ''} from Gmail`
        });
      } else {
        setSyncMessage({
          type: 'error',
          text: result.error || 'Failed to sync Gmail'
        });
      }
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: 'An error occurred while syncing'
      });
    } finally {
      setIsSyncing(false);
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Welcome back! Here's an overview of your financial documents.
            </p>
          </div>

          {/* Gmail Sync Button */}
          {isGmailConnected && (
            <button
              onClick={handleGmailSync}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Sync Gmail
                </>
              )}
            </button>
          )}
        </div>

        {/* Sync Status Message */}
        {syncMessage && (
          <div className={cn(
            "mb-6 p-4 rounded-lg border flex items-center",
            syncMessage.type === 'success'
              ? "bg-success-50 border-success-200"
              : "bg-danger-50 border-danger-200"
          )}>
            {syncMessage.type === 'success' ? (
              <Check className="h-5 w-5 text-success-600 mr-2" />
            ) : (
              <X className="h-5 w-5 text-danger-600 mr-2" />
            )}
            <p className={cn(
              "text-sm",
              syncMessage.type === 'success' ? "text-success-800" : "text-danger-800"
            )}>
              {syncMessage.text}
            </p>
            <button
              onClick={() => setSyncMessage(null)}
              className={cn(
                "ml-auto",
                syncMessage.type === 'success' ? "text-success-600" : "text-danger-600"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Review Alert */}
        {reviewDocuments.length > 0 && (
          <div className="mb-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-warning-600 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-warning-800">
                  {reviewDocuments.length} document{reviewDocuments.length > 1 ? 's' : ''} need{reviewDocuments.length === 1 ? 's' : ''} your review
                </h3>
                <p className="mt-1 text-sm text-warning-700">
                  Some extractions have low confidence scores and require manual verification.
                </p>
                <Link
                  href="/documents?filter=review"
                  className="mt-2 inline-flex items-center text-sm font-medium text-warning-800 hover:text-warning-900"
                >
                  Review now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Month Spending */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(metrics.currentMonthSpending)}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                {isOverBudget ? (
                  <TrendingUp className="h-4 w-4 text-danger-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-success-600 mr-1" />
                )}
                <span className={isOverBudget ? 'text-danger-600' : 'text-success-600'}>
                  {budgetPercentage.toFixed(1)}%
                </span>
                <span className="text-gray-600 ml-1">of {formatCurrency(metrics.budgetComparison)} budget</span>
              </div>
            </div>
          </div>

          {/* Unpaid Bills */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid Bills</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.unpaidBillsCount}
                </p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <FileText className="h-6 w-6 text-warning-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Total: {formatCurrency(metrics.unpaidBillsTotal)}
              </p>
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due in 7 Days</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.upcomingPayments7Days}
                </p>
              </div>
              <div className="p-3 bg-danger-100 rounded-full">
                <Calendar className="h-6 w-6 text-danger-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                30 days: {metrics.upcomingPayments30Days} payments
              </p>
            </div>
          </div>

          {/* Cash Position */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash Position</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(metrics.cashPosition)}
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-success-600">
                Healthy position
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Spending Trend (12 Months)
            </h2>
            <div className="h-80">
              <SpendingTrendChart data={mockSpendingTrend} />
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Category Breakdown
            </h2>
            <div className="h-80">
              <CategoryBreakdownChart data={mockCategoryBreakdown} />
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
            <Link
              href="/documents"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(doc.documentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.vendorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doc.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(doc.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                          doc.status === 'complete' && 'bg-success-50 text-success-700 border-success-200',
                          doc.status === 'review' && 'bg-warning-50 text-warning-700 border-warning-200',
                          doc.status === 'processing' && 'bg-primary-50 text-primary-700 border-primary-200'
                        )}
                      >
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
