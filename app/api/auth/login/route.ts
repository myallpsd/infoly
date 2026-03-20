import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { setAuthTokenCookie } from "@/lib/auth/cookies"
import { debugLog } from "@/lib/auth/debug"
import { apiErrorResponse, parseAndValidate, zodErrorResponse } from "@/lib/auth/route-helpers"
import { loginSchema } from "@/lib/auth/schemas"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { AuthSuccessResponse } from "@/lib/auth/types"

export async function POST(request: Request) {
  try {
    const input = await parseAndValidate(request, loginSchema)
    debugLog("auth.login.request.received", { path: "/api/auth/login", payload: input })

    const response = await wikiApiRequest<AuthSuccessResponse>("/wiki/auth/login", {
      method: "POST",
      body: input,
    })

    await setAuthTokenCookie(response.token)
    debugLog("auth.login.success", {
      path: "/api/auth/login",
      user_id: response.user?.id,
      user_email: response.user?.email,
    })

    return NextResponse.json({
      message: response.message,
      user: response.user,
    })
  } catch (error) {
    debugLog("auth.login.error", {
      path: "/api/auth/login",
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
