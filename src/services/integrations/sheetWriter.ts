/**
 * Google Sheets Writer Service
 * Handles writing document data to Google Sheets
 */

import { google } from 'googleapis';
import { Document } from '@/types';
import { getAuthenticatedClient } from './googleOAuth';
import {
  getSheetStructureForCategory,
  getAllSheetTabs,
  formatCellValue,
  type SheetStructure,
} from './sheetStructure';

const IS_PRODUCTION = process.env.ENABLE_GOOGLE_INTEGRATION === 'true';

/**
 * Check if a spreadsheet exists and user has access
 */
export async function verifySpreadsheetAccess(
  spreadsheetId: string,
  userId: string
): Promise<boolean> {
  if (!IS_PRODUCTION) return true;

  try {
    const auth = getAuthenticatedClient(userId);
    const sheets = google.sheets({ version: 'v4', auth: auth! });

    await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return true;
  } catch (error) {
    console.error('Spreadsheet access error:', error);
    return false;
  }
}

/**
 * Initialize spreadsheet with category tabs and headers
 */
export async function initializeSpreadsheet(
  spreadsheetId: string,
  userId: string
): Promise<void> {
  if (!IS_PRODUCTION) {
    console.log('[MOCK] Initializing spreadsheet:', spreadsheetId);
    return;
  }

  const auth = getAuthenticatedClient(userId);
  const sheets = google.sheets({ version: 'v4', auth: auth! });

  // Get existing sheets
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  const existingSheets = spreadsheet.data.sheets?.map(s => s.properties?.title) || [];
  const requiredTabs = getAllSheetTabs();

  // Create missing tabs
  const requests = [];
  for (const tabName of requiredTabs) {
    if (!existingSheets.includes(tabName)) {
      requests.push({
        addSheet: {
          properties: {
            title: tabName,
          },
        },
      });
    }
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests,
      },
    });
  }

  // Add headers to each tab
  await addHeadersToTabs(spreadsheetId, userId);
}

/**
 * Add headers to all tabs
 */
async function addHeadersToTabs(spreadsheetId: string, userId: string): Promise<void> {
  if (!IS_PRODUCTION) return;

  const auth = getAuthenticatedClient(userId);
  const sheets = google.sheets({ version: 'v4', auth: auth! });

  const allTabs = getAllSheetTabs();
  const data = [];

  for (const tabName of allTabs) {
    const structure = getSheetStructureForCategory(tabName);
    const headers = structure.columns.map(col => col.header);

    data.push({
      range: `${tabName}!A1`,
      values: [headers],
    });
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data,
    },
  });
}

/**
 * Write a single document to the appropriate sheet
 */
export async function writeDocumentToSheet(
  spreadsheetId: string,
  document: Document,
  userId: string
): Promise<void> {
  if (!IS_PRODUCTION) {
    console.log('[MOCK] Writing document to sheet:', document.id);
    return;
  }

  const structure = getSheetStructureForCategory(document.category);
  const tabName = structure.tabName;

  // Check if document already exists in sheet
  const existingRow = await findDocumentRow(spreadsheetId, tabName, document.id, userId);

  if (existingRow !== null) {
    // Update existing row
    await updateDocumentRow(spreadsheetId, tabName, existingRow, document, structure, userId);
  } else {
    // Append new row
    await appendDocumentRow(spreadsheetId, tabName, document, structure, userId);
  }
}

/**
 * Find the row number of a document by its ID
 */
async function findDocumentRow(
  spreadsheetId: string,
  tabName: string,
  documentId: string,
  userId: string
): Promise<number | null> {
  if (!IS_PRODUCTION) return null;

  const auth = getAuthenticatedClient(userId);
  const sheets = google.sheets({ version: 'v4', auth: auth! });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:Z`,
  });

  const rows = response.data.values || [];

  // Find the column index for Document ID
  const headerRow = rows[0] || [];
  const docIdColumn = headerRow.findIndex(h => h === 'Document ID');

  if (docIdColumn === -1) return null;

  // Search for the document ID
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][docIdColumn] === documentId) {
      return i + 1; // Sheet rows are 1-indexed
    }
  }

  return null;
}

/**
 * Update an existing document row
 */
async function updateDocumentRow(
  spreadsheetId: string,
  tabName: string,
  rowNumber: number,
  document: Document,
  structure: SheetStructure,
  userId: string
): Promise<void> {
  if (!IS_PRODUCTION) return;

  const auth = getAuthenticatedClient(userId);
  const sheets = google.sheets({ version: 'v4', auth: auth! });

  const rowData = structure.rowMapper(document);
  const formattedData = rowData.map((value, index) =>
    formatCellValue(value, structure.columns[index]?.format)
  );

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [formattedData],
    },
  });
}

/**
 * Append a new document row
 */
async function appendDocumentRow(
  spreadsheetId: string,
  tabName: string,
  document: Document,
  structure: SheetStructure,
  userId: string
): Promise<void> {
  if (!IS_PRODUCTION) return;

  const auth = getAuthenticatedClient(userId);
  const sheets = google.sheets({ version: 'v4', auth: auth! });

  const rowData = structure.rowMapper(document);
  const formattedData = rowData.map((value, index) =>
    formatCellValue(value, structure.columns[index]?.format)
  );

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [formattedData],
    },
  });
}

/**
 * Batch write multiple documents
 */
export async function batchWriteDocuments(
  spreadsheetId: string,
  documents: Document[],
  userId: string
): Promise<void> {
  if (!IS_PRODUCTION) {
    console.log('[MOCK] Batch writing documents:', documents.length);
    return;
  }

  // Process in chunks to avoid API limits
  const chunkSize = 10;
  for (let i = 0; i < documents.length; i += chunkSize) {
    const chunk = documents.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(doc => writeDocumentToSheet(spreadsheetId, doc, userId))
    );
  }
}

/**
 * List user's spreadsheets
 */
export async function listUserSpreadsheets(userId: string): Promise<any[]> {
  if (!IS_PRODUCTION) {
    return [
      { id: 'mock_sheet_1', name: 'FinanceFlow Data (Mock)' },
      { id: 'mock_sheet_2', name: 'Expenses 2024 (Mock)' },
    ];
  }

  const auth = getAuthenticatedClient(userId);
  const drive = google.drive({ version: 'v3', auth: auth! });

  const response = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    fields: 'files(id, name)',
    pageSize: 50,
  });

  return response.data.files || [];
}

export default {
  verifySpreadsheetAccess,
  initializeSpreadsheet,
  writeDocumentToSheet,
  batchWriteDocuments,
  listUserSpreadsheets,
};
