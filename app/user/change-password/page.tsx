import Link from "next/link"
import { ArrowLeftIcon, CheckIcon, ShieldAlertIcon, ShieldCheckIcon } from "lucide-react"

import { ChangePasswordForm } from "@/components/profile/change-password-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ChangePasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <header className="space-y-3 rounded-md border border-[#dce0e6] bg-[#f7f8fa] p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Account Security</p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-[30px] leading-none font-semibold tracking-tight text-[#111827]">Change password</h1>
            <p className="max-w-3xl text-[14px] leading-relaxed text-[#4b5563]">
              Use a unique, strong password to reduce account risk. For security, you’ll be signed out immediately after update.
            </p>
          </div>
          <Button asChild variant="outline" className="h-9 rounded-md border-[#d6d9de] bg-white px-3 text-[13px] font-semibold">
            <Link href="/user/profile">
              <ArrowLeftIcon className="size-4" />
              Back to profile
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card className="border-[#d6d9de] bg-white shadow-none">
            <CardHeader className="border-b border-[#eceef2] pb-4">
              <CardTitle className="text-[17px] font-semibold text-[#111827]">Password safety tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="rounded-md border border-[#eceef2] bg-[#f8f9fb] p-3">
                <p className="inline-flex items-start gap-2 text-[13px] font-medium text-[#334155]">
                  <ShieldAlertIcon className="mt-0.5 size-4 shrink-0 text-[#64748b]" />
                  Set a password that’s hard to guess and easy for only you to remember.
                </p>
              </div>

              <ul className="space-y-3 text-[13px] text-[#4b5563]">
                <li className="inline-flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#64748b]" />
                  Use 8+ characters with a mix of letters, numbers, and symbols.
                </li>
                <li className="inline-flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#64748b]" />
                  Avoid reusing passwords from other apps or websites.
                </li>
                <li className="inline-flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-[#64748b]" />
                  Sign in again only on trusted devices after the update.
                </li>
              </ul>

              <div className="rounded-md border border-[#eceef2] p-3">
                <p className="inline-flex items-center gap-2 text-[13px] font-medium text-[#374151]">
                  <ShieldCheckIcon className="size-4 text-[#4b5563]" />
                  Security event
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">
                  This change invalidates your current session token and requires a fresh login.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0">
          <ChangePasswordForm />
        </section>
      </div>
    </main>
  )
}
