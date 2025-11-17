// Mock data for FinanceFlow MVP prototype
import {
  Document,
  DashboardMetrics,
  SpendingTrendData,
  CategoryBreakdown,
  VendorAnalysis,
  Integration,
  Notification,
  User,
  Organization
} from '@/types';

// Mock User
export const mockUser: User = {
  id: 'user_1',
  email: 'sarah.chen@example.com',
  fullName: 'Sarah Chen',
  role: 'owner',
  organizationId: 'org_1',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  createdAt: new Date('2024-01-15'),
};

// Mock Organization
export const mockOrganization: Organization = {
  id: 'org_1',
  name: 'Digital Marketing Agency',
  subscriptionTier: 'pro',
  createdAt: new Date('2024-01-15'),
};

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: 'doc_1',
    organizationId: 'org_1',
    uploadedBy: 'user_1',
    sourceType: 'gmail',
    sourceReference: 'email_12345',
    vendorName: 'Office Depot',
    vendorNormalized: 'office-depot',
    totalAmount: 234.56,
    currency: 'USD',
    documentDate: new Date('2024-11-15'),
    dueDate: new Date('2024-12-15'),
    category: 'Office Supplies',
    documentType: 'invoice',
    tags: ['office', 'supplies'],
    confidenceScore: 0.94,
    status: 'complete',
    fileUrl: '/mock-files/invoice-1.pdf',
    thumbnailUrl: '/mock-files/invoice-1-thumb.jpg',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15'),
    extractionData: {
      vendor: {
        name: 'Office Depot',
        normalizedId: 'office-depot',
        address: '123 Business St, Austin, TX 78701',
      },
      amounts: {
        subtotal: 215.00,
        tax: 19.56,
        total: 234.56,
        currency: 'USD',
      },
      dates: {
        issued: new Date('2024-11-15'),
        due: new Date('2024-12-15'),
      },
      category: 'Office Supplies',
      documentType: 'invoice',
      lineItems: [
        { description: 'Printer Paper (Case)', quantity: 5, unitPrice: 25.00, total: 125.00 },
        { description: 'Ink Cartridges', quantity: 3, unitPrice: 30.00, total: 90.00 },
      ],
      confidenceScores: {
        overall: 94,
        perField: {
          vendor: 98,
          total: 95,
          date: 92,
          category: 88,
        },
      },
    },
  },
  {
    id: 'doc_2',
    organizationId: 'org_1',
    uploadedBy: 'user_1',
    sourceType: 'drive',
    sourceReference: 'drive_file_456',
    vendorName: 'Comcast Business',
    vendorNormalized: 'comcast-business',
    totalAmount: 189.99,
    currency: 'USD',
    documentDate: new Date('2024-11-01'),
    dueDate: new Date('2024-11-20'),
    category: 'Internet & Phone',
    documentType: 'bill',
    tags: ['utilities', 'monthly'],
    confidenceScore: 0.97,
    status: 'complete',
    fileUrl: '/mock-files/bill-comcast.pdf',
    thumbnailUrl: '/mock-files/bill-comcast-thumb.jpg',
    createdAt: new Date('2024-11-02'),
    updatedAt: new Date('2024-11-02'),
    extractionData: {
      vendor: {
        name: 'Comcast Business',
        normalizedId: 'comcast-business',
      },
      amounts: {
        subtotal: 175.23,
        tax: 14.76,
        total: 189.99,
        currency: 'USD',
      },
      dates: {
        issued: new Date('2024-11-01'),
        due: new Date('2024-11-20'),
        servicePeriod: {
          start: new Date('2024-11-01'),
          end: new Date('2024-11-30'),
        },
      },
      category: 'Internet & Phone',
      documentType: 'bill',
      confidenceScores: {
        overall: 97,
        perField: {
          vendor: 99,
          total: 98,
          date: 96,
          category: 95,
        },
      },
    },
  },
  {
    id: 'doc_3',
    organizationId: 'org_1',
    uploadedBy: 'user_1',
    sourceType: 'upload',
    sourceReference: 'upload_789',
    vendorName: 'Adobe Creative Cloud',
    vendorNormalized: 'adobe-creative-cloud',
    totalAmount: 79.99,
    currency: 'USD',
    documentDate: new Date('2024-11-10'),
    dueDate: new Date('2024-11-10'),
    category: 'Software & SaaS',
    documentType: 'receipt',
    tags: ['software', 'subscription', 'monthly'],
    confidenceScore: 0.99,
    status: 'complete',
    fileUrl: '/mock-files/receipt-adobe.pdf',
    thumbnailUrl: '/mock-files/receipt-adobe-thumb.jpg',
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-10'),
    extractionData: {
      vendor: {
        name: 'Adobe Creative Cloud',
        normalizedId: 'adobe-creative-cloud',
      },
      amounts: {
        subtotal: 79.99,
        tax: 0,
        total: 79.99,
        currency: 'USD',
      },
      dates: {
        issued: new Date('2024-11-10'),
        due: new Date('2024-11-10'),
      },
      category: 'Software & SaaS',
      documentType: 'receipt',
      confidenceScores: {
        overall: 99,
        perField: {
          vendor: 100,
          total: 100,
          date: 98,
          category: 97,
        },
      },
    },
  },
  {
    id: 'doc_4',
    organizationId: 'org_1',
    uploadedBy: 'user_1',
    sourceType: 'gmail',
    sourceReference: 'email_67890',
    vendorName: 'AT&T Electricity',
    vendorNormalized: 'att-electricity',
    totalAmount: 342.18,
    currency: 'USD',
    documentDate: new Date('2024-10-28'),
    dueDate: new Date('2024-11-18'),
    category: 'Utilities',
    documentType: 'bill',
    tags: ['electricity', 'utilities'],
    confidenceScore: 0.76,
    status: 'review',
    fileUrl: '/mock-files/electricity-bill.pdf',
    thumbnailUrl: '/mock-files/electricity-bill-thumb.jpg',
    createdAt: new Date('2024-10-29'),
    updatedAt: new Date('2024-10-29'),
    extractionData: {
      vendor: {
        name: 'AT&T Electricity',
        normalizedId: 'att-electricity',
      },
      amounts: {
        subtotal: 298.42,
        tax: 43.76,
        total: 342.18,
        currency: 'USD',
      },
      dates: {
        issued: new Date('2024-10-28'),
        due: new Date('2024-11-18'),
        servicePeriod: {
          start: new Date('2024-09-28'),
          end: new Date('2024-10-28'),
        },
      },
      category: 'Utilities',
      documentType: 'bill',
      confidenceScores: {
        overall: 76,
        perField: {
          vendor: 82,
          total: 88,
          date: 72,
          category: 65,
        },
      },
    },
  },
  {
    id: 'doc_5',
    organizationId: 'org_1',
    uploadedBy: 'user_1',
    sourceType: 'upload',
    sourceReference: 'upload_111',
    vendorName: 'Amazon Business',
    vendorNormalized: 'amazon-business',
    totalAmount: 567.89,
    currency: 'USD',
    documentDate: new Date('2024-11-05'),
    category: 'Equipment',
    documentType: 'invoice',
    tags: ['equipment', 'hardware'],
    confidenceScore: 0.91,
    status: 'complete',
    fileUrl: '/mock-files/amazon-invoice.pdf',
    thumbnailUrl: '/mock-files/amazon-invoice-thumb.jpg',
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05'),
    extractionData: {
      vendor: {
        name: 'Amazon Business',
        normalizedId: 'amazon-business',
      },
      amounts: {
        subtotal: 523.95,
        tax: 43.94,
        total: 567.89,
        currency: 'USD',
      },
      dates: {
        issued: new Date('2024-11-05'),
      },
      category: 'Equipment',
      documentType: 'invoice',
      lineItems: [
        { description: 'Webcam HD 1080p', quantity: 2, unitPrice: 89.99, total: 179.98 },
        { description: 'USB-C Hub', quantity: 3, unitPrice: 34.99, total: 104.97 },
        { description: 'Wireless Mouse', quantity: 4, unitPrice: 24.99, total: 99.96 },
        { description: 'Keyboard Mechanical', quantity: 1, unitPrice: 139.04, total: 139.04 },
      ],
      confidenceScores: {
        overall: 91,
        perField: {
          vendor: 96,
          total: 93,
          date: 90,
          category: 85,
        },
      },
    },
  },
  {
    id: 'doc_6',
    organizationId: 'org_1',
    uploadedBy: 'user_1',
    sourceType: 'camera',
    sourceReference: 'camera_222',
    vendorName: 'Starbucks',
    vendorNormalized: 'starbucks',
    totalAmount: 24.67,
    currency: 'USD',
    documentDate: new Date('2024-11-12'),
    category: 'Meals & Entertainment',
    documentType: 'receipt',
    tags: ['coffee', 'client-meeting'],
    confidenceScore: 0.88,
    status: 'complete',
    fileUrl: '/mock-files/starbucks-receipt.pdf',
    thumbnailUrl: '/mock-files/starbucks-receipt-thumb.jpg',
    createdAt: new Date('2024-11-12'),
    updatedAt: new Date('2024-11-12'),
    extractionData: {
      vendor: {
        name: 'Starbucks',
        normalizedId: 'starbucks',
      },
      amounts: {
        subtotal: 22.88,
        tax: 1.79,
        total: 24.67,
        currency: 'USD',
      },
      dates: {
        issued: new Date('2024-11-12'),
      },
      category: 'Meals & Entertainment',
      documentType: 'receipt',
      confidenceScores: {
        overall: 88,
        perField: {
          vendor: 95,
          total: 90,
          date: 85,
          category: 82,
        },
      },
    },
  },
];

