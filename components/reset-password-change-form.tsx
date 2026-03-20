"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthSideImage } from "@/components/auth-side-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { applyBackendFieldErrors, parseApiResponse } from "@/lib/auth/client-errors"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/auth/schemas"
import type { MessageOnlyResponse } from "@/lib/auth/types"
import { cn } from "@/lib/utils"

function getTokenFromHash(hash: string) {
  const normalized = hash.startsWith("#") ? hash.slice(1) : hash
  const params = new URLSearchParams(normalized)
  return params.get("token") ?? ""
}

function formatHttpError(error: Error & { status?: number }) {
  return error.status ? `HTTP ${error.status}: ${error.message}` : error.message
}

type ResetPasswordChangeFormProps = {
  imageUrl: string
} & React.ComponentProps<"div">

export function ResetPasswordChangeForm({
  imageUrl,
  className,
  ...props
}: ResetPasswordChangeFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams])

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      verification_token: "",
      password: "",
      password_confirmation: "",
    },
  })

  useEffect(() => {
    form.setValue("email", email, { shouldValidate: true })
  }, [email, form])

  useEffect(() => {
    const token = getTokenFromHash(window.location.hash)

    if (!token) {
      const redirectUrl = email ? `/reset-password?email=${encodeURIComponent(email)}&reason=verify-required` : "/reset-password?reason=verify-required"
      router.replace(redirectUrl)
      return
    }

    form.setValue("verification_token", token, { shouldValidate: true })
  }, [email, form, router])

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const payload = await parseApiResponse<MessageOnlyResponse>(response)
      setSuccessMessage(payload.message)
      form.reset({
        email: values.email,
        verification_token: values.verification_token,
        password: "",
        password_confirmation: "",
      })
      router.replace("/login")
    } catch (error) {
      const apiError = error as Error & { status?: number; errors?: Record<string, string[]> }
      applyBackendFieldErrors(form.setError, apiError.errors)
      setFormError(formatHttpError(apiError))
    }
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 pt-3 md:p-8 md:pt-4" onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Change password</h1>
                <p className="text-balance text-muted-foreground">Set your new password to finish account recovery.</p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" {...form.register("email")} readOnly />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input id="password" type="password" {...form.register("password")} />
                <FieldError errors={[form.formState.errors.password]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password_confirmation">Confirm new password</FieldLabel>
                <Input id="password_confirmation" type="password" {...form.register("password_confirmation")} />
                <FieldError errors={[form.formState.errors.password_confirmation]} />
              </Field>

              <input type="hidden" {...form.register("verification_token")} />

              {formError ? <FieldError>{formError}</FieldError> : null}
              {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}

              <Field>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Updating..." : "Change password"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Back to{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                  Login
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative min-h-52 bg-muted">
            <AuthSideImage
              src={imageUrl}
              alt="Change password cover"
              title="Create a secure new password"
              subtitle="Use a strong password and keep your account protected."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
