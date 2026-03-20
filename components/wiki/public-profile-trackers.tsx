"use client"

import { useEffect, useMemo, useRef } from "react"

import { cn } from "@/lib/utils"

type PublicProfileEventType = "profile_view" | "website_click" | "phone_click" | "contact_click"

type TrackPayload = {
  username: string
  event_type: PublicProfileEventType
  page_path: string
  referrer?: string
  utm_source?: string
  timestamp?: string
  visitor_id?: string
}

function normalizeValue(value: string | null | undefined) {
  const text = String(value ?? "").trim()
  return text.length ? text : ""
}

const VISITOR_ID_COOKIE = "visitor_id"
const VISITOR_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

function getCookieValue(name: string) {
  if (typeof document === "undefined") return ""
  const encodedName = encodeURIComponent(name)
  const cookies = document.cookie ? document.cookie.split("; ") : []

  for (const part of cookies) {
    const index = part.indexOf("=")
    if (index === -1) continue
    const key = part.slice(0, index)
    if (key !== encodedName) continue
    return decodeURIComponent(part.slice(index + 1))
  }

  return ""
}

function createVisitorId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `v_${crypto.randomUUID().replace(/-/g, "")}`
  }

  const random = Math.random().toString(36).slice(2, 12)
  return `v_${Date.now().toString(36)}${random}`
}

function ensureVisitorId() {
  const current = normalizeValue(getCookieValue(VISITOR_ID_COOKIE))
  if (current) return current
  if (typeof document === "undefined") return ""

  const generated = createVisitorId()

  try {
    document.cookie = [
      `${encodeURIComponent(VISITOR_ID_COOKIE)}=${encodeURIComponent(generated)}`,
      "Path=/",
      `Max-Age=${VISITOR_ID_MAX_AGE_SECONDS}`,
      "SameSite=Lax",
    ].join("; ")

    const saved = normalizeValue(getCookieValue(VISITOR_ID_COOKIE))
    return saved || ""
  } catch {
    return ""
  }
}

function sendTrackingPayload(payload: TrackPayload) {
  const body = JSON.stringify(payload)
  const endpoint = "/api/analytics/public-profile/track"

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const sent = navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }))
    if (sent) return
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    cache: "no-store",
  }).catch(() => undefined)
}

function usePublicProfileTracker(username: string) {
  const normalizedUsername = normalizeValue(username)

  return useMemo(() => {
    return (eventType: PublicProfileEventType) => {
      if (!normalizedUsername || typeof window === "undefined") return

      const searchParams = new URLSearchParams(window.location.search)
      const utmSource = normalizeValue(searchParams.get("utm_source"))
      const referrer = normalizeValue(document.referrer)
      const pagePath = `${window.location.pathname}${window.location.search}`
      const visitorId = ensureVisitorId()

      sendTrackingPayload({
        username: normalizedUsername,
        event_type: eventType,
        page_path: pagePath || "/",
        referrer: referrer || undefined,
        utm_source: utmSource || undefined,
        timestamp: new Date().toISOString(),
        visitor_id: visitorId || undefined,
      })
    }
  }, [normalizedUsername])
}

type PublicProfileViewTrackerProps = {
  username: string
}

export function PublicProfileViewTracker({ username }: PublicProfileViewTrackerProps) {
  const track = usePublicProfileTracker(username)
  const sentRef = useRef(false)

  useEffect(() => {
    if (sentRef.current) return
    track("profile_view")
    sentRef.current = true
  }, [track])

  return null
}

type PublicProfileActionLinkProps = {
  username: string
  href: string
  eventType: Exclude<PublicProfileEventType, "profile_view">
  className?: string
  children: React.ReactNode
  target?: string
  rel?: string
}

export function PublicProfileActionLink({
  username,
  href,
  eventType,
  className,
  children,
  target,
  rel,
}: PublicProfileActionLinkProps) {
  const track = usePublicProfileTracker(username)

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={() => track(eventType)}
      className={cn(className)}
    >
      {children}
    </a>
  )
}
