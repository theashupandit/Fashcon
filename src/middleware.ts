import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We primarily rely on client-side guards and Firebase Rules for this prototype environment,
  // but we can add basic path redirection here if needed.
  // For production Next.js apps, this is where you'd check a secure session cookie.
  
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
