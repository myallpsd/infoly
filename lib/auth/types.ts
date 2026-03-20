export type BackendValidationErrors = Record<string, string[]>

export type BackendErrorResponse = {
  message: string
  errors?: BackendValidationErrors
}

export type WikiUser = {
  id?: number | string
  email: string
  username: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  address?: string | null
  birthday?: string | null
  interests?: string | null
  study?: string | null
  degree?: string | null
  website?: string | null
  photo?: string | null
  mission?: string | null
  profession?: string | null
  nationality?: string | null
  organization?: string | null
  is_blue_verified?: boolean | null
  social_links?:
    | Array<{
        provider: string
        url: string
      }>
    | null
  [key: string]: unknown
}

export type AuthSuccessResponse = {
  message: string
  token: string
  user: WikiUser
}

export type MessageOnlyResponse = {
  message: string
}

export type VerifyResetCodeResponse = {
  message: string
  verification_token: string
}

export type MeResponse = {
  message: string
  user: WikiUser
}

export type BioResponse = {
  message: string
  bio_details: string | null
}

export type PublicAnalyticsTimeseriesPoint = {
  date: string
  views: number
  clicks: number
}

export type PublicAnalyticsTopAction = {
  action: string
  clicks: number
}

export type PublicAnalyticsActivityItem = {
  title: string
  timestamp: string
  meta?: string | null
}

export type PublicProfileAnalyticsResponse = {
  message: string
  analytics: {
    range: "30d" | "7d" | "all"
    totals: {
      views: number
      unique_visitors: number
      clicks: number
      ctr: number
    }
    top_source: string | null
    timeseries: PublicAnalyticsTimeseriesPoint[]
    top_actions: PublicAnalyticsTopAction[]
    recent_activity: PublicAnalyticsActivityItem[]
  }
}

export type ApiErrorShape = {
  message: string
  errors?: BackendValidationErrors
}
