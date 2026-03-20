import { redirect } from "next/navigation"

import { PublicAnalyticsOverview } from "@/components/user/public-analytics-overview"
import { fetchCurrentUserServer } from "@/lib/auth/profile"

export default async function UserDashboardPage() {
  const user = await fetchCurrentUserServer()

  if (!user) {
    redirect("/login?invalidated=1")
  }

  return <PublicAnalyticsOverview username={user.username ?? ""} />
}
