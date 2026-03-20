import { NextResponse } from "next/server"
import { z, ZodError } from "zod"

import { debugLog } from "@/lib/auth/debug"
import { mapApiError } from "@/lib/auth/server-api"

export async function parseAndValidate<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema
): Promise<z.infer<TSchema>> {
  const json = await request.json().catch(() => {
    throw new ZodError([
      {
        code: "custom",
        path: [],
        message: "Invalid JSON body",
      },
    ])
  })

  return schema.parse(json)
}

export function zodErrorResponse(error: ZodError) {
  const flattened = error.flatten().fieldErrors
  return NextResponse.json(
    {
      message: "Validation failed",
      errors: flattened,
    },
    { status: 422 }
  )
}

export function apiErrorResponse(error: unknown) {
  const mapped = mapApiError(error)

  debugLog("api.error.response", {
    status: mapped.status,
    body: mapped.body,
    source_error:
      error instanceof Error
        ? { name: error.name, message: error.message }
        : { message: "Unknown error" },
  })

  return NextResponse.json(mapped.body, { status: mapped.status })
}
