/**
 * Gmail Monitoring Service
 *
 * Monitors Gmail for bills from specific senders and extracts attachments.
 * Currently focused on: electricity, water, and internet bills.
 *
 * Required packages: googleapis
 */

import { google } from 'googleapis';
import { getAuthClient } from './googleOAuth';
import { Document } from '@/types';

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: Date;
  attachments: GmailAttachment[];
}

export interface GmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

export interface BillFile {
  messageId: string;
  filename: string;
  mimeType: string;
  size: number;
  from: string;
  subject: string;
  date: Date;
  category: 'electricity' | 'water' | 'internet' | 'other';
  data: string; // base64 encoded file data
}

/**
 * Common bill sender patterns
 * Expand this list based on actual utility company domains
 */
const BILL_SENDER_PATTERNS = {
  electricity: [
    'pg&e', 'pge.com', 'duke-energy', 'con edison', 'coned.com',
    'southern company', 'sce.com', 'electric', 'power company'
  ],
  water: [
    'water', 'waterutility', 'water district', 'wastewater',
    'sewer', 'municipal water'
  ],
  internet: [
    'comcast', 'xfinity.com', 'verizon', 'att.com', 'spectrum.com',
    'cox.com', 'frontier', 'centurylink', 'optimum', 'isp'
  ],
};

/**
 * Detect bill category from sender email
 */
function detectBillCategory(from: string): 'electricity' | 'water' | 'internet' | 'other' {
  const lowerFrom = from.toLowerCase();

  for (const [category, patterns] of Object.entries(BILL_SENDER_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerFrom.includes(pattern.toLowerCase())) {
        return category as 'electricity' | 'water' | 'internet';
      }
    }
  }

  return 'other';
}

/**
 * Search Gmail for bills with attachments
 * @param monthsBack - How many months back to search (default 3)
 * @returns Array of bill files found
 */
export async function searchForBills(monthsBack: number = 3): Promise<BillFile[]> {
  try {
    const auth = getAuthClient();
    const gmail = google.gmail({ version: 'v1', auth });

    // Calculate date range
    const afterDate = new Date();
    afterDate.setMonth(afterDate.getMonth() - monthsBack);
    const afterDateStr = afterDate.toISOString().split('T')[0].replace(/-/g, '/');

    // Search query: emails with attachments after a certain date
    const query = `has:attachment after:${afterDateStr}`;

    // Get list of messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 100, // Limit for MVP
    });

    const messages = response.data.messages || [];
    console.log(`Found ${messages.length} emails with attachments`);

    const billFiles: BillFile[] = [];

    // Process each message
    for (const message of messages) {
      if (!message.id) continue;

      try {
        const billFile = await extractBillFromMessage(gmail, message.id);
        if (billFile) {
          billFiles.push(...billFile);
        }
      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error);
      }
    }

    console.log(`Extracted ${billFiles.length} bill files`);
    return billFiles;

  } catch (error) {
    console.error('Error searching for bills:', error);
    throw error;
  }
}

/**
 * Extract bill attachments from a Gmail message
 * @param gmail - Authenticated Gmail API client
 * @param messageId - Gmail message ID
 * @returns Array of bill files (if any match bill criteria)
 */
async function extractBillFromMessage(gmail: any, messageId: string): Promise<BillFile[]> {
  // Get full message details
  const message = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const headers = message.data.payload?.headers || [];
  const from = headers.find((h: any) => h.name === 'From')?.value || '';
  const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
  const dateStr = headers.find((h: any) => h.name === 'Date')?.value || '';
  const date = new Date(dateStr);

  // Detect if this is a bill
  const category = detectBillCategory(from);

  // Only process if it matches a bill category
  if (category === 'other') {
    return [];
  }

  // Extract attachments
  const attachments = extractAttachmentsFromParts(message.data.payload);

  if (attachments.length === 0) {
    return [];
  }

  const billFiles: BillFile[] = [];

  // Download each attachment
  for (const attachment of attachments) {
    // Only process PDF and image files
    if (
      attachment.mimeType === 'application/pdf' ||
      attachment.mimeType.startsWith('image/')
    ) {
      try {
        const attachmentData = await gmail.users.messages.attachments.get({
          userId: 'me',
          messageId: messageId,
          id: attachment.attachmentId,
        });

        billFiles.push({
          messageId,
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          size: attachment.size,
          from,
          subject,
          date,
          category,
          data: attachmentData.data.data, // base64 encoded
        });
      } catch (error) {
        console.error(`Error downloading attachment ${attachment.filename}:`, error);
      }
    }
  }

  return billFiles;
}

/**
 * Recursively extract attachments from message parts
 */
function extractAttachmentsFromParts(payload: any): GmailAttachment[] {
  const attachments: GmailAttachment[] = [];

  function traverse(part: any) {
    if (part.filename && part.body?.attachmentId) {
      attachments.push({
        filename: part.filename,
        mimeType: part.mimeType || 'application/octet-stream',
        size: part.body.size || 0,
        attachmentId: part.body.attachmentId,
      });
    }

    if (part.parts) {
      part.parts.forEach(traverse);
    }
  }

  if (payload) {
    traverse(payload);
  }

  return attachments;
}

export default {
  searchForBills,
};