// Dashboard Metrics
export const mockDashboardMetrics: DashboardMetrics = {
  currentMonthSpending: 14567.32,
  budgetComparison: 15000,
  unpaidBillsCount: 8,
  unpaidBillsTotal: 3245.67,
  upcomingPayments7Days: 2,
  upcomingPayments30Days: 5,
  cashPosition: 45678.90,
};

// Spending Trend Data (12 months)
export const mockSpendingTrend: SpendingTrendData[] = [
  { month: 'Dec 2023', amount: 12340 },
  { month: 'Jan 2024', amount: 13560 },
  { month: 'Feb 2024', amount: 11230 },
  { month: 'Mar 2024', amount: 14890 },
  { month: 'Apr 2024', amount: 13450 },
  { month: 'May 2024', amount: 15670 },
  { month: 'Jun 2024', amount: 14320 },
  { month: 'Jul 2024', amount: 16540 },
  { month: 'Aug 2024', amount: 15230 },
  { month: 'Sep 2024', amount: 14780 },
  { month: 'Oct 2024', amount: 16890 },
  { month: 'Nov 2024', amount: 14567 },
];

// Category Breakdown
export const mockCategoryBreakdown: CategoryBreakdown[] = [
  { category: 'Software & SaaS', amount: 4567.89, percentage: 31.4, color: '#0ea5e9' },
  { category: 'Office Supplies', amount: 2345.67, percentage: 16.1, color: '#8b5cf6' },
  { category: 'Utilities', amount: 1890.45, percentage: 13.0, color: '#f59e0b' },
  { category: 'Internet & Phone', amount: 1567.34, percentage: 10.8, color: '#10b981' },
  { category: 'Equipment', amount: 1234.56, percentage: 8.5, color: '#ef4444' },
  { category: 'Meals & Entertainment', amount: 987.65, percentage: 6.8, color: '#06b6d4' },
  { category: 'Marketing', amount: 876.54, percentage: 6.0, color: '#f43f5e' },
  { category: 'Other', amount: 1097.22, percentage: 7.4, color: '#64748b' },
];

