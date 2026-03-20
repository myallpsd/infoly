import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { BadgeCheckIcon, Edit3Icon, GlobeIcon, MailIcon, MapPinIcon, PhoneIcon, UserCircle2Icon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCurrentUserServer } from "@/lib/auth/profile"

type ProfileField = {
  label: string
  value: string
}

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

function formatBirthday(rawBirthday: unknown) {
  const text = String(rawBirthday ?? "").trim()
  if (!text) return "-"

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return text

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function resolvePhotoUrl(rawPhoto: unknown) {
  const text = String(rawPhoto ?? "").trim()
  if (!text) return ""

  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("/")) {
    return text
  }

  return ""
}

function ProfileInfoCard({
  title,
  icon,
  fields,
}: {
  title: string
  icon: ReactNode
  fields: ProfileField[]
}) {
  return (
    <Card className="border-[#d6d9de] bg-white shadow-none">
      <CardHeader className="border-b border-[#eceef2] pb-4">
        <CardTitle className="flex items-center gap-2 text-[16px] font-semibold text-[#111827]">
          <span className="text-[#6b7280]">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">{field.label}</p>
            <p className="text-[15px] font-medium text-[#111827] break-words">{field.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default async function ProfilePage() {
  const user = await fetchCurrentUserServer()

  if (!user) {
    redirect("/login?invalidated=1")
  }

  const fullName = makeFullName(user.first_name, user.last_name)
  const initials = makeInitials(fullName)
  const photoUrl = resolvePhotoUrl(user.photo)
  const username = normalizeValue(user.username)
  const isBlueVerified = Boolean(user.is_blue_verified)

  const personalFields: ProfileField[] = [
    { label: "First Name", value: normalizeValue(user.first_name) },
    { label: "Last Name", value: normalizeValue(user.last_name) },
    { label: "Birthday", value: formatBirthday(user.birthday) },
    { label: "Study", value: normalizeValue(user.study) },
    { label: "Degree", value: normalizeValue(user.degree) },
    { label: "Profession", value: normalizeValue(user.profession) },
    { label: "Nationality", value: normalizeValue(user.nationality) },
    { label: "Username", value: normalizeValue(user.username) },
  ]

  const contactFields: ProfileField[] = [
    { label: "Email", value: normalizeValue(user.email) },
    { label: "Phone", value: normalizeValue(user.phone) },
    {
      label: "Location",
      value: [user.city, user.state, user.country].map((part) => String(part ?? "").trim()).filter(Boolean).join(", ") || "-",
    },
    { label: "Address", value: normalizeValue(user.address) },
    { label: "Website", value: normalizeValue(user.website) },
  ]

  const otherFields: ProfileField[] = [
    { label: "Blue Verified", value: isBlueVerified ? "Yes (Admin managed)" : "No (Admin managed)" },
    { label: "Mission", value: normalizeValue(user.mission) },
    { label: "Organization", value: normalizeValue(user.organization) },
    { label: "Interests", value: normalizeValue(user.interests) },
    { label: "Photo", value: normalizeValue(user.photo) },
  ]

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Card className="border-[#d6d9de] bg-white shadow-none">
        <CardContent className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border border-[#d6d9de] bg-[#f2f4f7] text-[#111827]" size="lg">
              {photoUrl ? <AvatarImage src={photoUrl} alt={fullName} /> : null}
              <AvatarFallback className="bg-[#e9edf2] text-[18px] font-bold text-[#111827]">{initials}</AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <p className="text-[22px] font-semibold leading-tight text-[#111827]">{fullName}</p>
              <p className="text-[14px] text-[#4b5563]">{username === "-" ? "-" : `@${username}`}</p>
              <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#4b5563]">
                <BadgeCheckIcon className={`size-4 ${isBlueVerified ? "text-[#1da1f2]" : "text-[#9ca3af]"}`} />
                {isBlueVerified ? "Blue verified" : "Not verified"}
                <span className="text-[#9ca3af]">(Admin managed)</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[14px] text-[#4b5563]">
                <span className="inline-flex items-center gap-1.5">
                  <MailIcon className="size-4" />
                  {normalizeValue(user.email)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon className="size-4" />
                  {normalizeValue(user.phone)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="h-10 px-4 text-[14px] font-semibold">
              <Link href="/user/profile/edit">
                <Edit3Icon className="size-4" />
                Edit profile
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-10 border-[#d6d9de] bg-white px-4 text-[14px] font-semibold">
              <Link href="/user/profile/bio">
                <Edit3Icon className="size-4" />
                Edit bio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileInfoCard
          title="Personal"
          icon={<UserCircle2Icon className="size-4" />}
          fields={personalFields}
        />

        <ProfileInfoCard
          title="Contact"
          icon={<MapPinIcon className="size-4" />}
          fields={contactFields}
        />
      </div>

      <ProfileInfoCard
        title="Other"
        icon={<GlobeIcon className="size-4" />}
        fields={otherFields}
      />
    </main>
  )
}
