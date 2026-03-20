import { randomUUID } from "crypto"

import { ResetPasswordForm } from "@/components/reset-password-form"

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = "force-dynamic"

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams
  const email = typeof params.email === "string" ? params.email : ""
  const reason = typeof params.reason === "string" ? params.reason : ""
  const initialInfoMessage =
    reason === "verify-required"
      ? "Verify your reset code first to continue to password change."
      : ""
  const seed = randomUUID()
  const imageUrl = `https://picsum.photos/seed/reset-${seed}/1200/1600`

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <ResetPasswordForm defaultEmail={email} initialInfoMessage={initialInfoMessage} imageUrl={imageUrl} />
      </div>
    </main>
  )
}