// Vendor Analysis
export const mockVendorAnalysis: VendorAnalysis[] = [
  { vendor: 'Adobe Creative Cloud', amount: 959.88, transactionCount: 12, avgTransaction: 79.99 },
  { vendor: 'Office Depot', amount: 2345.67, transactionCount: 8, avgTransaction: 293.21 },
  { vendor: 'Comcast Business', amount: 2279.88, transactionCount: 12, avgTransaction: 189.99 },
  { vendor: 'Amazon Business', amount: 4567.89, transactionCount: 23, avgTransaction: 198.60 },
  { vendor: 'AT&T Electricity', amount: 3763.98, transactionCount: 11, avgTransaction: 342.18 },
  { vendor: 'Google Workspace', amount: 1439.88, transactionCount: 12, avgTransaction: 119.99 },
  { vendor: 'Zoom', amount: 359.88, transactionCount: 12, avgTransaction: 29.99 },
];

// Integrations
export const mockIntegrations: Integration[] = [
  {
    id: 'int_gmail',
    type: 'gmail',
    connected: true,
    email: 'sarah.chen@example.com',
    lastSync: new Date('2024-11-17T08:30:00'),
    status: 'active',
  },
  {
    id: 'int_drive',
    type: 'drive',
    connected: true,
    email: 'sarah.chen@example.com',
    lastSync: new Date('2024-11-17T08:15:00'),
    status: 'active',
  },
  {
    id: 'int_sheets',
    type: 'sheets',
    connected: false,
    status: 'disconnected',
  },
];

// Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    type: 'payment_due',
    title: 'Payment Due Soon',
    message: 'AT&T Electricity bill of $342.18 is due in 3 days',
    read: false,
    createdAt: new Date('2024-11-17T09:00:00'),
    actionUrl: '/documents/doc_4',
  },
  {
    id: 'notif_2',
    type: 'unusual_spending',
    title: 'Unusual Spending Detected',
    message: 'Your Equipment spending is 45% higher than usual this month',
    read: false,
    createdAt: new Date('2024-11-16T14:30:00'),
    actionUrl: '/analytics',
  },
  {
    id: 'notif_3',
    type: 'duplicate',
    title: 'Possible Duplicate Found',
    message: 'Office Depot invoice may be a duplicate of an existing entry',
    read: true,
    createdAt: new Date('2024-11-15T11:20:00'),
    actionUrl: '/documents/doc_1',
  },
  {
    id: 'notif_4',
    type: 'budget_alert',
    title: 'Budget Threshold Reached',
    message: "You've reached 97% of your monthly budget",
    read: true,
    createdAt: new Date('2024-11-14T16:45:00'),
    actionUrl: '/analytics',
  },
];

// Categories list
export const mockCategories = [
  'Office Supplies',
  'Software & SaaS',
  'Utilities',
  'Internet & Phone',
  'Equipment',
  'Meals & Entertainment',
  'Marketing',
  'Travel',
  'Insurance',
  'Professional Services',
  'Rent',
  'Other',
];
