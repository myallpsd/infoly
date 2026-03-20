"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthSideImage } from "@/components/auth-side-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { applyBackendFieldErrors, parseApiResponse } from "@/lib/auth/client-errors"
import { forgotPasswordSchema, verifyResetCodeSchema, type VerifyResetCodeInput } from "@/lib/auth/schemas"
import type { MessageOnlyResponse, VerifyResetCodeResponse } from "@/lib/auth/types"
import { cn } from "@/lib/utils"

type UiStep = "idle" | "code_sent"

type ResetPasswordFormProps = {
  defaultEmail?: string
  initialInfoMessage?: string
  imageUrl: string
} & React.ComponentProps<"div">

function formatHttpError(error: Error & { status?: number }) {
  return error.status ? `HTTP ${error.status}: ${error.message}` : error.message
}

export function ResetPasswordForm({
  defaultEmail = "",
  initialInfoMessage = "",
  imageUrl,
  className,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<UiStep>("idle")
  const [sendCooldown, setSendCooldown] = useState(0)
  const [verifyCooldown, setVerifyCooldown] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [infoMessage] = useState(initialInfoMessage || null)
  const [formError, setFormError] = useState<string | null>(null)

  const verifyForm = useForm<VerifyResetCodeInput>({
    resolver: zodResolver(verifyResetCodeSchema),
    defaultValues: {
      email: defaultEmail,
      code: "",
    },
  })

  useEffect(() => {
    if (sendCooldown <= 0) return

    const timer = setInterval(() => {
      setSendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [sendCooldown])

  useEffect(() => {
    if (verifyCooldown <= 0) return

    const timer = setInterval(() => {
      setVerifyCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [verifyCooldown])

  const sendCode = async () => {
    setFormError(null)
    setSuccessMessage(null)

    const isEmailValid = await verifyForm.trigger("email")
    if (!isEmailValid) return

    const email = verifyForm.getValues("email")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotPasswordSchema.parse({ email })),
      })

      const payload = await parseApiResponse<MessageOnlyResponse>(response)
      setStep("code_sent")
      setSuccessMessage(payload.message)
    } catch (error) {
      const apiError = error as Error & { status?: number; errors?: Record<string, string[]> }
      applyBackendFieldErrors(verifyForm.setError, apiError.errors)
      setFormError(formatHttpError(apiError))

      if (apiError.status === 429) {
        setSendCooldown(60)
      }
    }
  }

  const onVerifyCode = verifyForm.handleSubmit(async (values) => {
    setFormError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const payload = await parseApiResponse<VerifyResetCodeResponse>(response)
      setSuccessMessage(payload.message)
      const nextUrl = `/reset-password/change?email=${encodeURIComponent(values.email)}#token=${encodeURIComponent(payload.verification_token)}`
      router.push(nextUrl)
    } catch (error) {
      const apiError = error as Error & { status?: number; errors?: Record<string, string[]> }
      applyBackendFieldErrors(verifyForm.setError, apiError.errors)
      setFormError(formatHttpError(apiError))

      if (apiError.status === 429) {
        setVerifyCooldown(60)
      }
    }
  })

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 pt-3 md:p-8 md:pt-4" onSubmit={onVerifyCode} noValidate>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Verify reset code</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your email and reset code to continue to password change.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" {...verifyForm.register("email")} />
                <FieldError errors={[verifyForm.formState.errors.email]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="code">Reset code</FieldLabel>
                <Input id="code" inputMode="numeric" maxLength={6} placeholder="123456" {...verifyForm.register("code")} />
                <FieldError errors={[verifyForm.formState.errors.code]} />
              </Field>

              {step === "idle" || step === "code_sent" ? (
                <Field>
                  <Button type="button" disabled={verifyForm.formState.isSubmitting || sendCooldown > 0} onClick={sendCode}>
                    {sendCooldown > 0 ? `Send code (${sendCooldown}s)` : "Send code"}
                  </Button>
                </Field>
              ) : null}

              <Field>
                <Button type="submit" disabled={verifyForm.formState.isSubmitting || verifyCooldown > 0}>
                  {verifyCooldown > 0 ? `Verify code (${verifyCooldown}s)` : verifyForm.formState.isSubmitting ? "Verifying..." : "Verify code"}
                </Button>
              </Field>

              {formError ? <FieldError>{formError}</FieldError> : null}
              {infoMessage ? <p className="text-sm text-[#4b5563]">{infoMessage}</p> : null}
              {successMessage ? <p className="text-sm text-green-600">{successMessage}</p> : null}

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
              alt="Reset verification cover"
              title="Verify your reset code"
              subtitle="After verification, you will be redirected to set your new password."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
