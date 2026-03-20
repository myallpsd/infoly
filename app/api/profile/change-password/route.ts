import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { clearAuthTokenCookie, getAuthTokenFromCookie } from "@/lib/auth/cookies"
import { apiErrorResponse, parseAndValidate, zodErrorResponse } from "@/lib/auth/route-helpers"
import { changePasswordSchema } from "@/lib/auth/schemas"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { MessageOnlyResponse } from "@/lib/auth/types"

export async function POST(request: Request) {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const input = await parseAndValidate(request, changePasswordSchema)
    const response = await wikiApiRequest<MessageOnlyResponse>(
      "/wiki/me/change-password",
      {
        method: "POST",
        token,
        body: input,
      }
    )

    await clearAuthTokenCookie()

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error)
    }

    return apiErrorResponse(error)
  }
}
