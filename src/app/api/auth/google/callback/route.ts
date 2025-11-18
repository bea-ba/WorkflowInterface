import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

/**
 * Google OAuth Callback Handler
 *
 * This route handles the OAuth callback from Google after user authorization.
 * It exchanges the authorization code for access/refresh tokens.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Check for authorization code
    if (!code) {
      return NextResponse.redirect(
        new URL('/settings?error=no_code', request.url)
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // In a real app, you would:
    // 1. Encrypt the tokens
    // 2. Store them in database (Supabase) linked to user
    // 3. Set up session/cookie for the user
    //
    // For now, we'll store in localStorage via URL param (MVP only - not secure)
    const tokensEncoded = encodeURIComponent(JSON.stringify({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    }));

    // Redirect to settings with success message and tokens
    return NextResponse.redirect(
      new URL(`/settings?gmail_connected=true&tokens=${tokensEncoded}`, request.url)
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/settings?error=auth_failed', request.url)
    );
  }
}
