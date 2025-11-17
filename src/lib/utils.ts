// Utility functions for FinanceFlow MVP

import { type ClassValue, clsx } from 'clsx';

/**
 * Merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  if (format === 'relative') {
    return getRelativeTime(date);
  }

  if (format === 'long') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Get relative time (e.g., "2 days ago", "in 3 days")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays === -1) return 'Yesterday';
  if (diffInDays > 1) return `In ${diffInDays} days`;
  if (diffInDays < -1) return `${Math.abs(diffInDays)} days ago`;

  return formatDate(date, 'short');
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    complete: 'bg-success-50 text-success-700 border-success-200',
    pending: 'bg-warning-50 text-warning-700 border-warning-200',
    processing: 'bg-primary-50 text-primary-700 border-primary-200',
    review: 'bg-warning-50 text-warning-700 border-warning-200',
    failed: 'bg-danger-50 text-danger-700 border-danger-200',
    active: 'bg-success-50 text-success-700 border-success-200',
    error: 'bg-danger-50 text-danger-700 border-danger-200',
    disconnected: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
}

/**
 * Get confidence score color
 */
export function getConfidenceColor(score: number): string {
  if (score >= 90) return 'text-success-600';
  if (score >= 70) return 'text-warning-600';
  return 'text-danger-600';
}

/**
 * Get confidence badge color
 */
export function getConfidenceBadgeColor(score: number): string {
  if (score >= 90) return 'bg-success-50 text-success-700 border-success-200';
  if (score >= 70) return 'bg-warning-50 text-warning-700 border-warning-200';
  return 'bg-danger-50 text-danger-700 border-danger-200';
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get document type icon color
 */
export function getDocumentTypeColor(type: string): string {
  const colors: Record<string, string> = {
    invoice: 'text-primary-600',
    receipt: 'text-success-600',
    bill: 'text-warning-600',
    statement: 'text-purple-600',
  };

  return colors[type] || 'text-gray-600';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
