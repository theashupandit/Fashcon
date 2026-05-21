import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const appId = process.env.PINTEREST_APP_ID;
  
  if (!appId) {
    return new NextResponse("PINTEREST_APP_ID not found in environment variables", { status: 500 });
  }

  // Get the base URL dynamically based on where the request came from
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/pinterest/callback`;

  // Generate a random state string for security
  const state = Math.random().toString(36).substring(2);
  
  // Required scopes for fetching boards, pins, user account, and publishing pins
  const scope = "boards:read,boards:write,pins:read,pins:write,user_accounts:read";
  
  const authUrl = `https://www.pinterest.com/oauth/?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
