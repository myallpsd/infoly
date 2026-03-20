import { ChangePasswordForm } from "@/components/profile/change-password-form"

export default function ChangePasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Change password</h1>
      <ChangePasswordForm />
    </main>
  )
}
