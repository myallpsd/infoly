import { getWikiApiBaseUrl } from "@/lib/auth/constants"
import { debugLog } from "@/lib/auth/debug"
import type { ApiErrorShape, BackendErrorResponse } from "@/lib/auth/types"
import { Agent } from "undici"

const API_PREFIX = "/api/v1"

type JsonBody = Record<string, unknown> | undefined
type RequestBody = JsonBody | FormData

type WikiRequestOptions = {
  method?: "GET" | "POST"
  token?: string
  body?: RequestBody
}

let insecureDevAgent: Agent | null = null

function shouldUseInsecureTlsForDev() {
  const wantsInsecureTls = process.env.WIKI_INSECURE_TLS === "true"

  return wantsInsecureTls
}

function getDevFetchDispatcher() {
  if (!shouldUseInsecureTlsForDev()) {
    return undefined
  }

  if (!insecureDevAgent) {
    insecureDevAgent = new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    })
  }

  return insecureDevAgent
}

export class WikiApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = "WikiApiError"
    this.status = status
    this.errors = errors
  }
}

export async function wikiApiRequest<T>(
  path: string,
  options: WikiRequestOptions = {}
): Promise<T> {
  const endpoint = `${getWikiApiBaseUrl()}${API_PREFIX}${path}`
  const { method = "GET", token, body } = options
  debugLog("wiki.request.outbound", {
    path,
    method,
    endpoint,
    has_token: Boolean(token),
    body,
  })

  const isFormDataBody = body instanceof FormData
  const dispatcher = getDevFetchDispatcher()

  const response = await fetch(endpoint, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
    },
    body: body ? (isFormDataBody ? body : JSON.stringify(body)) : undefined,
    cache: "no-store",
    ...(dispatcher ? { dispatcher } : {}),
  })

  const payload = await response.json().catch(() => null)
  debugLog("wiki.response.inbound", {
    path,
    method,
    status: response.status,
    ok: response.ok,
    payload,
  })

  if (!response.ok) {
    const errorPayload = (payload ?? {}) as Partial<BackendErrorResponse>

    throw new WikiApiError(
      response.status,
      errorPayload.message ?? "Request failed",
      errorPayload.errors
    )
  }

  return payload as T
}

export function mapApiError(error: unknown): {
  status: number
  body: ApiErrorShape
} {
  if (error instanceof WikiApiError) {
    return {
      status: error.status,
      body: {
        message: error.message,
        errors: error.errors,
      },
    }
  }

  return {
    status: 500,
    body: {
      message: "Unexpected server error",
    },
  }
}
