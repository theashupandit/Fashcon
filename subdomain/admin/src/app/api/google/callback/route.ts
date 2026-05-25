import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { GoogleIntegration } from '@/models/GoogleIntegration';
import mongoose from 'mongoose';

// Ensure DB connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI!);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
      process.env.GOOGLE_SEARCH_CONSOLE_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    
    await connectDB();

    // Store Analytics integration
    if (tokens.access_token) {
      await GoogleIntegration.findOneAndUpdate(
        { service: 'analytics' },
        {
          isConnected: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || undefined,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          lastSync: new Date(),
        },
        { upsert: true, new: true }
      );

      // Store Search Console integration (sharing the same tokens usually if scopes are combined)
      await GoogleIntegration.findOneAndUpdate(
        { service: 'search_console' },
        {
          isConnected: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || undefined,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          lastSync: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    // Redirect back to configuration page
    return NextResponse.redirect(new URL('/configuration/api', request.url).origin + '/configuration/api?success=google_connected');
  } catch (error: any) {
    console.error('Google OAuth Error:', error);
    return NextResponse.redirect(new URL('/configuration/api', request.url).origin + '/configuration/api?error=google_auth_failed');
  }
}
