import { redirect } from "next/navigation"

import { getAuthTokenFromCookie } from "@/lib/auth/cookies"

export async function requireAuthToken() {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    redirect("/login")
  }

  return token
}

export async function getAuthToken() {
  return getAuthTokenFromCookie()
}
