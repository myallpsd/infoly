import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeftIcon, FileTextIcon } from "lucide-react"

import { ProfileBioForm } from "@/components/profile/profile-bio-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCurrentUserBioServer, fetchCurrentUserServer } from "@/lib/auth/profile"

function makeFullName(firstName: unknown, lastName: unknown) {
  const first = String(firstName ?? "").trim()
  const last = String(lastName ?? "").trim()
  const full = `${first} ${last}`.trim()
  return full || "Unnamed User"
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) return "-"
  const text = String(value).trim()
  return text.length ? text : "-"
}

export default async function ProfileBioPage() {
  const user = await fetchCurrentUserServer()

  if (!user) {
    redirect("/login?invalidated=1")
  }

  const { bioDetails } = await fetchCurrentUserBioServer()
  const fullName = makeFullName(user.first_name, user.last_name)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#111827]">Update your bio</h1>
          <Button asChild variant="outline" className="h-9 rounded-md border-[#d6d9de] bg-white px-3 text-[14px]">
            <Link href="/user/profile">
              <ArrowLeftIcon className="size-4" />
              Back to profile
            </Link>
          </Button>
        </div>
        <p className="max-w-3xl text-[14px] text-[#4b5563]">
          Maintain a clear, up-to-date bio so your profile has consistent context across the platform.
        </p>
      </header>

      <section>
        <Card className="border-[#d6d9de] bg-white shadow-none">
          <CardHeader className="border-b border-[#eceef2] pb-4">
            <CardTitle className="text-[16px] font-semibold text-[#111827]">Bio guidance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-5 md:grid-cols-2">
            <div className="rounded-md border border-[#eceef2] bg-[#f8f9fb] p-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">Account</p>
              <p className="mt-1 text-[14px] font-medium text-[#111827]">{fullName}</p>
              <p className="text-[13px] text-[#4b5563]">{normalizeValue(user.email)}</p>
            </div>

            <div className="space-y-2 rounded-md border border-[#eceef2] bg-[#f8f9fb] p-3">
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#374151]">
                <FileTextIcon className="size-4 text-[#4b5563]" />
                Write a strong bio
              </p>
              <ul className="space-y-1 text-[13px] text-[#4b5563]">
                <li>State your role and focus clearly.</li>
                <li>Keep it direct and easy to scan.</li>
                <li>Avoid adding sensitive personal data.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="min-w-0">
        <ProfileBioForm bioDetails={bioDetails} />
      </section>
    </main>
  )
}
