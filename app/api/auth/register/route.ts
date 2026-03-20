import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { setAuthTokenCookie } from "@/lib/auth/cookies"
import { debugLog } from "@/lib/auth/debug"
import { parseAndValidate, zodErrorResponse, apiErrorResponse } from "@/lib/auth/route-helpers"
import { registerSchema } from "@/lib/auth/schemas"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { AuthSuccessResponse } from "@/lib/auth/types"

export async function POST(request: Request) {
  try {
    const input = await parseAndValidate(request, registerSchema)
    debugLog("auth.register.request.received", { path: "/api/auth/register", payload: input })

    const response = await wikiApiRequest<AuthSuccessResponse>("/wiki/auth/register", {
      method: "POST",
      body: input,
    })

    await setAuthTokenCookie(response.token)
    debugLog("auth.register.success", {
      path: "/api/auth/register",
      user_id: response.user?.id,
      user_email: response.user?.email,
    })

    return NextResponse.json({
      message: response.message,
      user: response.user,
    })
  } catch (error) {
    debugLog("auth.register.error", {
      path: "/api/auth/register",
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { message: "Unknown error" },
    })

    if (error instanceof ZodError) {
      return zodErrorResponse(error)
    }

    return apiErrorResponse(error)
  }
}
