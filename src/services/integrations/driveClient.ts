/**
 * Google Drive Client Service
 *
 * Handles interactions with Google Drive API to list and download files
 * from a monitored folder.
 */

import { DriveFile, DriveFolder } from '@/types';

/**
 * Mock mode flag - set to false when OAuth is implemented
 */
const MOCK_MODE = true;

/**
 * List folders accessible to the user
 * Used for folder selection in settings
 */
export async function listDriveFolders(): Promise<DriveFolder[]> {
  if (MOCK_MODE) {
    // Mock folders for testing
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 'mock-folder-1',
        name: 'Receipts',
        modifiedTime: new Date('2024-01-15'),
      },
      {
        id: 'mock-folder-2',
        name: 'Invoices 2024',
        modifiedTime: new Date('2024-02-20'),
      },
      {
        id: 'mock-folder-3',
        name: 'Financial Documents',
        modifiedTime: new Date('2024-03-10'),
      },
    ];
  }

  // PRODUCTION IMPLEMENTATION:
  // const drive = google.drive({ version: 'v3', auth: getAuthClient() });
  // const response = await drive.files.list({
  //   q: "mimeType='application/vnd.google-apps.folder'",
  //   fields: 'files(id, name, modifiedTime)',
  //   pageSize: 100,
  // });
  // return response.data.files || [];

  return [];
}

/**
 * List files in a specific folder
 */
export async function listFilesInFolder(folderId: string): Promise<DriveFile[]> {
  if (MOCK_MODE) {
    // Mock files for testing
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: 'mock-file-1',
        name: 'receipt-2024-01-15.pdf',
        mimeType: 'application/pdf',
        size: 245678,
        modifiedTime: new Date('2024-01-15'),
        webViewLink: 'https://drive.google.com/file/mock-1',
      },
      {
        id: 'mock-file-2',
        name: 'invoice-acme-corp.pdf',
        mimeType: 'application/pdf',
        size: 189234,
        modifiedTime: new Date('2024-02-20'),
        webViewLink: 'https://drive.google.com/file/mock-2',
      },
      {
        id: 'mock-file-3',
        name: 'utility-bill-march.jpg',
        mimeType: 'image/jpeg',
        size: 456789,
        modifiedTime: new Date('2024-03-10'),
        webViewLink: 'https://drive.google.com/file/mock-3',
      },
    ];
  }

  // PRODUCTION IMPLEMENTATION:
  // const drive = google.drive({ version: 'v3', auth: getAuthClient() });
  // const response = await drive.files.list({
  //   q: `'${folderId}' in parents and trashed=false`,
  //   fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, thumbnailLink)',
  //   pageSize: 100,
  // });
  // return response.data.files || [];

  return [];
}

/**
 * Download a file from Drive
 * Returns file content as Buffer
 */
export async function downloadFile(fileId: string): Promise<Buffer | null> {
  if (MOCK_MODE) {
    console.log(`[MOCK] Would download file: ${fileId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Return mock buffer
    return Buffer.from('mock file content');
  }

  // PRODUCTION IMPLEMENTATION:
  // const drive = google.drive({ version: 'v3', auth: getAuthClient() });
  // const response = await drive.files.get(
  //   { fileId, alt: 'media' },
  //   { responseType: 'arraybuffer' }
  // );
  // return Buffer.from(response.data as ArrayBuffer);

  return null;
}

/**
 * Check for new files in folder since last check
 */
export async function getNewFiles(
  folderId: string,
  lastCheckTime: Date
): Promise<DriveFile[]> {
  const allFiles = await listFilesInFolder(folderId);
  return allFiles.filter(file => file.modifiedTime > lastCheckTime);
}
