import { NextResponse } from "next/server"

import { apiErrorResponse } from "@/lib/auth/route-helpers"
import { wikiApiRequest } from "@/lib/auth/server-api"

type PublicWikiProfileResponse = {
  message: string
  user: {
    username: string
    first_name: string | null
    last_name: string | null
    display_name: string
    full_name?: string | null
    photo: string | null
    avatar_url?: string | null
    bio_details: string | null
    email: string | null
    phone: string | null
    city: string | null
    state: string | null
    country: string | null
    location_text?: string | null
    address: string | null
    birthday: string | null
    website: string | null
    interests: string | null
    study: string | null
    degree: string | null
    mission: string | null
    profession: string | null
    nationality: string | null
    organization: string | null
    social_links:
      | Array<{
          provider: string
          url: string
        }>
      | null
    is_blue_verified: boolean | null
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params
    const response = await wikiApiRequest<PublicWikiProfileResponse>(
      `/wiki/public/${encodeURIComponent(username)}`,
      { method: "GET" }
    )

    return NextResponse.json(response)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
