"use client"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Icons ---
import { SunIcon } from "@/components/tiptap-icons/sun-icon"
import { useEffect } from "react"

export function ThemeToggle() {
  useEffect(() => {
    document.documentElement.classList.remove("dark")
  }, [])

  return (
    <Button
      onClick={() => document.documentElement.classList.remove("dark")}
      aria-label="Light mode"
      variant="ghost"
    >
      <SunIcon className="tiptap-button-icon" />
    </Button>
  )
}
