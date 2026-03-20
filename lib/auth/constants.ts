export const WIKI_AUTH_COOKIE_NAME = "wiki_auth_token"

const DEFAULT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function parseCookieMaxAge(rawValue: string | undefined): number {
  if (!rawValue) {
    return DEFAULT_COOKIE_MAX_AGE_SECONDS
  }

  const parsed = Number.parseInt(rawValue, 10)

  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_COOKIE_MAX_AGE_SECONDS
  }

  return parsed
}

export const WIKI_AUTH_COOKIE_MAX_AGE = parseCookieMaxAge(
  process.env.WIKI_AUTH_COOKIE_MAX_AGE
)

export function getWikiApiBaseUrl(): string {
  const baseUrl = process.env.WIKI_API_BASE_URL

  if (!baseUrl) {
    throw new Error("Missing required server env: WIKI_API_BASE_URL")
  }

  return baseUrl.replace(/\/$/, "")
}
