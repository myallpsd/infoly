import { NextResponse } from "next/server"

import { getAuthTokenFromCookie } from "@/lib/auth/cookies"
import { apiErrorResponse } from "@/lib/auth/route-helpers"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { PublicProfileAnalyticsResponse } from "@/lib/auth/types"

const ALLOWED_RANGES = new Set(["30d", "7d", "all"] as const)

export async function GET(request: Request) {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rawRange = searchParams.get("range") ?? "30d"
  const range = ALLOWED_RANGES.has(rawRange as "30d" | "7d" | "all") ? rawRange : "30d"

  try {
    const response = await wikiApiRequest<PublicProfileAnalyticsResponse>(`/wiki/me/public-analytics?range=${encodeURIComponent(range)}`, {
      method: "GET",
      token,
    })

    return NextResponse.json(response)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
