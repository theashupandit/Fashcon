import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PinterestIntegration } from '@/models/PinterestIntegration';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${url.origin}/pinterest?view=live-pins&error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${url.origin}/pinterest?view=live-pins&error=no_code`);
  }

  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;
  const redirectUri = `${url.origin}/api/pinterest/callback`;

  if (!appId || !appSecret) {
    return new NextResponse("Pinterest App ID or Secret missing", { status: 500 });
  }

  try {
    const authHeader = Buffer.from(`${appId}:${appSecret}`).toString('base64');
    
    const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Pinterest Token Exchange Error:", data);
      return NextResponse.redirect(`${url.origin}/pinterest?view=live-pins&error=token_exchange_failed`);
    }

    const { access_token, refresh_token, expires_in } = data;

    // Save tokens to DB
    await dbConnect();
    
    // Find active integration or create a new one
    let integration = await PinterestIntegration.findOne({ isActive: true });
    
    const tokenExpiresAt = new Date(Date.now() + ((expires_in || 2592000) * 1000));
    
    if (integration) {
      integration.accessToken = access_token;
      if (refresh_token) {
        integration.refreshToken = refresh_token;
      }
      integration.tokenExpiresAt = tokenExpiresAt;
      await integration.save();
    } else {
      await PinterestIntegration.create({
        accountId: 'oauth_app_account',
        username: 'fashcon_admin',
        accessToken: access_token,
        refreshToken: refresh_token || 'env_refresh_token',
        tokenExpiresAt: tokenExpiresAt,
        savedBoards: [],
        isActive: true,
      });
    }

    return NextResponse.redirect(`${url.origin}/pinterest?view=live-pins&success=oauth_connected`);
  } catch (err) {
    console.error("Error in Pinterest callback:", err);
    return NextResponse.redirect(`${url.origin}/pinterest?view=live-pins&error=internal_error`);
  }
}
