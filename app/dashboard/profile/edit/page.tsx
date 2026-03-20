import { redirect } from "next/navigation"

import { ProfileUpdateForm } from "@/components/profile/profile-update-form"
import { fetchCurrentUserServer } from "@/lib/auth/profile"

export default async function EditProfilePage() {
  const user = await fetchCurrentUserServer()

  if (!user) {
    redirect("/login?invalidated=1")
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit profile</h1>
      <ProfileUpdateForm user={user} />
    </main>
  )
}
