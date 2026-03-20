type DebugMeta = Record<string, unknown>

const SENSITIVE_KEYS = new Set([
  "password",
  "password_confirmation",
  "current_password",
  "new_password",
  "new_password_confirmation",
  "token",
  "authorization",
])

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry))
  }

  if (!isObject(value)) {
    return value
  }

  const redacted: Record<string, unknown> = {}

  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      redacted[key] = "[REDACTED]"
      continue
    }

    redacted[key] = redactValue(entry)
  }

  return redacted
}

function shouldLog() {
  return process.env.NODE_ENV !== "production" || process.env.WIKI_DEBUG_LOGS === "true"
}

export function debugLog(event: string, meta: DebugMeta = {}) {
  if (!shouldLog()) {
    return
  }

  const safeMeta = redactValue(meta)
  console.info("[wiki-bff]", event, safeMeta)
}

