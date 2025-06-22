import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/edge-jwt';

export async function middleware(request: NextRequest) {
  console.log('Middleware processing path:', request.nextUrl.pathname);

  // Skip middleware for login-related paths and API routes
  if (request.nextUrl.pathname === '/admin/login' || 
      request.nextUrl.pathname.startsWith('/api/')) {
    console.log('Skipping middleware for:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Only protect /admin/* routes
  if (request.nextUrl.pathname.startsWith('/admin/')) {
    try {
      // Get token from cookie
      const token = request.cookies.get('auth_token')?.value;
      console.log('Found token in cookies:', !!token);

      if (!token) {
        console.log('No token found, redirecting to login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Verify token
      const payload = await verifyToken(token);
      console.log('Token verified, payload:', payload);

      if (payload.role !== 'admin') {
        console.log('Invalid role, redirecting to login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      console.log('Access granted to:', request.nextUrl.pathname);
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 