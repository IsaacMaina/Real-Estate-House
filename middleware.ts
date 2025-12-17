// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define secret for JWT verification
const secret = process.env.NEXTAUTH_SECRET;

// Define protected routes that require authentication
const protectedRoutes = [
  '/user-dashboard',
  '/user-dashboard/',
  '/user-profile',
  '/user-settings',
  '/saved-properties',
  '/my-appointments',
  '/my-inquiries',
  '/my-favorites'
];

// Define admin-only routes
const adminRoutes = [
  '/admin',
  '/admin/',
  '/admin/dashboard',
  '/admin/properties',
  '/admin/users',
  '/admin/inquiries',
  '/admin/appointments',
  '/admin/reviews',
  '/admin/blog'
];

export async function middleware(request: NextRequest) {
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute || isAdminRoute) {
    // Get token from request
    const token = await getToken({ 
      req: request, 
      secret: secret 
    });

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If it's an admin route, check if user has admin role
    if (isAdminRoute && token.role !== 'admin') {
      // User is not an admin, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
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
    '/((?!api|_next/static|_next/image|favicon\\.ico).*)',
  ],
};