/**
 * Gmail Monitoring Service
 *
 * PLACEHOLDER - Not implemented in MVP
 *
 * In production, this module would:
 * - Monitor Gmail inbox for new emails with attachments
 * - Filter emails by labels/folders
 * - Extract PDF and image attachments
 * - Queue attachments for OCR processing
 * - Use Gmail Push Notifications (webhooks) for real-time monitoring
 *
 * Required packages:
 * - googleapis
 * - bullmq (for job queue)
 *
 * Architecture:
 * 1. User connects Gmail via OAuth
 * 2. Set up Gmail Push Notification webhook
 * 3. When new email arrives, webhook triggers our API
 * 4. API fetches email, extracts attachments
 * 5. Attachments queued for OCR processing
 */

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
  data: Buffer;
}

/**
 * Set up Gmail push notifications
 * @param userId - User ID to set up monitoring for
 * @param watchLabels - Gmail labels to monitor (e.g., ['INBOX', 'Bills'])
 */
export async function setupGmailWatch(
  userId: string,
  watchLabels: string[] = ['INBOX']
): Promise<void> {
  // PRODUCTION IMPLEMENTATION:
  // const gmail = google.gmail({ version: 'v1', auth: oauthClient });
  //
  // const watchRequest = {
  //   userId: 'me',
  //   resource: {
  //     labelIds: watchLabels,
  //     topicName: `projects/${PROJECT_ID}/topics/gmail-notifications`,
  //     labelFilterAction: 'include'
  //   }
  // };
  //
  // const response = await gmail.users.watch(watchRequest);
  //
  // // Store watch info in database
  // await supabase
  //   .from('gmail_watches')
  //   .upsert({
  //     user_id: userId,
  //     history_id: response.data.historyId,
  //     expiration: response.data.expiration
  //   });

  console.log(`[MOCK] Gmail watch setup for user ${userId} on labels:`, watchLabels);
}

/**
 * Process incoming Gmail webhook notification
 * @param notification - Webhook payload from Google
 */
export async function processGmailNotification(
  notification: any
): Promise<void> {
  // PRODUCTION IMPLEMENTATION:
  // const { emailAddress, historyId } = notification;
  //
  // // Get user from email
  // const user = await getUserByEmail(emailAddress);
  //
  // // Fetch new messages since last historyId
  // const newMessages = await getNewMessages(user.id, historyId);
  //
  // // Process each message
  // for (const message of newMessages) {
  //   await processMessage(message, user.id);
  // }

  console.log('[MOCK] Processing Gmail notification:', notification);
}

/**
 * Fetch and process a Gmail message
 * @param messageId - Gmail message ID
 * @param userId - User ID
 */
export async function processMessage(
  messageId: string,
  userId: string
): Promise<Document[]> {
  // PRODUCTION IMPLEMENTATION:
  // const gmail = google.gmail({ version: 'v1', auth: oauthClient });
  //
  // // Get message details
  // const message = await gmail.users.messages.get({
  //   userId: 'me',
  //   id: messageId,
  //   format: 'full'
  // });
  //
  // // Extract attachments
  // const attachments = await extractAttachments(message);
  //
  // // Filter for supported file types (PDF, images)
  // const validAttachments = attachments.filter(att =>
  //   att.mimeType === 'application/pdf' ||
  //   att.mimeType.startsWith('image/')
  // );
  //
  // // Queue each attachment for OCR processing
  // const documents = [];
  // for (const attachment of validAttachments) {
  //   const doc = await queueForOCR({
  //     userId,
  //     sourceType: 'gmail',
  //     sourceReference: messageId,
  //     filename: attachment.filename,
  //     fileData: attachment.data
  //   });
  //   documents.push(doc);
  // }
  //
  // return documents;

  console.log(`[MOCK] Processing message ${messageId} for user ${userId}`);
  return [];
}

/**
 * Manually scan Gmail for historical emails with attachments
 * @param userId - User ID
 * @param months - How many months back to scan
 */
export async function scanHistoricalEmails(
  userId: string,
  months: number = 12
): Promise<number> {
  // PRODUCTION IMPLEMENTATION:
  // const gmail = google.gmail({ version: 'v1', auth: oauthClient });
  //
  // const afterDate = new Date();
  // afterDate.setMonth(afterDate.getMonth() - months);
  //
  // // Search for emails with attachments
  // const query = `has:attachment after:${afterDate.toISOString().split('T')[0]}`;
  //
  // const response = await gmail.users.messages.list({
  //   userId: 'me',
  //   q: query,
  //   maxResults: 500
  // });
  //
  // const messageIds = response.data.messages?.map(m => m.id) || [];
  //
  // // Process each message
  // for (const messageId of messageIds) {
  //   await processMessage(messageId, userId);
  // }
  //
  // return messageIds.length;

  console.log(`[MOCK] Scanning ${months} months of email for user ${userId}`);
  return 0;
}

export default {
  setupGmailWatch,
  processGmailNotification,
  processMessage,
  scanHistoricalEmails,
};
