import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { getAuthTokenFromCookie } from "@/lib/auth/cookies"
import { apiErrorResponse, parseAndValidate, zodErrorResponse } from "@/lib/auth/route-helpers"
import { updateProfileSchema } from "@/lib/auth/schemas"
import { wikiApiRequest } from "@/lib/auth/server-api"
import type { MeResponse } from "@/lib/auth/types"

const ALLOWED_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "username",
  "phone",
  "city",
  "state",
  "country",
  "address",
  "birthday",
  "interests",
  "study",
  "degree",
  "website",
  "photo",
  "mission",
  "profession",
  "nationality",
  "organization",
  "social_links",
] as const

export async function POST(request: Request) {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const contentType = request.headers.get("content-type") ?? ""
    let payload: Record<string, unknown> | FormData

    if (contentType.includes("multipart/form-data")) {
      const incomingForm = await request.formData()
      const outgoingForm = new FormData()
      const stringInput: Record<string, unknown> = {}

      for (const field of ALLOWED_FIELDS) {
        const value = incomingForm.get(field)

        if (value === null || value === undefined) {
          continue
        }

        if (field === "photo" && value instanceof File) {
          if (value.size > 0) {
            outgoingForm.append(field, value)
          }
          continue
        }

        if (typeof value === "string") {
          if (field === "social_links") {
            try {
              stringInput[field] = JSON.parse(value)
            } catch {
              stringInput[field] = value
            }
          } else {
            stringInput[field] = value
          }
        }
      }

      const validated = updateProfileSchema.omit({ photo: true }).parse(stringInput)

      for (const [key, value] of Object.entries(validated)) {
        if (value !== undefined) {
          if (key === "social_links" && Array.isArray(value)) {
            outgoingForm.append(key, JSON.stringify(value))
          } else {
            outgoingForm.append(key, String(value))
          }
        }
      }

      payload = outgoingForm
    } else {
      const input = await parseAndValidate(request, updateProfileSchema)

      payload = Object.fromEntries(
        Object.entries(input).filter(([key, value]) => {
          return ALLOWED_FIELDS.includes(key as (typeof ALLOWED_FIELDS)[number]) && value !== undefined
        })
      )
    }

    const response = await wikiApiRequest<MeResponse>("/wiki/me/update", {
      method: "POST",
      token,
      body: payload,
    })

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error)
    }

    return apiErrorResponse(error)
  }
}
