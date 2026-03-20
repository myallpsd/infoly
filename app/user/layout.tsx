import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"
import { requireAuthToken } from "@/lib/auth/session"

export default async function UserLayout({
  children,
}: {
  children: ReactNode
}) {
  await requireAuthToken()

  return <DashboardShell>{children}</DashboardShell>
}
