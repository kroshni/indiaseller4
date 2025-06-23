import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/edge-jwt';

// Paths that require admin authentication
const ADMIN_PATHS = ['/admin'];
// Paths that require seller authentication
const SELLER_PATHS = ['/seller'];
// Paths that are public
const PUBLIC_PATHS = ['/admin/login', '/seller/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths and non-protected routes
  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    (!ADMIN_PATHS.some((path) => pathname.startsWith(path)) &&
      !SELLER_PATHS.some((path) => pathname.startsWith(path)))
  ) {
    return NextResponse.next();
  }

  // Check for admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_token');

    if (!adminToken) {
      return redirectToLogin(request, 'admin');
    }

    try {
      const decoded = await verifyToken(adminToken.value);
      if (!decoded || decoded.role !== 'admin') {
        return redirectToLogin(request, 'admin');
      }
    } catch (error) {
      return redirectToLogin(request, 'admin');
    }
  }

  // Check for seller routes
  if (pathname.startsWith('/seller')) {
    const sellerToken = request.cookies.get('seller_token');

    if (!sellerToken) {
      return redirectToLogin(request, 'seller');
    }

    try {
      const decoded = await verifyToken(sellerToken.value);
      if (!decoded || decoded.role !== 'seller') {
        return redirectToLogin(request, 'seller');
      }
    } catch (error) {
      return redirectToLogin(request, 'seller');
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, type: 'admin' | 'seller') {
  const url = new URL(`/${type}/login`, request.url);
  url.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. Matches any path starting with:
     *  - api (API routes)
     *  - _next/static (static files)
     *  - _next/image (image optimization files)
     *  - favicon.ico (favicon file)
     *  - public folder
     * 2. But includes:
     *  - /api/admin
     *  - /api/seller
     */
    '/((?!api/(?!admin|seller)|_next/static|_next/image|favicon.ico).*)',
  ],
}; 