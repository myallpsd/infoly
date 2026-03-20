"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon, ChevronUpIcon, CircleCheckBigIcon, PlusIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-provider"
import { applyBackendFieldErrors, parseApiResponse } from "@/lib/auth/client-errors"
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/auth/schemas"
import type { WikiUser } from "@/lib/auth/types"
import { cn } from "@/lib/utils"

type ProfileUpdateResponse = {
  message: string
  user: WikiUser
}

type ProfileUpdateFormProps = {
  user: WikiUser
}

type ProfileFormInput = Omit<UpdateProfileInput, "photo">
type EditableField =
  | "first_name"
  | "last_name"
  | "email"
  | "username"
  | "phone"
  | "city"
  | "state"
  | "country"
  | "address"
  | "birthday"
  | "interests"
  | "study"
  | "degree"
  | "website"
  | "mission"
  | "profession"
  | "nationality"
  | "organization"

const PHOTO_ACCEPT_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml", "image/gif"]
const PHOTO_MAX_SIZE = 2 * 1024 * 1024

function fieldLabel(field: EditableField) {
  return field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function fieldType(field: EditableField) {
  if (field === "email") return "email"
  if (field === "birthday") return "date"
  if (field === "website") return "url"
  return "text"
}

const socialProviderOptions = [
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "dribbble", label: "Dribbble" },
  { value: "github", label: "GitHub" },
  { value: "website", label: "Website" },
] as const

const PROFESSION_OPTIONS = [
  "Accountant",
  "Actor",
  "Administrative Officer",
  "Architect",
  "Art Director",
  "Author",
  "Backend Developer",
  "Banker",
  "Biologist",
  "Brand Strategist",
  "Business Analyst",
  "Business Development Manager",
  "Cardiologist",
  "CEO",
  "CFO",
  "Chef",
  "Civil Engineer",
  "Cloud Engineer",
  "Community Manager",
  "Content Creator",
  "Content Strategist",
  "Copywriter",
  "Customer Success Manager",
  "Cybersecurity Analyst",
  "Data Analyst",
  "Data Engineer",
  "Data Scientist",
  "Dentist",
  "Dermatologist",
  "DevOps Engineer",
  "Digital Marketer",
  "Doctor",
  "Ecommerce Manager",
  "Electrical Engineer",
  "Entrepreneur",
  "Event Manager",
  "Fashion Designer",
  "Financial Analyst",
  "Flutter Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Graphic Designer",
  "HR Manager",
  "Interior Designer",
  "Journalist",
  "Lawyer",
  "Machine Learning Engineer",
  "Marketing Manager",
  "Mechanical Engineer",
  "Mobile App Developer",
  "Nurse",
  "Operations Manager",
  "Pediatrician",
  "Pharmacist",
  "Photographer",
  "Physiotherapist",
  "Product Designer",
  "Product Manager",
  "Professor",
  "Project Manager",
  "Psychologist",
  "Public Relations Manager",
  "QA Engineer",
  "Real Estate Agent",
  "Researcher",
  "Sales Manager",
  "SEO Specialist",
  "Social Media Manager",
  "Software Engineer",
  "Solutions Architect",
  "Teacher",
  "Technical Writer",
  "UI Designer",
  "UI/UX Designer",
  "UX Researcher",
  "Veterinarian",
  "Video Editor",
  "Web Designer",
  "Web Developer",
  "Writer",
] as const

type SocialProvider = (typeof socialProviderOptions)[number]["value"]
type SocialLinkInput = { provider: SocialProvider; url: string }

function isSocialProvider(value: string): value is SocialProvider {
  return socialProviderOptions.some((option) => option.value === value)
}

function normalizeSocialLinks(value: unknown): SocialLinkInput[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const provider = String((item as { provider?: unknown }).provider ?? "").trim() as SocialProvider
      const url = String((item as { url?: unknown }).url ?? "").trim()
      if (!provider || !url || !isSocialProvider(provider)) return null
      return { provider, url }
    })
    .filter((item): item is SocialLinkInput => Boolean(item))
}

function sectionTitle(title: string, subtitle: string) {
  return (
    <div className="space-y-1 border-b border-[#eceef2] pb-3">
      <h3 className="text-[15px] font-semibold text-[#111827]">{title}</h3>
      <p className="text-[13px] text-[#6b7280]">{subtitle}</p>
    </div>
  )
}

