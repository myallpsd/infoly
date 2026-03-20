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
import { registerSchema, type RegisterInput } from "@/lib/auth/schemas"
import { cn } from "@/lib/utils"

type RegisterResponse = {
  message: string
}

export function SignupForm({
  imageUrl,
  className,
  ...props
}: React.ComponentProps<"div"> & { imageUrl: string }) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      await parseApiResponse<RegisterResponse>(response)
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Get started</p>
                <h1 className="text-[30px] font-semibold tracking-tight text-[#111827]">Create your account</h1>
                <p className="max-w-sm text-[14px] leading-relaxed text-[#6b7280]">
                  Register once to manage your secure profile and account settings.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="first_name" className="text-[13px] font-semibold text-[#374151]">First name</FieldLabel>
                  <Input id="first_name" className="h-10 border-[#d6d9de] bg-white text-[14px]" {...form.register("first_name")} />
                  <FieldError errors={[form.formState.errors.first_name]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="last_name" className="text-[13px] font-semibold text-[#374151]">Last name</FieldLabel>
                  <Input id="last_name" className="h-10 border-[#d6d9de] bg-white text-[14px]" {...form.register("last_name")} />
                  <FieldError errors={[form.formState.errors.last_name]} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="username" className="text-[13px] font-semibold text-[#374151]">Username</FieldLabel>
                <Input id="username" className="h-10 border-[#d6d9de] bg-white text-[14px]" {...form.register("username")} />
                <FieldError errors={[form.formState.errors.username]} />
              </Field>

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

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="password" className="text-[13px] font-semibold text-[#374151]">Password</FieldLabel>
                  <Input id="password" type="password" className="h-10 border-[#d6d9de] bg-white text-[14px]" {...form.register("password")} />
                  <FieldError errors={[form.formState.errors.password]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password_confirmation" className="text-[13px] font-semibold text-[#374151]">Confirm Password</FieldLabel>
                  <Input
                    id="password_confirmation"
                    type="password"
                    className="h-10 border-[#d6d9de] bg-white text-[14px]"
                    {...form.register("password_confirmation")}
                  />
                  <FieldError errors={[form.formState.errors.password_confirmation]} />
                </Field>
              </div>

              {formError ? <FieldError>{formError}</FieldError> : null}

              <Field>
                <Button type="submit" disabled={form.formState.isSubmitting} className="h-10 rounded-md px-4 text-[14px] font-semibold">
                  {form.formState.isSubmitting ? "Creating..." : "Create account"}
                </Button>
              </Field>

              <FieldDescription className="text-[13px] text-[#6b7280]">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-[#111827] underline underline-offset-4 hover:text-primary">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden min-h-52 bg-muted md:block">
            <AuthSideImage
              src={imageUrl}
              alt="Signup cover"
              title="Create your secure workspace"
              subtitle="Register once to manage your profile and protected account settings."
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-1 text-[12px] text-[#6b7280] md:px-6 md:text-center">
        By creating an account, you agree to our Terms and Privacy Policy.
      </FieldDescription>
    </div>
  )
}
