import { redirect } from "next/navigation"

import { getAuthToken } from "@/lib/auth/session"

export default async function Home() {
  const token = await getAuthToken()

  if (token) {
    redirect("/user")
  }

  redirect("/login")
}