function FormField({
  field,
  register,
  error,
}: {
  field: EditableField
  register: ReturnType<typeof useForm<ProfileFormInput>>["register"]
  error?: { message?: string }
}) {
  return (
    <Field>
      <FieldLabel htmlFor={field} className="text-[13px] font-semibold text-[#374151]">
        {fieldLabel(field)}
      </FieldLabel>
      <Input
        id={field}
        type={fieldType(field)}
        placeholder={fieldLabel(field)}
        className="h-10 border-[#d6d9de] bg-white text-[14px]"
        {...register(field)}
      />
      <FieldError errors={[error]} />
    </Field>
  )
}

export function ProfileUpdateForm({ user }: ProfileUpdateFormProps) {
  const toast = useToast()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(updateProfileSchema.omit({ photo: true })),
    defaultValues: {
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      username: user.username ?? "",
      phone: user.phone ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      country: user.country ?? "",
      address: user.address ?? "",
      birthday: user.birthday ?? "",
      interests: user.interests ?? "",
      study: user.study ?? "",
      degree: user.degree ?? "",
      website: user.website ?? "",
      mission: user.mission ?? "",
      profession: user.profession ?? "",
      nationality: user.nationality ?? "",
      organization: user.organization ?? "",
      social_links: normalizeSocialLinks(user.social_links),
    },
  })

  const socialLinksFieldArray = useFieldArray({
    control: form.control,
    name: "social_links",
  })

  const selectedPhotoName = useMemo(() => {
    if (photoFile) return photoFile.name
    if (user.photo) return String(user.photo)
    return "No photo selected"
  }, [photoFile, user.photo])

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)
    setSuccessMessage(null)
    setPhotoError(null)

    if (photoFile) {
      if (!PHOTO_ACCEPT_TYPES.includes(photoFile.type)) {
        setPhotoError("Photo must be jpg, jpeg, png, svg, or gif")
        return
      }

      if (photoFile.size > PHOTO_MAX_SIZE) {
        setPhotoError("Photo must be 2MB or smaller")
        return
      }
    }

    try {
      const payload = {
        first_name: values.first_name ?? "",
        last_name: values.last_name ?? "",
        email: values.email ?? "",
        username: values.username ?? "",
        phone: values.phone ?? "",
        city: values.city ?? "",
        state: values.state ?? "",
        country: values.country ?? "",
        address: values.address ?? "",
        birthday: values.birthday ?? "",
        interests: values.interests ?? "",
        study: values.study ?? "",
        degree: values.degree ?? "",
        website: values.website ?? "",
        mission: values.mission ?? "",
        profession: values.profession ?? "",
        nationality: values.nationality ?? "",
        organization: values.organization ?? "",
        social_links:
          values.social_links?.filter((item) => {
            const provider = String(item.provider ?? "").trim()
            const url = String(item.url ?? "").trim()
            return provider.length > 0 && url.length > 0
          }) ?? [],
      }

      const response = await (async () => {
        if (!photoFile) {
          return fetch("/api/profile/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })
        }

        const multipart = new FormData()

        for (const [key, value] of Object.entries(payload)) {
          if (key === "social_links" && Array.isArray(value)) {
            multipart.append(key, JSON.stringify(value))
          } else {
            multipart.append(key, String(value))
          }
        }

        multipart.append("photo", photoFile)

        return fetch("/api/profile/update", {
          method: "POST",
          body: multipart,
        })
      })()

      const updatePayload = await parseApiResponse<ProfileUpdateResponse>(response)
      setSuccessMessage(updatePayload.message)
      toast.success(updatePayload.message || "Profile updated successfully")
      setPhotoFile(null)

      form.reset({
        first_name: updatePayload.user.first_name ?? "",
        last_name: updatePayload.user.last_name ?? "",
        email: updatePayload.user.email ?? "",
        username: updatePayload.user.username ?? "",
        phone: updatePayload.user.phone ?? "",
        city: updatePayload.user.city ?? "",
        state: updatePayload.user.state ?? "",
        country: updatePayload.user.country ?? "",
        address: updatePayload.user.address ?? "",
        birthday: updatePayload.user.birthday ?? "",
        interests: updatePayload.user.interests ?? "",
        study: updatePayload.user.study ?? "",
        degree: updatePayload.user.degree ?? "",
        website: updatePayload.user.website ?? "",
        mission: updatePayload.user.mission ?? "",
        profession: updatePayload.user.profession ?? "",
        nationality: updatePayload.user.nationality ?? "",
        organization: updatePayload.user.organization ?? "",
        social_links: normalizeSocialLinks(updatePayload.user.social_links),
      })
    } catch (error) {
      const apiError = error as Error & { errors?: Record<string, string[]> }
      applyBackendFieldErrors(form.setError, apiError.errors)

      if (apiError.errors?.photo?.length) {
        setPhotoError(apiError.errors.photo[0])
      }

      setFormError(apiError.message)
    }
  })

  const fieldError = (field: EditableField) =>
    form.formState.errors[field] as { message?: string } | undefined

  return (
    <Card className="border-[#d6d9de] bg-white shadow-none">
      <CardHeader className="border-b border-[#eceef2] pb-4">
        <CardTitle className="text-[18px] font-semibold text-[#111827]">Edit profile details</CardTitle>
        <CardDescription className="text-[14px] text-[#6b7280]">
          Update your account information. Core identity fields are shown first for faster completion.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {successMessage ? (
            <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
              <CircleCheckBigIcon className="mt-0.5 size-4 shrink-0" />
              <p className="text-[13px] font-medium">{successMessage}</p>
            </div>
          ) : null}

          <FieldGroup>
            <section className="space-y-4 rounded-md border border-[#eceef2] p-4">
              {sectionTitle("Core Identity", "Primary profile fields used across your account.")}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField field="first_name" register={form.register} error={fieldError("first_name")} />
                <FormField field="last_name" register={form.register} error={fieldError("last_name")} />
                <FormField field="username" register={form.register} error={fieldError("username")} />
                <FormField field="email" register={form.register} error={fieldError("email")} />
              </div>
            </section>

            <section className="space-y-4 rounded-md border border-[#eceef2] p-4">
              {sectionTitle("Contact & Location", "How people can reach you and where you are based.")}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField field="phone" register={form.register} error={fieldError("phone")} />
                <FormField field="city" register={form.register} error={fieldError("city")} />
                <FormField field="state" register={form.register} error={fieldError("state")} />
                <FormField field="country" register={form.register} error={fieldError("country")} />
              </div>
              <div className="grid gap-4">
                <FormField field="address" register={form.register} error={fieldError("address")} />
              </div>
            </section>

            <section className="space-y-4 rounded-md border border-[#eceef2] p-4">
              {sectionTitle("Personal Details", "Optional personal context for your profile view.")}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField field="birthday" register={form.register} error={fieldError("birthday")} />
              </div>
            </section>

            <section className="space-y-4 rounded-md border border-[#eceef2] p-4">
              {sectionTitle("Public Profile", "Information displayed on your public wiki page.")}
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="profession" className="text-[13px] font-semibold text-[#374151]">
                    Profession
                  </FieldLabel>
                  <Input
                    id="profession"
                    type="text"
                    list="profession-options"
                    placeholder="Search or type your profession"
                    className="h-10 border-[#d6d9de] bg-white text-[14px]"
                    {...form.register("profession")}
                  />
                  <datalist id="profession-options">
                    {PROFESSION_OPTIONS.map((profession) => (
                      <option key={profession} value={profession} />
                    ))}
                  </datalist>
                  <p className="text-[12px] text-[#6b7280]">Select from suggestions or enter your own profession.</p>
                  <FieldError errors={[fieldError("profession")]} />
                </Field>
                <FormField field="nationality" register={form.register} error={fieldError("nationality")} />
                <FormField field="organization" register={form.register} error={fieldError("organization")} />
              </div>
              <Field>
                <FieldLabel htmlFor="mission" className="text-[13px] font-semibold text-[#374151]">
                  Mission
                </FieldLabel>
                <textarea
                  id="mission"
                  rows={4}
                  placeholder="Write your mission statement"
                  className="w-full rounded-md border border-[#d6d9de] bg-white px-3 py-2 text-[14px] text-[#111827] outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...form.register("mission")}
                />
                <FieldError errors={[form.formState.errors.mission as { message?: string } | undefined]} />
              </Field>
            </section>

            <section className="space-y-4 rounded-md border border-[#eceef2] p-4">
              {sectionTitle("Social Links", "Add one or more links shown as social icons on your public profile.")}
              <div className="space-y-3">
                {socialLinksFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-3 rounded-md border border-[#eceef2] bg-[#fafafa] p-3 md:grid-cols-[160px_minmax(0,1fr)_auto]">
                    <Field>
                      <FieldLabel htmlFor={`social_provider_${index}`} className="text-[13px] font-semibold text-[#374151]">
                        Provider
                      </FieldLabel>
                      <select
                        id={`social_provider_${index}`}
                        className="h-10 w-full rounded-md border border-[#d6d9de] bg-white px-3 text-[14px] text-[#111827] outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        {...form.register(`social_links.${index}.provider` as const)}
                      >
                        {socialProviderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor={`social_url_${index}`} className="text-[13px] font-semibold text-[#374151]">
                        URL
                      </FieldLabel>
                      <Input
                        id={`social_url_${index}`}
                        type="url"
                        placeholder="https://example.com/your-profile"
                        className="h-10 border-[#d6d9de] bg-white text-[14px]"
                        {...form.register(`social_links.${index}.url` as const)}
                      />
                    </Field>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 border-[#d6d9de] bg-white px-3 text-[13px]"
                        onClick={() => socialLinksFieldArray.remove(index)}
                      >
                        <Trash2Icon className="size-4" />
                        Remove
                      </Button>
                    </div>

                    <FieldError
                      className="md:col-span-3"
                      errors={[
                        form.formState.errors.social_links?.[index]?.provider as { message?: string } | undefined,
                        form.formState.errors.social_links?.[index]?.url as { message?: string } | undefined,
                      ]}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-9 border-[#d6d9de] bg-white px-3 text-[13px] font-semibold"
                onClick={() => socialLinksFieldArray.append({ provider: "facebook", url: "" })}
              >
                <PlusIcon className="size-4" />
                Add social link
              </Button>
            </section>

            <Collapsible
              open={advancedOpen}
              onOpenChange={setAdvancedOpen}
              className="rounded-md border border-[#eceef2]"
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
                <div>
                  <p className="text-[15px] font-semibold text-[#111827]">Advanced</p>
                  <p className="text-[13px] text-[#6b7280]">Less frequently updated profile fields and photo upload.</p>
                </div>
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#4b5563]",
                    advancedOpen ? "bg-[#f3f4f6]" : ""
                  )}
                >
                  {advancedOpen ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
                </span>
              </CollapsibleTrigger>

              <CollapsibleContent className="border-t border-[#eceef2] px-4 pb-4 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField field="study" register={form.register} error={fieldError("study")} />
                  <FormField field="degree" register={form.register} error={fieldError("degree")} />
                  <FormField field="website" register={form.register} error={fieldError("website")} />
                  <FormField field="interests" register={form.register} error={fieldError("interests")} />
                </div>

                <div className="mt-4 space-y-2 rounded-md border border-[#eceef2] bg-[#fafafa] p-3">
                  <FieldLabel htmlFor="photo_upload" className="text-[13px] font-semibold text-[#374151]">
                    Photo Upload
                  </FieldLabel>
                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor="photo_upload"
                      className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[#d6d9de] bg-white px-3 text-[13px] font-medium text-[#111827]"
                    >
                      <UploadIcon className="size-4" />
                      Choose file
                    </label>
                    <input
                      id="photo_upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.svg,.gif,image/jpeg,image/png,image/svg+xml,image/gif"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null
                        setPhotoFile(file)
                        setPhotoError(null)
                      }}
                    />
                    <p className="text-[12px] text-[#6b7280]">{selectedPhotoName}</p>
                  </div>
                  <p className="text-[12px] text-[#6b7280]">Allowed: jpg, jpeg, png, svg, gif. Max 2MB.</p>
                  {photoError ? <FieldError>{photoError}</FieldError> : null}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {formError ? <FieldError>{formError}</FieldError> : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eceef2] pt-4">
              <p className="text-[13px] text-[#6b7280]">All updates are saved to your secure account profile.</p>
              <Button type="submit" disabled={form.formState.isSubmitting} className="h-10 rounded-md px-4 text-[14px] font-semibold">
                {form.formState.isSubmitting ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
