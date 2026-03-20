"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import {
  HomeIcon,
  MenuIcon,
  UserIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type DashboardShellProps = {
  children: React.ReactNode
}

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const titleMap: Record<string, string> = {
  "/user": "Home",
  "/user/profile": "Profile",
  "/user/profile/bio": "Bio",
  "/user/profile/edit": "Edit Profile",
  "/user/change-password": "Change Password",
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const pageTitle = titleMap[pathname] ?? "Home"

  const onLogout = async () => {
    setIsLoggingOut(true)

    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.push("/login")
      router.refresh()
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={cn(plusJakarta.className, "min-h-svh bg-[#ececef] text-[#1f2937]")}>
      <header className="sticky top-0 z-40 h-[72px] border-b border-[#e4e4e7] bg-white">
        <div className="flex h-full items-center gap-6 px-4 lg:px-10">
          <div className="flex w-[260px] shrink-0 items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 lg:hidden">
                  <MenuIcon className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-r border-[#e4e4e7] bg-white p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <div className="h-[72px] border-b border-[#e4e4e7] px-5">
                  <Link href="/user" className="flex h-full items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                    <span className="flex size-8 items-center justify-center rounded-md bg-[#111827] text-[13px] font-bold text-white">I</span>
                    <div className="leading-none">
                      <p className="text-[28px] font-semibold tracking-[0.02em] text-[#16161f]">INFOLY</p>
                    </div>
                  </Link>
                </div>
                <div className="h-[calc(100svh-72px)]">
                  <AppSidebar onNavigate={() => setMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/user" className="hidden items-center gap-3 lg:flex">
              <span className="flex size-8 items-center justify-center rounded-md bg-[#111827] text-[13px] font-bold text-white">I</span>
              <p className="text-[31px] font-semibold leading-none tracking-[0.02em] text-[#16161f]">INFOLY</p>
            </Link>
          </div>

          <div className="mx-auto hidden w-full max-w-[560px] items-center lg:flex" />

          <div className="ml-auto flex items-center gap-2 lg:gap-3">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 rounded-full text-[#111827] hover:bg-[#ececef]">
                  <UserIcon className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-md border border-[#e4e4e7] bg-white p-1">
                <DropdownMenuLabel className="px-2 py-1.5 text-[12px] uppercase tracking-[0.08em] text-[#71717a]">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/user/profile" className="cursor-pointer rounded-lg px-2 py-2 text-[14px]">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer rounded-lg px-2 py-2 text-[14px]"
                >
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100svh-72px)] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="sticky top-[72px] hidden h-[calc(100svh-72px)] lg:block">
          <AppSidebar />
        </aside>

        <section className="min-w-0 border-l border-[#e5e7eb] bg-[#ececef]">
          <div className="bg-[#ececef] px-8 pt-7 pb-4">
            <div className="flex items-center gap-3 text-[14px] text-[#52525b]">
              <h1 className="text-[20px] font-semibold leading-none text-[#18181b]">{pageTitle}</h1>
              <span className="h-6 w-px bg-[#d4d4d8]" />
              <HomeIcon className="size-4" />
              <span>- {pageTitle}</span>
            </div>
          </div>

          <div className="p-6 pt-3 md:p-8 md:pt-4">
            <div className="min-h-[calc(100svh-72px-92px-64px)] rounded-md ">
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
