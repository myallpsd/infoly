import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { WIKI_AUTH_COOKIE_NAME } from "@/lib/auth/constants"

const protectedPrefixes = ["/user"]
const authPages = ["/login", "/signup", "/forgot-password", "/reset-password"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(WIKI_AUTH_COOKIE_NAME)?.value
  const invalidated = request.nextUrl.searchParams.get("invalidated") === "1"

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const redirectedPath = pathname.replace("/dashboard", "/user")
    const url = new URL(`${redirectedPath}${request.nextUrl.search}`, request.url)
    return NextResponse.redirect(url)
  }

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (authPages.some((page) => pathname.startsWith(page)) && token && !invalidated) {
    return NextResponse.redirect(new URL("/user", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/user/:path*", "/login", "/signup", "/forgot-password", "/reset-password"],
}
