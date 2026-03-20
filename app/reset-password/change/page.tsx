import { randomUUID } from "crypto"

import { ResetPasswordChangeForm } from "@/components/reset-password-change-form"

export const dynamic = "force-dynamic"

export default function ResetPasswordChangePage() {
  const seed = randomUUID()
  const imageUrl = `https://picsum.photos/seed/reset-change-${seed}/1200/1600`

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ResetPasswordChangeForm imageUrl={imageUrl} />
      </div>
    </main>
  )
}
