import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthTokenFromCookie } from "@/lib/auth/cookies"
import { apiErrorResponse, parseAndValidate, zodErrorResponse } from "@/lib/auth/route-helpers"
import { bioSchema } from "@/lib/auth/schemas"
import { WikiApiError, wikiApiRequest } from "@/lib/auth/server-api"
import type { BioResponse } from "@/lib/auth/types"

type BioBackendResponse = {
  message: string
  bio_details?: string | null
}

function normalizeBioResponse(response: BioBackendResponse): BioResponse {
  return {
    message: response.message,
    bio_details: response.bio_details ?? "",
  }
}

export async function GET() {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const response = await wikiApiRequest<BioBackendResponse>("/wiki/me/bio", {
      token,
    })

    return NextResponse.json(normalizeBioResponse(response))
  } catch (error) {
    return apiErrorResponse(error)
  }
}

export async function POST(request: Request) {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const input = await parseAndValidate(request, bioSchema)

    let response: BioBackendResponse
    const bioDetails = input.bio_details ?? ""

    try {
      response = await wikiApiRequest<BioBackendResponse>("/wiki/me/bio", {
        method: "POST",
        token,
        body: {
          bio_details: bioDetails,
        },
      })
    } catch (error) {
      const isFormatMismatch =
        error instanceof WikiApiError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 401 &&
        error.status !== 403

      if (!isFormatMismatch) {
        throw error
      }

      const formData = new FormData()
      formData.append("bio_details", bioDetails)

      response = await wikiApiRequest<BioBackendResponse>("/wiki/me/bio", {
        method: "POST",
        token,
        body: formData,
      })
    }

    return NextResponse.json(normalizeBioResponse(response))
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error)
    }

    return apiErrorResponse(error)
  }
}
