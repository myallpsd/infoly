import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { apiErrorResponse, parseAndValidate, zodErrorResponse } from "@/lib/auth/route-helpers"
import { publicProfileTrackSchema } from "@/lib/auth/schemas"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { MessageOnlyResponse } from "@/lib/auth/types"

export async function POST(request: Request) {
  try {
    const input = await parseAndValidate(request, publicProfileTrackSchema)
    const response = await wikiApiRequest<MessageOnlyResponse>(
      `/wiki/public/${encodeURIComponent(input.username)}/track`,
      {
        method: "POST",
        body: {
          event_type: input.event_type,
          page_path: input.page_path,
          referrer: input.referrer || undefined,
          utm_source: input.utm_source || undefined,
          timestamp: input.timestamp || undefined,
          visitor_id: input.visitor_id || undefined,
        },
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
