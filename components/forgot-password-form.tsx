"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthSideImage } from "@/components/auth-side-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { applyBackendFieldErrors, parseApiResponse } from "@/lib/auth/client-errors"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth/schemas"
import { cn } from "@/lib/utils"

type ForgotPasswordResponse = {
  message: string
}

export function ForgotPasswordForm({
  imageUrl,
  className,
  ...props
}: React.ComponentProps<"div"> & { imageUrl: string }) {
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const payload = await parseApiResponse<ForgotPasswordResponse>(response)
      setSuccessMessage(payload.message)
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      const apiError = error as Error & { errors?: Record<string, string[]> }
      applyBackendFieldErrors(form.setError, apiError.errors)
      const statusCode = (apiError as Error & { status?: number }).status
      setFormError(statusCode ? `HTTP ${statusCode}: ${apiError.message}` : apiError.message)
    }
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 pt-3 md:p-8 md:pt-4" onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Forgot password?</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your email and we&apos;ll send reset instructions.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" {...form.register("email")} />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              {formError ? <FieldError>{formError}</FieldError> : null}
              {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}

              <Field>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Submitting..." : "Send reset request"}
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
              alt="Forgot password cover"
              title="Recover your account"
              subtitle="Request a secure reset link and regain access in a few steps."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
