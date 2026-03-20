import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { apiErrorResponse, parseAndValidate, zodErrorResponse } from "@/lib/auth/route-helpers"
import { forgotPasswordSchema } from "@/lib/auth/schemas"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { MessageOnlyResponse } from "@/lib/auth/types"

export async function POST(request: Request) {
  try {
    const input = await parseAndValidate(request, forgotPasswordSchema)
    const response = await wikiApiRequest<MessageOnlyResponse>(
      "/wiki/auth/forgot-password",
      {
        method: "POST",
        body: input,
      }
    )

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error)
    }

    return apiErrorResponse(error)
  }
}
