import { auth } from "@/auth"
import { NextResponse } from "next/server"

const protectedRoutes: Record<string, string[]> = {
  "/admin": ["SUPER_ADMIN", "DIRECTOR", "HR"],
  "/dashboard": ["SUPER_ADMIN", "DIRECTOR", "HR", "OPERATIONS_MANAGER", "TEAM_LEAD", "DEVELOPER", "DESIGNER", "TESTER", "ACCOUNTS", "EMPLOYEE", "CLIENT"],
  "/hr": ["SUPER_ADMIN", "DIRECTOR", "HR"],
}

const publicRoutes = new Set(["/", "/features", "/security", "/about"])
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
  const isPublicRoute = publicRoutes.has(pathname)
  const isAuthRoute = pathname.startsWith("/api/auth") || pathname === "/login"

  if (isPublicRoute) {
    if (isLoggedIn && pathname === "/") return NextResponse.redirect(new URL("/dashboard", nextUrl))
    return NextResponse.next()
  }

  if (isAuthRoute) {
    if (isLoggedIn && pathname === "/login") return NextResponse.redirect(new URL("/dashboard", nextUrl))
    return NextResponse.next()
  }

  if (!isLoggedIn) return NextResponse.redirect(new URL("/", nextUrl))

  if (pathname.startsWith("/dashboard/client") && userRole !== "CLIENT") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  if (userRole === "CLIENT" && pathname.startsWith("/dashboard")) {
    const allowed = clientAllowedDashboardPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))
    if (!allowed) return NextResponse.redirect(new URL("/dashboard/client", nextUrl))
  }

  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route) && (!userRole || !allowedRoles.includes(userRole))) {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
