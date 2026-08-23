import { auth } from "@/auth"
import { NextResponse } from "next/server"

const protectedRoutes: Record<string, string[]> = {
  "/admin": ["SUPER_ADMIN", "DIRECTOR", "HR"],
  "/dashboard": ["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER", "TEAM_LEAD", "DEVELOPER", "DESIGNER", "TESTER", "ACCOUNTS", "EMPLOYEE", "CLIENT"],
  "/hr": ["SUPER_ADMIN", "DIRECTOR", "HR"],
}

const clientAllowedDashboardPaths = [
  "/dashboard",
  "/dashboard/client",
  "/dashboard/profile",
  "/dashboard/notifications",
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role
  const pathname = nextUrl.pathname

  const isPublicRoute = pathname === "/"
  const isAuthRoute = pathname.startsWith("/api/auth") || pathname === "/login"

  if (isAuthRoute || isPublicRoute) {
    if (isLoggedIn && (pathname === "/login" || pathname === "/")) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    if (isPublicRoute && !isLoggedIn) return
    if (isAuthRoute) return
  }

  if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl))

  if (pathname.startsWith("/dashboard/client") && userRole !== "CLIENT") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  if (userRole === "CLIENT" && pathname.startsWith("/dashboard")) {
    const allowed = clientAllowedDashboardPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
    if (!allowed) return NextResponse.redirect(new URL("/dashboard/client", nextUrl))
  }

  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
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
