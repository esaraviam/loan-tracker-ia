import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/loans"]

// Routes that should redirect to dashboard if authenticated
const authRoutes = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get("auth-token")?.value

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Validate auth token
  let hasValidToken = false
  if (authToken) {
    try {
      // Only check if token can be decoded (actual validation happens in API routes)
      jwt.decode(authToken)
      hasValidToken = true
    } catch {
      hasValidToken = false
    }
  }

  // Redirect authenticated users from home to dashboard
  if (pathname === "/" && hasValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect logic
  if (isProtectedRoute && !hasValidToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && hasValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|ico|svg|webp)).*)",
  ],
}