"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleCheckBigIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useToast } from "@/components/ui/toast-provider"
import { parseApiResponse } from "@/lib/auth/client-errors"
import { bioDetailsToEditorHtml, getBioVisibleText } from "@/lib/auth/bio-content"
import { bioSchema, type BioInput } from "@/lib/auth/schemas"
import type { BioResponse } from "@/lib/auth/types"
import { cn } from "@/lib/utils"

const BIO_MAX_LENGTH = 1000

type ProfileBioFormProps = {
  bioDetails: string
}

export function ProfileBioForm({ bioDetails }: ProfileBioFormProps) {
  const toast = useToast()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const initialHtml = useMemo(() => bioDetailsToEditorHtml(bioDetails), [bioDetails])
  const [syncedHtml, setSyncedHtml] = useState(initialHtml)
  const [plainTextLength, setPlainTextLength] = useState(() => getBioVisibleText(bioDetails).length)

  const form = useForm<BioInput>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      bio_details: bioDetails,
    },
  })

  const currentLength = plainTextLength
  const isOverLimit = currentLength > BIO_MAX_LENGTH

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    setSuccessMessage(null)

    if (getBioVisibleText(values.bio_details ?? "").length > BIO_MAX_LENGTH) {
      form.setError("bio_details", {
        type: "manual",
        message: `Bio must be at most ${BIO_MAX_LENGTH} characters`,
      })
      return
    }

    try {
      const response = await fetch("/api/profile/bio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio_details: values.bio_details ?? "",
        }),
      })

      const payload = await parseApiResponse<BioResponse>(response)
      const nextBioDetails = payload.bio_details ?? ""
      const nextBioHtml = bioDetailsToEditorHtml(nextBioDetails)

      form.reset({
        bio_details: nextBioDetails,
      })
      setSyncedHtml(nextBioHtml)
      setPlainTextLength(getBioVisibleText(nextBioDetails).length)

      setSuccessMessage(payload.message)
      toast.success(payload.message || "Bio updated successfully")
    } catch (error) {
      const apiError = error as Error
      setFormError(apiError.message)
    }
  })

  return (
    <Card className="overflow-hidden border-[#d6d9de] bg-white shadow-none dark:border-[#27272a] dark:bg-[#0d0d12] dark:text-white">
      <CardHeader className="border-b border-[#eceef2] pb-4 dark:border-white/10">
        <CardTitle className="text-[18px] font-semibold text-[#111827] dark:text-white">Update bio</CardTitle>
        <CardDescription className="text-[14px] text-[#6b7280] dark:text-[#a1a1aa]">
          Template editor enabled. Text limit stays 1000 characters (plain text count).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {successMessage ? (
            <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
              <CircleCheckBigIcon className="mt-0.5 size-4 shrink-0" />
              <p className="text-[13px] font-medium">{successMessage}</p>
            </div>
          ) : null}

          <Field>
            <FieldLabel htmlFor="bio_details" className="text-[13px] font-semibold text-[#374151] dark:text-[#d4d4d8]">
              Bio Details
            </FieldLabel>

            <SimpleEditor
              initialContent={initialHtml}
              syncContent={syncedHtml}
              onContentChange={({ html, text }) => {
                form.setValue("bio_details", html, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                setPlainTextLength(text.length)
              }}
            />

            <p className={cn("text-[12px]", isOverLimit ? "text-red-500 dark:text-red-400" : "text-[#6b7280] dark:text-[#a1a1aa]")}>
              {currentLength}/{BIO_MAX_LENGTH} characters
            </p>

            {isOverLimit ? <FieldError>{`Bio must be at most ${BIO_MAX_LENGTH} characters`}</FieldError> : null}
            <FieldError errors={[form.formState.errors.bio_details]} />
          </Field>

          {formError ? <FieldError>{formError}</FieldError> : null}

          <div className="flex items-center justify-end border-t border-[#eceef2] pt-4 dark:border-white/10">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isOverLimit}
              className="h-10 rounded-md px-4 text-[14px] font-semibold"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save bio"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
