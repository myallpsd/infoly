import { getAuthTokenFromCookie } from "@/lib/auth/cookies"
import { wikiApiRequest, WikiApiError } from "@/lib/auth/server-api"
import type { BioResponse, MeResponse, WikiUser } from "@/lib/auth/types"

export async function fetchCurrentUserServer(): Promise<WikiUser | null> {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return null
  }

  try {
    const response = await wikiApiRequest<MeResponse>("/wiki/me", {
      token,
    })

    return response.user
  } catch (error) {
    if (error instanceof WikiApiError && error.status === 401) {
      return null
    }

    throw error
  }
}

export async function fetchCurrentUserBioServer(): Promise<{ bioDetails: string }> {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return {
      bioDetails: "",
    }
  }

  try {
    const response = await wikiApiRequest<BioResponse>("/wiki/me/bio", {
      token,
    })

    return {
      bioDetails: response.bio_details ?? "",
    }
  } catch (error) {
    if (error instanceof WikiApiError && error.status === 401) {
      return {
        bioDetails: "",
      }
    }

    throw error
  }
}
