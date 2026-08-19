import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Define protected routes and required roles
const protectedRoutes: Record<string, string[]> = {
  "/admin": ["SUPER_ADMIN", "DIRECTOR", "HR"],
  "/dashboard": ["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER", "TEAM_LEAD", "DEVELOPER", "DESIGNER", "TESTER", "ACCOUNTS", "EMPLOYEE", "CLIENT"],
  "/hr": ["SUPER_ADMIN", "DIRECTOR", "HR"],
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isPublicRoute = nextUrl.pathname === "/"
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname === "/login"
  
  if (isAuthRoute || isPublicRoute) {
    if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/")) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    if (isPublicRoute && !isLoggedIn) {
      return // Allow access to public landing page
    }
    if (isAuthRoute) return
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Check RBAC
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (nextUrl.pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
