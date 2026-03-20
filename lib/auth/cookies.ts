import { cookies } from "next/headers"

import {
  WIKI_AUTH_COOKIE_MAX_AGE,
  WIKI_AUTH_COOKIE_NAME,
} from "@/lib/auth/constants"

const sharedCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
}

export async function getAuthTokenFromCookie() {
  const cookieStore = await cookies()
  return cookieStore.get(WIKI_AUTH_COOKIE_NAME)?.value ?? null
}

export async function setAuthTokenCookie(token: string) {
  const cookieStore = await cookies()

  cookieStore.set(WIKI_AUTH_COOKIE_NAME, token, {
    ...sharedCookieOptions,
    maxAge: WIKI_AUTH_COOKIE_MAX_AGE,
  })
}

export async function clearAuthTokenCookie() {
  const cookieStore = await cookies()

  cookieStore.set(WIKI_AUTH_COOKIE_NAME, "", {
    ...sharedCookieOptions,
    maxAge: 0,
  })
}
