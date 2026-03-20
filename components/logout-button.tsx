"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const onLogout = async () => {
    setIsLoading(true)

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } finally {
      router.push("/login")
      router.refresh()
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={onLogout} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  )
}
