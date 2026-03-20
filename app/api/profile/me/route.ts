import { NextResponse } from "next/server"

import { getAuthTokenFromCookie } from "@/lib/auth/cookies"
import { apiErrorResponse } from "@/lib/auth/route-helpers"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { MeResponse } from "@/lib/auth/types"

export async function GET() {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const response = await wikiApiRequest<MeResponse>("/wiki/me", {
      token,
    })

    return NextResponse.json(response)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
