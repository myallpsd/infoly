import Link from "next/link"
import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchCurrentUserServer } from "@/lib/auth/profile"

const PROFILE_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "username",
  "phone",
  "city",
  "state",
  "country",
  "address",
  "birthday",
  "interests",
  "study",
  "degree",
  "website",
  "photo",
] as const

export default async function ProfilePage() {
  const user = await fetchCurrentUserServer()

  if (!user) {
    redirect("/login?invalidated=1")
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile details</h1>
        <Link href="/user/dashboard/profile/edit" className="text-primary hover:underline">
          Edit profile
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {PROFILE_FIELDS.map((field) => (
            <p key={field}>
              <span className="font-medium capitalize">{field.replace(/_/g, " ")}:</span>{" "}
              {String(user[field] ?? "-")}
            </p>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
