/**
 * Google Sheets Structure Definitions
 * Defines column structure and data mapping for each document category
 */

import { Document } from '@/types';

export interface SheetColumn {
  header: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date';
}

export interface SheetStructure {
  tabName: string;
  columns: SheetColumn[];
  rowMapper: (doc: Document) => any[];
}

/**
 * Common columns used across all sheets
 */
const commonColumns: SheetColumn[] = [
  { header: 'Date', width: 100, format: 'date' },
  { header: 'Vendor', width: 150 },
  { header: 'Amount', width: 100, format: 'currency' },
  { header: 'Status', width: 100 },
  { header: 'Document ID', width: 180 },
];

/**
 * Sheet structures by category
 */
export const categorySheetStructures: Record<string, SheetStructure> = {
  'Utilities': {
    tabName: 'Utilities',
    columns: [
      { header: 'Date', width: 100, format: 'date' },
      { header: 'Type', width: 120 }, // Electricity, Water, Gas, etc.
      { header: 'Vendor', width: 150 },
      { header: 'Due Date', width: 100, format: 'date' },
      { header: 'Amount', width: 100, format: 'currency' },
      { header: 'Status', width: 100 },
      { header: 'Document ID', width: 180 },
    ],
    rowMapper: (doc: Document) => [
      doc.documentDate,
      doc.documentType,
      doc.vendorName,
      doc.dueDate || '',
      doc.totalAmount,
      doc.status,
      doc.id,
    ],
  },

  'Office Supplies': {
    tabName: 'Office Supplies',
    columns: [
      { header: 'Date', width: 100, format: 'date' },
      { header: 'Vendor', width: 150 },
      { header: 'Description', width: 250 },
      { header: 'Amount', width: 100, format: 'currency' },
      { header: 'Category', width: 120 },
      { header: 'Status', width: 100 },
      { header: 'Document ID', width: 180 },
    ],
    rowMapper: (doc: Document) => [
      doc.documentDate,
      doc.vendorName,
      doc.extractionData.lineItems?.[0]?.description || 'Office supplies',
      doc.totalAmount,
      doc.category,
      doc.status,
      doc.id,
    ],
  },

  'Software & Services': {
    tabName: 'Software & Services',
    columns: [
      { header: 'Date', width: 100, format: 'date' },
      { header: 'Vendor', width: 150 },
      { header: 'Service', width: 200 },
      { header: 'Billing Period', width: 150 },
      { header: 'Amount', width: 100, format: 'currency' },
      { header: 'Status', width: 100 },
      { header: 'Document ID', width: 180 },
    ],
    rowMapper: (doc: Document) => {
      const period = doc.extractionData.dates.servicePeriod
        ? `${doc.extractionData.dates.servicePeriod.start.toLocaleDateString()} - ${doc.extractionData.dates.servicePeriod.end.toLocaleDateString()}`
        : '';
      return [
        doc.documentDate,
        doc.vendorName,
        doc.extractionData.lineItems?.[0]?.description || doc.category,
        period,
        doc.totalAmount,
        doc.status,
        doc.id,
      ];
    },
  },

  'Marketing & Advertising': {
    tabName: 'Marketing & Advertising',
    columns: commonColumns,
    rowMapper: (doc: Document) => [
      doc.documentDate,
      doc.vendorName,
      doc.totalAmount,
      doc.status,
      doc.id,
    ],
  },

  'Professional Services': {
    tabName: 'Professional Services',
    columns: commonColumns,
    rowMapper: (doc: Document) => [
      doc.documentDate,
      doc.vendorName,
      doc.totalAmount,
      doc.status,
      doc.id,
    ],
  },
};

/**
 * Default structure for uncategorized or unknown categories
 */
export const defaultSheetStructure: SheetStructure = {
  tabName: 'Other Expenses',
  columns: [
    { header: 'Date', width: 100, format: 'date' },
    { header: 'Vendor', width: 150 },
    { header: 'Category', width: 120 },
    { header: 'Amount', width: 100, format: 'currency' },
    { header: 'Type', width: 100 },
    { header: 'Status', width: 100 },
    { header: 'Document ID', width: 180 },
  ],
  rowMapper: (doc: Document) => [
    doc.documentDate,
    doc.vendorName,
    doc.category,
    doc.totalAmount,
    doc.documentType,
    doc.status,
    doc.id,
  ],
};

/**
 * Get sheet structure for a document category
 */
export function getSheetStructureForCategory(category: string): SheetStructure {
  return categorySheetStructures[category] || defaultSheetStructure;
}

/**
 * Get all unique sheet tab names
 */
export function getAllSheetTabs(): string[] {
  const tabs = Object.values(categorySheetStructures).map(s => s.tabName);
  tabs.push(defaultSheetStructure.tabName);
  return [...new Set(tabs)];
}

/**
 * Format cell value based on column format
 */
export function formatCellValue(value: any, format?: string): any {
  if (value === null || value === undefined) return '';

  switch (format) {
    case 'date':
      return value instanceof Date ? value.toLocaleDateString() : value;
    case 'currency':
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    case 'number':
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    default:
      return String(value);
  }
}
