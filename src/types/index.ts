// Core type definitions for FinanceFlow MVP

export type DocumentStatus = 'pending' | 'processing' | 'review' | 'complete' | 'failed';
export type DocumentType = 'invoice' | 'receipt' | 'bill' | 'statement';
export type SourceType = 'gmail' | 'drive' | 'upload' | 'camera';
export type UserRole = 'owner' | 'admin' | 'member';
export type SubscriptionTier = 'free' | 'pro' | 'business';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
}

export interface VendorInfo {
  name: string;
  normalizedId: string;
  address?: string;
  taxId?: string;
}

export interface AmountInfo {
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

export interface DateInfo {
  issued: Date;
  due?: Date;
  servicePeriod?: {
    start: Date;
    end: Date;
  };
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ConfidenceScores {
  overall: number;
  perField: Record<string, number>;
}

export interface ExtractionData {
  vendor: VendorInfo;
  amounts: AmountInfo;
  dates: DateInfo;
  category: string;
  documentType: DocumentType;
  lineItems?: LineItem[];
  confidenceScores: ConfidenceScores;
}

export interface Document {
  id: string;
  organizationId: string;
  uploadedBy: string;
  sourceType: SourceType;
  sourceReference: string;
  vendorName: string;
  vendorNormalized: string;
  totalAmount: number;
  currency: string;
  documentDate: Date;
  dueDate?: Date;
  category: string;
  documentType: DocumentType;
  tags: string[];
  extractionData: ExtractionData;
  confidenceScore: number;
  status: DocumentStatus;
  fileUrl: string;
  thumbnailUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetrics {
  currentMonthSpending: number;
  budgetComparison: number;
  unpaidBillsCount: number;
  unpaidBillsTotal: number;
  upcomingPayments7Days: number;
  upcomingPayments30Days: number;
  cashPosition: number;
}

export interface SpendingTrendData {
  month: string;
  amount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface VendorAnalysis {
  vendor: string;
  amount: number;
  transactionCount: number;
  avgTransaction: number;
}

export interface Integration {
  id: string;
  type: 'gmail' | 'drive' | 'sheets';
  connected: boolean;
  email?: string;
  lastSync?: Date;
  status: 'active' | 'error' | 'disconnected';
}

export interface Notification {
  id: string;
  type: 'payment_due' | 'duplicate' | 'budget_alert' | 'unusual_spending';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  currency: string;
  dateFormat: string;
  defaultView: 'grid' | 'list';
  driveMonitoredFolderId?: string;
  driveMonitoredFolderName?: string;
}

// Google Drive types
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: Date;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime: Date;
}
