import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { apiErrorResponse, parseAndValidate, zodErrorResponse } from "@/lib/auth/route-helpers"
import { verifyResetCodeSchema } from "@/lib/auth/schemas"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { VerifyResetCodeResponse } from "@/lib/auth/types"

export async function POST(request: Request) {
  try {
    const input = await parseAndValidate(request, verifyResetCodeSchema)
    const response = await wikiApiRequest<VerifyResetCodeResponse>("/wiki/auth/verify-reset-code", {
      method: "POST",
      body: input,
    })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error)
    }

    return apiErrorResponse(error)
  }
}
