"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ActivityIcon, MousePointerClickIcon, TrendingUpIcon, UsersIcon, ViewIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { parseApiResponse } from "@/lib/auth/client-errors"
import type { PublicProfileAnalyticsResponse } from "@/lib/auth/types"

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatPercent(value: number) {
  return `${Number(value || 0).toFixed(2)}%`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
}

type KpiCardProps = {
  title: string
  value: string
  icon: React.ReactNode
}

function KpiCard({ title, value, icon }: KpiCardProps) {
  return (
    <Card className="border-[#d6d9de] bg-white shadow-none">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7280]">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
        </div>
        <div className="rounded-md bg-[#f4f5f7] p-2 text-[#4b5563]">{icon}</div>
      </CardContent>
    </Card>
  )
}

type PublicAnalyticsOverviewProps = {
  username: string
}

export function PublicAnalyticsOverview({ username }: PublicAnalyticsOverviewProps) {
  const [data, setData] = useState<PublicProfileAnalyticsResponse["analytics"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const normalizedUsername = username.trim()
  const hasPublicProfileUrl = normalizedUsername.length > 0
  const publicProfilePath = hasPublicProfileUrl ? `/wiki/${encodeURIComponent(normalizedUsername)}` : ""
  const publicProfileUrlPreview = hasPublicProfileUrl
    ? `http://localhost:3000/wiki/${normalizedUsername}`
    : "--"

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/analytics/public-profile?range=30d", {
          method: "GET",
          cache: "no-store",
        })
        const payload = await parseApiResponse<PublicProfileAnalyticsResponse>(response)
        setData(payload.analytics)
      } catch (nextError) {
        const apiError = nextError as Error & { status?: number }
        setError(apiError.status ? `HTTP ${apiError.status}: ${apiError.message}` : apiError.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const hasAnyData = useMemo(() => {
    if (!data) return false
    return (
      data.totals.views > 0 ||
      data.totals.unique_visitors > 0 ||
      data.totals.clicks > 0 ||
      data.timeseries.length > 0 ||
      data.top_actions.length > 0
    )
  }, [data])

  if (loading) {
    return (
      <Card className="border-[#d6d9de] bg-white shadow-none">
        <CardContent className="p-6 text-sm text-[#6b7280]">Loading analytics...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-[#d6d9de] bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-[18px] text-[#111827]">Public profile analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[#374151]">
          <p>{error}</p>
          <p>Backend analytics endpoint is required for live numbers.</p>
          <p>
            Public profile:
            {" "}
            {hasPublicProfileUrl ? (
              <Link href={publicProfilePath} target="_blank" rel="noreferrer" className="font-medium underline">
                {publicProfileUrlPreview}
              </Link>
            ) : (
              "--"
            )}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !hasAnyData) {
    return (
      <Card className="border-[#d6d9de] bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-[18px] text-[#111827]">Public profile analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[#374151]">
          <p>No analytics data yet for the last 30 days.</p>
          <p>Username: {hasPublicProfileUrl ? `@${normalizedUsername}` : "--"}</p>
          <p>
            Share your public profile link to start collecting stats:
            {" "}
            {hasPublicProfileUrl ? (
              <Link href={publicProfilePath} target="_blank" rel="noreferrer" className="font-medium underline">
                {publicProfileUrlPreview}
              </Link>
            ) : (
              "--"
            )}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-[#111827]">Public profile analytics</h1>
          <p className="text-sm text-[#6b7280]">Important performance metrics for your public profile.</p>
          <p className="mt-2 text-sm text-[#4b5563]">Username: {hasPublicProfileUrl ? `@${normalizedUsername}` : "--"}</p>
          <p className="text-sm text-[#4b5563]">
            Public URL:
            {" "}
            {hasPublicProfileUrl ? (
              <Link href={publicProfilePath} target="_blank" rel="noreferrer" className="font-medium underline">
                {publicProfileUrlPreview}
              </Link>
            ) : (
              "--"
            )}
          </p>
        </div>
        <span className="rounded-md border border-[#d6d9de] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#4b5563]">
          Last 30 days
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Public Profile Views" value={formatNumber(data.totals.views)} icon={<ViewIcon className="size-5" />} />
        <KpiCard title="Unique Visitors" value={formatNumber(data.totals.unique_visitors)} icon={<UsersIcon className="size-5" />} />
        <KpiCard title="Profile Clicks" value={formatNumber(data.totals.clicks)} icon={<MousePointerClickIcon className="size-5" />} />
        <KpiCard title="CTR (%)" value={formatPercent(data.totals.ctr)} icon={<TrendingUpIcon className="size-5" />} />
        <KpiCard title="Top Source" value={data.top_source || "--"} icon={<ActivityIcon className="size-5" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-[#d6d9de] bg-white shadow-none xl:col-span-2">
          <CardHeader className="border-b border-[#eceef2] pb-4">
            <CardTitle className="text-[16px] text-[#111827]">30-day trend</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 border-b border-[#eceef2] bg-[#f8f9fb] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
              <span>Date</span>
              <span>Views</span>
              <span>Clicks</span>
            </div>
            <div className="max-h-[340px] overflow-auto">
              {data.timeseries.length ? (
                data.timeseries.map((point) => (
                  <div key={point.date} className="grid grid-cols-3 border-b border-[#f1f2f4] px-4 py-2 text-sm text-[#374151]">
                    <span>{formatDate(point.date)}</span>
                    <span>{formatNumber(point.views)}</span>
                    <span>{formatNumber(point.clicks)}</span>
                  </div>
                ))
              ) : (
                <p className="px-4 py-4 text-sm text-[#6b7280]">No trend data available.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#d6d9de] bg-white shadow-none">
          <CardHeader className="border-b border-[#eceef2] pb-4">
            <CardTitle className="text-[16px] text-[#111827]">Top clicked actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {data.top_actions.length ? (
              data.top_actions.map((item) => (
                <div key={item.action} className="flex items-center justify-between rounded-md border border-[#eceef2] bg-[#fafbfc] px-3 py-2 text-sm">
                  <span className="text-[#374151]">{item.action}</span>
                  <span className="font-semibold text-[#111827]">{formatNumber(item.clicks)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6b7280]">No action click data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#d6d9de] bg-white shadow-none">
        <CardHeader className="border-b border-[#eceef2] pb-4">
          <CardTitle className="text-[16px] text-[#111827]">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {data.recent_activity.length ? (
            <div className="space-y-2">
              {data.recent_activity.map((item, index) => (
                <div key={`${item.timestamp}-${index}`} className="rounded-md border border-[#eceef2] bg-[#fafbfc] px-3 py-2 text-sm">
                  <p className="font-medium text-[#111827]">{item.title}</p>
                  <p className="text-[#6b7280]">{item.meta || formatDate(item.timestamp)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#6b7280]">No recent activity available.</p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
