/**
 * Google OAuth Integration Module
 *
 * Handles Google OAuth 2.0 authentication flow for Gmail integration.
 * Tokens are stored in localStorage (MVP) - in production, use encrypted database storage.
 *
 * Required packages: googleapis
 * Required environment variables:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - NEXT_PUBLIC_GOOGLE_REDIRECT_URI
 */

import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

/**
 * Initiates the Google OAuth flow
 * @param service - The Google service to authenticate (gmail, drive, sheets)
 * @returns Authorization URL to redirect user to
 */
export async function initiateOAuthFlow(
  service: 'gmail' | 'drive' | 'sheets' = 'gmail'
): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  const scopes = getRequiredScopes(service);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent to ensure we get refresh token
  });

  return authUrl;
}

/**
 * Store tokens in localStorage (MVP only - use encrypted DB in production)
 */
export function storeTokens(tokens: GoogleTokens): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gmail_tokens', JSON.stringify(tokens));
  }
}

/**
 * Retrieve tokens from localStorage
 */
export function getStoredTokens(): GoogleTokens | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('gmail_tokens');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear stored tokens
 */
export function clearTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gmail_tokens');
  }
}

/**
 * Refreshes an expired access token using refresh token
 */
export async function refreshAccessToken(): Promise<string> {
  const tokens = getStoredTokens();
  if (!tokens?.refreshToken) {
    throw new Error('No refresh token available');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: tokens.refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (credentials.access_token) {
    // Update stored tokens
    const updatedTokens: GoogleTokens = {
      ...tokens,
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date || Date.now() + 3600 * 1000,
    };
    storeTokens(updatedTokens);

    return credentials.access_token;
  }

  throw new Error('Failed to refresh access token');
}

/**
 * Get authenticated OAuth2 client
 */
export function getAuthClient(): OAuth2Client {
  const tokens = getStoredTokens();
  if (!tokens) {
    throw new Error('No tokens available - user not authenticated');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate,
  });

  return oauth2Client;
}

/**
 * Get required OAuth scopes for a service
 */
function getRequiredScopes(service: 'gmail' | 'drive' | 'sheets'): string[] {
  const scopeMap = {
    gmail: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    drive: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
    ],
    sheets: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  };

  return scopeMap[service];
}

export default {
  initiateOAuthFlow,
  refreshAccessToken,
  getAuthClient,
  storeTokens,
  getStoredTokens,
  clearTokens,
};
