import { randomUUID } from "crypto"

import { ForgotPasswordForm } from "@/components/forgot-password-form"

export const dynamic = "force-dynamic"

export default function ForgotPasswordPage() {
  const seed = randomUUID()
  const imageUrl = `https://picsum.photos/seed/forgot-${seed}/1200/1600`

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ForgotPasswordForm imageUrl={imageUrl} />
      </div>
    </main>
  )
}
