'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import MainLayout from '@/components/layout/MainLayout';
import SpendingTrendChart from '@/components/charts/SpendingTrendChart';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart';
import {
  mockSpendingTrend,
  mockCategoryBreakdown,
  mockVendorAnalysis,
} from '@/data/mockData';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useApp();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // Calculate summary stats
  const totalSpending = mockSpendingTrend.reduce((sum, item) => sum + item.amount, 0);
  const avgMonthlySpending = totalSpending / mockSpendingTrend.length;
  const currentMonth = mockSpendingTrend[mockSpendingTrend.length - 1];
  const previousMonth = mockSpendingTrend[mockSpendingTrend.length - 2];
  const monthOverMonthChange = ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100;

  // Top categories
  const topCategories = [...mockCategoryBreakdown]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Top vendors
  const topVendors = [...mockVendorAnalysis]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gain insights into your spending patterns and financial trends.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total (12 months)</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalSpending)}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Monthly</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(avgMonthlySpending)}
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <Calendar className="h-6 w-6 text-success-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Month over Month</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {monthOverMonthChange > 0 ? '+' : ''}{monthOverMonthChange.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${monthOverMonthChange > 0 ? 'bg-danger-100' : 'bg-success-100'}`}>
                <TrendingUp className={`h-6 w-6 ${monthOverMonthChange > 0 ? 'text-danger-600' : 'text-success-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Spending Trend
              </h2>
            </div>
            <div className="h-80">
              <SpendingTrendChart data={mockSpendingTrend} />
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <PieChartIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Category Distribution
              </h2>
            </div>
            <div className="h-80">
              <CategoryBreakdownChart data={mockCategoryBreakdown} />
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topCategories.map((category, idx) => (
                  <div key={category.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {idx + 1}. {category.category}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Vendors */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top Vendors</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topVendors.map((vendor, idx) => (
                    <tr key={vendor.vendor} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vendor.vendor}</div>
                        <div className="text-xs text-gray-500">
                          Avg: {formatCurrency(vendor.avgTransaction)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {vendor.transactionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(vendor.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h2>
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Spending Pattern Detected</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Your Software & SaaS spending has increased by 24% over the last 3 months. Consider reviewing subscriptions for potential savings.
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-900">Cost Optimization Opportunity</h3>
                <p className="mt-1 text-sm text-green-700">
                  You&apos;re spending $2,280/year with Office Depot. Switching to Amazon Business could save approximately $340/year based on similar items.
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-900">Seasonal Trend Identified</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Your utility costs are 18% higher in summer months. Consider energy-saving measures to reduce costs.
                </p>
              </div>
            </div>
          </div>

          {/* MOCK Note */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> In production, these insights would be generated by AI analyzing your actual spending patterns, detecting anomalies, and providing actionable recommendations.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
