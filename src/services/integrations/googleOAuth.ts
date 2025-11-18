/**
 * Google OAuth Integration Module
 * Handles OAuth 2.0 flow for Google Sheets access
 *
 * Environment variables:
 * - NEXT_PUBLIC_GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - NEXT_PUBLIC_GOOGLE_REDIRECT_URI
 * - ENABLE_GOOGLE_INTEGRATION (set to 'true' for production mode)
 */

import { google } from 'googleapis';

const IS_PRODUCTION = process.env.ENABLE_GOOGLE_INTEGRATION === 'true';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

// In-memory token storage (replace with Supabase later)
const tokenStore = new Map<string, GoogleTokens>();

/**
 * Get OAuth2 client instance
 */
function getOAuth2Client() {
  if (!IS_PRODUCTION) return null;

  return new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );
}

/**
 * Initiates the Google OAuth flow
 * @param service - The Google service to authenticate (gmail, drive, sheets)
 * @param userId - Current user ID (encoded in state)
 * @returns Authorization URL to redirect user to
 */
export async function initiateOAuthFlow(
  service: 'gmail' | 'drive' | 'sheets',
  userId?: string
): Promise<string> {
  if (!IS_PRODUCTION) {
    // MOCK: Return a placeholder URL
    return `https://accounts.google.com/o/oauth2/v2/auth?mock=true&service=${service}`;
  }

  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('OAuth client not configured');
  }

  const scopes = getRequiredScopes(service);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent screen to ensure refresh token
    state: JSON.stringify({ service, userId }),
  });

  return authUrl;
}

/**
 * Handles the OAuth callback after user authorization
 * @param code - Authorization code from Google
 * @param userId - Current user ID
 */
export async function handleOAuthCallback(
  code: string,
  userId: string
): Promise<GoogleTokens> {
  if (!IS_PRODUCTION) {
    // MOCK: Return fake tokens
    const mockTokens = {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      expiresAt: new Date(Date.now() + 3600 * 1000),
    };
    tokenStore.set(userId, mockTokens);
    return mockTokens;
  }

  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('OAuth client not configured');
  }

  const { tokens } = await oauth2Client.getToken(code);

  const googleTokens: GoogleTokens = {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(tokens.expiry_date!),
  };

  // Store in memory (replace with Supabase later)
  tokenStore.set(userId, googleTokens);

  return googleTokens;
}

/**
 * Refreshes an expired access token
 * @param userId - User ID to refresh tokens for
 */
export async function refreshAccessToken(userId: string): Promise<string> {
  if (!IS_PRODUCTION) {
    return 'mock_refreshed_token';
  }

  const tokens = tokenStore.get(userId);
  if (!tokens?.refreshToken) {
    throw new Error('No refresh token available for user');
  }

  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('OAuth client not configured');
  }

  oauth2Client.setCredentials({
    refresh_token: tokens.refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  // Update stored tokens
  const updatedTokens: GoogleTokens = {
    accessToken: credentials.access_token!,
    refreshToken: credentials.refresh_token || tokens.refreshToken,
    expiresAt: new Date(credentials.expiry_date!),
  };
  tokenStore.set(userId, updatedTokens);

  return credentials.access_token!;
}

/**
 * Get tokens for a user
 * @param userId - User ID
 */
export function getTokensForUser(userId: string): GoogleTokens | undefined {
  return tokenStore.get(userId);
}

/**
 * Get authenticated OAuth2 client for a user
 * @param userId - User ID
 */
export function getAuthenticatedClient(userId: string) {
  if (!IS_PRODUCTION) return null;

  const tokens = tokenStore.get(userId);
  if (!tokens) {
    throw new Error('User not authenticated');
  }

  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('OAuth client not configured');
  }

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiresAt.getTime(),
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
  handleOAuthCallback,
  refreshAccessToken,
  getTokensForUser,
  getAuthenticatedClient,
};
