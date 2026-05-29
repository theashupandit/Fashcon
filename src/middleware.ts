import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log storefront visits to terminal
  console.log(`\x1b[35m[STOREFRONT VISIT]\x1b[0m Path: \x1b[36m${pathname}\x1b[0m at ${new Date().toLocaleTimeString()}`);
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pages except assets and internal next/api requests
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|eot|css|js)$).*)',
  ],
};
