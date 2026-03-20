"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, CircleCheckBigIcon, LockKeyholeIcon } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-provider"
import { applyBackendFieldErrors, parseApiResponse } from "@/lib/auth/client-errors"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/auth/schemas"

type ChangePasswordResponse = {
  message: string
}

export function ChangePasswordForm() {
  const router = useRouter()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const payload = await parseApiResponse<ChangePasswordResponse>(response)
      setSuccessMessage(payload.message)
      toast.success(payload.message || "Password updated successfully")
      router.push("/login")
      router.refresh()
    } catch (error) {
      const apiError = error as Error & { errors?: Record<string, string[]> }
      applyBackendFieldErrors(form.setError, apiError.errors)
      setFormError(apiError.message)
    }
  })

  return (
    <Card className="border-[#d6d9de] bg-white shadow-none">
      <CardHeader className="border-b border-[#eceef2] pb-4">
        <CardTitle className="text-[19px] font-semibold text-[#111827]">Update password</CardTitle>
        <CardDescription className="text-[14px] text-[#6b7280]">
          This action changes your account credentials and immediately signs out the current session.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          {successMessage ? (
            <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50/90 px-3 py-2.5 text-emerald-700">
              <CircleCheckBigIcon className="mt-0.5 size-4 shrink-0" />
              <p className="text-[13px] font-medium">{successMessage}</p>
            </div>
          ) : null}

          <FieldGroup>
            <section className="space-y-4 rounded-md border border-[#e6eaf0] bg-[#fbfbfc] p-4">
              <div className="space-y-1 border-b border-[#e8ebef] pb-3">
                <h3 className="text-[15px] font-semibold text-[#111827]">Credentials</h3>
                <p className="text-[13px] leading-relaxed text-[#6b7280]">
                  Confirm your current password, then set and confirm a new one.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="current_password" className="text-[13px] font-semibold text-[#374151]">
                  Current password
                </FieldLabel>
                <Input
                  id="current_password"
                  type="password"
                  className="h-10 border-[#d6d9de] bg-white text-[14px]"
                  {...form.register("current_password")}
                />
                <FieldError errors={[form.formState.errors.current_password]} />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="new_password" className="text-[13px] font-semibold text-[#374151]">
                    New password
                  </FieldLabel>
                  <Input
                    id="new_password"
                    type="password"
                    className="h-10 border-[#d6d9de] bg-white text-[14px]"
                    {...form.register("new_password")}
                  />
                  <FieldError errors={[form.formState.errors.new_password]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="new_password_confirmation" className="text-[13px] font-semibold text-[#374151]">
                    Confirm new password
                  </FieldLabel>
                  <Input
                    id="new_password_confirmation"
                    type="password"
                    className="h-10 border-[#d6d9de] bg-white text-[14px]"
                    {...form.register("new_password_confirmation")}
                  />
                  <FieldError errors={[form.formState.errors.new_password_confirmation]} />
                </Field>
              </div>
            </section>

            {formError ? (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50/90 px-3 py-2.5 text-red-700">
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                <FieldError>{formError}</FieldError>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eceef2] pt-5">
              <p className="inline-flex items-center gap-2 text-[13px] text-[#6b7280]">
                <LockKeyholeIcon className="size-4" />
                Your current session ends immediately after password update.
              </p>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-10 rounded-md px-4 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {form.formState.isSubmitting ? "Updating..." : "Update password"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
