"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthSideImage } from "@/components/auth-side-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { applyBackendFieldErrors, parseApiResponse } from "@/lib/auth/client-errors"
import { loginSchema, type LoginInput } from "@/lib/auth/schemas"
import { cn } from "@/lib/utils"

type LoginResponse = {
  message: string
}

export function LoginForm({
  imageUrl,
  className,
  ...props
}: React.ComponentProps<"div"> & { imageUrl: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const invalidationAttemptedRef = useRef(false)

  useEffect(() => {
    const shouldInvalidate = searchParams.get("invalidated") === "1"

    if (!shouldInvalidate || invalidationAttemptedRef.current) {
      return
    }

    invalidationAttemptedRef.current = true

    const clearStaleCookie = async () => {
      try {
        const response = await fetch("/api/auth/invalidate", { method: "POST" })

        if (response.ok) {
          router.replace("/login")
          router.refresh()
        }
      } catch {
        // Keep the current URL state; user can still submit login manually.
      }
    }

    void clearStaleCookie()
  }, [router, searchParams])

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      await parseApiResponse<LoginResponse>(response)
      router.push("/user")
      router.refresh()
    } catch (error) {
      const apiError = error as Error & { errors?: Record<string, string[]> }
      applyBackendFieldErrors(form.setError, apiError.errors)
      setFormError(apiError.message)
    }
  })

  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      <Card className="overflow-hidden border border-[#d6d9de] bg-white p-0 shadow-[0_10px_40px_rgba(17,24,39,0.08)]">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-9" onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Welcome back</p>
                <h1 className="text-[30px] font-semibold tracking-tight text-[#111827]">Sign in to Infoly</h1>
                <p className="max-w-sm text-[14px] leading-relaxed text-[#6b7280]">
                  Continue to your secure dashboard and profile settings.
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email" className="text-[13px] font-semibold text-[#374151]">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-10 border-[#d6d9de] bg-white text-[14px]"
                  {...form.register("email")}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-[13px] font-semibold text-[#374151]">Password</FieldLabel>
                  <Link href="/forgot-password" className="ml-auto text-[13px] font-medium text-[#4b5563] underline-offset-2 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-10 border-[#d6d9de] bg-white text-[14px]"
                  {...form.register("password")}
                />
                <FieldError errors={[form.formState.errors.password]} />
              </Field>

              {formError ? <FieldError>{formError}</FieldError> : null}

              <Field>
                <Button type="submit" disabled={form.formState.isSubmitting} className="h-10 rounded-md px-4 text-[14px] font-semibold">
                  {form.formState.isSubmitting ? "Signing in..." : "Login"}
                </Button>
              </Field>

              <FieldDescription className="text-[13px] text-[#6b7280]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-[#111827] underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden min-h-52 bg-muted md:block">
            <AuthSideImage
              src={imageUrl}
              alt="Login cover"
              title="Secure account access"
              subtitle="Sign in to continue to your protected dashboard and profile settings."
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-1 text-[12px] text-[#6b7280] md:px-6 md:text-center">
        By clicking continue, you agree to our Terms and Privacy Policy.
      </FieldDescription>
    </div>
  )
}
