import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/publish'];

// Paths that are always public
const PUBLIC_PATHS = ['/login', '/', '/pricing', '/about', '/contact', '/faq',
  '/privacy', '/terms', '/cookies', '/refund', '/dpa', '/acceptable-use', '/affiliate-terms'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|webp|json|js|css)$/)
  ) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isProtected) {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      // Redirect to login — preserve the intended destination
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
