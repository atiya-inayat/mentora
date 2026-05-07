import { NextResponse } from "next/server";

// Middleware runs before user reaches the page
export async function middleware(request) {
  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // Get current URL pathname
  // Example: "/dashboard/settings"
  const pathname = request.nextUrl.pathname;

  // Protected routes (need login)
  const protectedRoutes = ["/dashboard", "/mentor/dashboard", "/admin"];

  // Authentication pages
  const authRoutes = ["/login", "/register"];

  // Check if current route is protected
  // .some() means:
  // "Does ANY route match?"
  const isProtected = protectedRoutes.some((route) => {
    // startsWith checks:
    // Does pathname begin with this route?
    return pathname.startsWith(route);
  });

  // Check if current route is login/register
  const isAuthRoute = authRoutes.some((route) => {
    return pathname.startsWith(route);
  });

  // If route is protected
  // and user is NOT logged in
  if (isProtected && !token) {
    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is already logged in
  // and tries to open login/register
  if (isAuthRoute && token) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Everything is okay
  // Continue request normally
  return NextResponse.next();
}

// Middleware only runs on these routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/mentor/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
