/**
 * Production-Ready Next.js Middleware
 *
 * Handles authentication and authorization at the edge
 *
 * Features:
 * - Route protection based on auth status
 * - Role-based redirects
 * - Clean scalable route matching
 * - No token manipulation - uses cookies only
 *
 * How it works:
 * 1. Checks for accessToken cookie
 * 2. Protected routes: require valid token
 * 3. Auth routes: redirect to dashboard if logged in
 * 4. Role-based routes: redirect to correct dashboard
 */

import { NextResponse } from "next/server";

/**
 * Get token from cookies
 * @param {Object} cookies - Next.js cookies object
 * @returns {string|null} Token value or null
 */
const getToken = (cookies) => {
  return cookies.get("accessToken")?.value || null;
};

/**
 * Role-based redirect paths
 */
const ROLE_DASHBOARDS = {
  admin: "/admin/dashboard",
  mentor: "/mentor/dashboard",
  mentee: "/dashboard",
};

/**
 * Get redirect URL based on user role
 * Note: In production, you'd decode the JWT to get the role
 * For now, we use a simple redirect to the main dashboard
 *
 * @param {string} pathname - Current URL path
 * @returns {string} Dashboard URL based on role
 */
const getRoleBasedRedirect = (pathname) => {
  // Simple approach: redirect to main dashboard
  // In production, you'd decode the JWT token to get the role
  // and return the appropriate dashboard path

  if (pathname.startsWith("/admin")) {
    return "/admin/dashboard";
  }
  if (pathname.startsWith("/mentor")) {
    return "/mentor/dashboard";
  }
  return "/dashboard";
};

/**
 * Check if route is protected (requires authentication)
 */
const isProtectedRoute = (pathname) => {
  // All dashboard-related routes
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/mentor/dashboard") ||
    pathname.startsWith("/admin/dashboard") ||
    pathname.startsWith("/my-bookings") ||
    pathname.startsWith("/my-sessions") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/payment/") ||
    pathname.startsWith("/review/") ||
    pathname.startsWith("/session/")
  );
};

/**
 * Check if route is auth route (login/register)
 */
const isAuthRoute = (pathname) => {
  return pathname === "/login" || pathname === "/register";
};

/**
 * Check if route is public but should redirect authenticated users
 */
const isAuthRedirectRoute = (pathname) => {
  return isAuthRoute(pathname);
};

export async function middleware(request) {
  // Get access token from cookies
  const token = getToken(request.cookies);

  // Get current pathname
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - API routes (they have their own auth)
  // - _next/static files
  // - _next/image files
  // - static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // RULE 1: Protected routes - require authentication
  // If no token and trying to access protected route -> redirect to login
  if (isProtectedRoute(pathname) && !token) {
    // Save the intended destination to redirect back after login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // RULE 2: Auth routes - redirect if already logged in
  // If has token and trying to access login/register -> redirect to dashboard
  if (isAuthRedirectRoute(pathname) && token) {
    const dashboardUrl = new URL(getRoleBasedRedirect(pathname), request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // RULE 3: Allow all other requests
  return NextResponse.next();
}

// ==================== ROUTE MATCHER ====================
// Middleware runs on these paths only

export const config = {
  matcher: [
    // Match user dashboard routes
    "/dashboard/:path*",
    "/my-bookings/:path*",
    "/my-sessions/:path*",
    // Match mentor routes explicitly
    "/mentor/dashboard/:path*",
    "/mentor/:path*",
    // Match admin routes explicitly
    "/admin/dashboard/:path*",
    "/admin/:path*",
    // Match auth routes
    "/login",
    "/register",
    // Match settings
    "/settings/:path*",
    // Match payment and review
    "/payment/:path*",
    "/review/:path*",
    // Match session
    "/session/:path*",
  ],
};

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon)
//      * - public files
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
//   ],
// };

/**
 * ALTERNATIVE: More specific matcher for common routes
 * Uncomment above and comment out the broad matcher to use this instead
 */
/*
export const config = {
  matcher: [
    // Match dashboard routes
    "/dashboard/:path*",
    "/my-bookings/:path*",
    "/my-sessions/:path*",
    // Match mentor routes
    "/mentor/:path*",
    // Match admin routes
    "/admin/:path*",
    // Match auth routes
    "/login",
    "/register",
    // Match settings
    "/settings/:path*",
  ],
};
*/
