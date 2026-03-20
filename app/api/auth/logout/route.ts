import { NextResponse } from "next/server"

import { clearAuthTokenCookie } from "@/lib/auth/cookies"

export async function POST() {
  await clearAuthTokenCookie()

  return NextResponse.json({ message: "Logged out successfully" })
}
