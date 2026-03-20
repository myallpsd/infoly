"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  HomeIcon,
  LockKeyholeIcon,
  NotebookTextIcon,
  UsersIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type SidebarNavProps = {
  onNavigate?: () => void
}

type SidebarChild = {
  title: string
  url?: string
}

type SidebarItem = {
  title: string
  url?: string
  icon: LucideIcon
  children?: SidebarChild[]
}

const navItems: SidebarItem[] = [
  { title: "Home", url: "/user", icon: HomeIcon },
  { title: "Profile", url: "/user/profile", icon: UsersIcon },
  { title: "Bio", url: "/user/profile/bio", icon: NotebookTextIcon },
  { title: "Change Password", url: "/user/change-password", icon: LockKeyholeIcon },
]

function isRouteActive(pathname: string, url?: string) {
  if (!url) return false
  return pathname === url || (url !== "/user" && pathname.startsWith(`${url}/`))
}

function getMostSpecificActiveUrl(pathname: string, items: SidebarItem[]) {
  const urls = items
    .flatMap((item) => [item.url, ...(item.children?.map((child) => child.url) ?? [])])
    .filter((value): value is string => Boolean(value))
    .filter((url) => isRouteActive(pathname, url))
    .sort((a, b) => b.length - a.length)

  return urls[0] ?? null
}

export function AppSidebar({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const activeUrl = useMemo(() => getMostSpecificActiveUrl(pathname, navItems), [pathname])

  const defaultOpenState = useMemo(() => {
    return navItems.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.title] = Boolean(item.children?.some((child) => isRouteActive(pathname, child.url)))
      return acc
    }, {})
  }, [pathname])

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(defaultOpenState)

  const toggleSection = (title: string) => {
    setOpenMap((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-[#e5e7eb] bg-white">
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          const isActive = item.url ? activeUrl === item.url : false
          const hasChildren = Boolean(item.children?.length)
          const isAnyChildActive = Boolean(item.children?.some((child) => child.url === activeUrl))
          const isOpen = Boolean(openMap[item.title]) || isAnyChildActive

          return (
            <div key={item.title}>
              {item.url ? (
                <Link
                  href={item.url}
                  onClick={onNavigate}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-[14px] text-[#1f2937]",
                    isActive
                      ? "bg-[#0000000d] font-bold"
                      : "text-[#27272a] hover:bg-[#ebedef]"
                  )}
                >
                  <item.icon className="size-[18px]" />
                  <span className="truncate">{item.title}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className={cn(
                    "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-[14px]",
                    isAnyChildActive || isOpen ? "bg-[#0000000d] text-[#111827]" : "text-[#27272a] hover:bg-[#ebedef]",
                    isAnyChildActive ? "font-bold" : "font-medium"
                  )}
                  onClick={hasChildren ? () => toggleSection(item.title) : undefined}
                >
                  <item.icon className="size-[18px]" />
                  <span className="truncate">{item.title}</span>
                  {hasChildren ? (
                    isOpen ? (
                      <ChevronDownIcon className="ml-auto size-4 text-[#6b7280]" />
                    ) : (
                      <ChevronRightIcon className="ml-auto size-4 text-[#6b7280]" />
                    )
                  ) : null}
                </button>
              )}

              {hasChildren && isOpen ? (
                <div className="mt-1 space-y-1 pl-9 pr-2">
                  {item.children?.map((child) => {
                    const isChildActive = child.url === activeUrl

                    if (child.url) {
                      return (
                        <Link
                          key={child.title}
                          href={child.url}
                          onClick={onNavigate}
                          className={cn(
                            "flex h-9 items-center rounded-lg px-3 text-[14px] text-[#3f3f46]",
                            isChildActive ? "bg-[#0000000d] font-bold text-[#18181b]" : "hover:bg-[#ebedef]"
                          )}
                        >
                          {child.title}
                        </Link>
                      )
                    }

                    return (
                      <button
                        key={child.title}
                        type="button"
                        className="flex h-9 w-full items-center rounded-lg px-3 text-left text-[14px] text-[#3f3f46] hover:bg-[#ebedef]"
                      >
                        {child.title}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
