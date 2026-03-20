import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeftIcon, MailIcon, ShieldCheckIcon, UserCircle2Icon } from "lucide-react"

import { ProfileUpdateForm } from "@/components/profile/profile-update-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCurrentUserServer } from "@/lib/auth/profile"

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) return "-"
  const text = String(value).trim()
  return text.length ? text : "-"
}

function makeFullName(firstName: unknown, lastName: unknown) {
  const first = String(firstName ?? "").trim()
  const last = String(lastName ?? "").trim()
  const full = `${first} ${last}`.trim()
  return full || "Unnamed User"
}

function makeInitials(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean)
  if (!parts.length) return "U"
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase()
}

function resolvePhotoUrl(rawPhoto: unknown) {
  const text = String(rawPhoto ?? "").trim()
  if (!text) return ""

  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("/")) {
    return text
  }

  return ""
}

export default async function EditProfilePage() {
  const user = await fetchCurrentUserServer()

  if (!user) {
    redirect("/login?invalidated=1")
  }

  const fullName = makeFullName(user.first_name, user.last_name)
  const initials = makeInitials(fullName)
  const photoUrl = resolvePhotoUrl(user.photo)
  const username = normalizeValue(user.username)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="space-y-2">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">Update your profile</h1>
          <Button asChild variant="outline" className="h-9 rounded-md border-[#d6d9de] bg-white px-3 text-[14px]">
            <Link href="/user/profile">
              <ArrowLeftIcon className="size-4" />
              Back to profile
            </Link>
          </Button>
        </div>
        <p className="max-w-3xl text-[14px] text-[#4b5563]">
          Keep your account details accurate for better security, identity verification, and profile consistency.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card className="border-[#d6d9de] bg-white shadow-none">
            <CardHeader className="border-b border-[#eceef2] pb-4">
              <CardTitle className="text-[16px] font-semibold text-[#111827]">Current account snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-14 border border-[#d6d9de] bg-[#f2f4f7] text-[#111827]" size="lg">
                  {photoUrl ? <AvatarImage src={photoUrl} alt={fullName} /> : null}
                  <AvatarFallback className="bg-[#e9edf2] text-[16px] font-bold text-[#111827]">{initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-[17px] font-semibold text-[#111827]">{fullName}</p>
                  <p className="text-[13px] text-[#4b5563]">{username === "-" ? "-" : `@${username}`}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-md border border-[#eceef2] bg-[#f8f9fb] p-3">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">Email</p>
                <p className="inline-flex items-center gap-2 text-[14px] font-medium text-[#111827] break-all">
                  <MailIcon className="size-4 text-[#6b7280]" />
                  {normalizeValue(user.email)}
                </p>
              </div>

              <div className="rounded-md border border-[#eceef2] bg-[#f8f9fb] p-3">
                <p className="inline-flex items-center gap-2 text-[13px] font-medium text-[#374151]">
                  <ShieldCheckIcon className="size-4 text-[#4b5563]" />
                  Changes are validated and saved securely.
                </p>
              </div>

              <div className="rounded-md border border-[#eceef2] bg-white p-3 text-[13px] text-[#4b5563]">
                <p className="inline-flex items-center gap-2 font-medium text-[#374151]">
                  <UserCircle2Icon className="size-4" />
                  Profile completion
                </p>
                <p className="mt-1">Update core identity and contact fields first, then use advanced options as needed.</p>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0">
          <ProfileUpdateForm user={user} />
        </section>
      </div>
    </main>
  )
}
