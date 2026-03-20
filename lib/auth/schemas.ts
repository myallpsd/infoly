import { z } from "zod"
import { getBioVisibleText } from "@/lib/auth/bio-content"

const passwordSchema = z.string().min(8, "Password must be at least 8 characters")

export const registerSchema = z
  .object({
    email: z.string().email("Provide a valid email"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    first_name: z.string().optional().or(z.literal("")),
    last_name: z.string().optional().or(z.literal("")),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })

export const loginSchema = z.object({
  email: z.string().email("Provide a valid email"),
  password: z.string().min(1, "Password is required"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Provide a valid email"),
})

export const verifyResetCodeSchema = z.object({
  email: z.string().email("Provide a valid email"),
  code: z.string().regex(/^\d{6}$/, "Reset code must be exactly 6 digits"),
})

export const publicProfileTrackSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(100, "Username is too long")
    .regex(/^[A-Za-z0-9_.-]+$/, "Username has invalid characters"),
  event_type: z.enum(["profile_view", "website_click", "phone_click", "contact_click"]),
  page_path: z.string().min(1, "Page path is required").max(512, "Page path is too long"),
  referrer: z.string().url("Referrer must be a valid URL").optional().or(z.literal("")),
  utm_source: z.string().max(100, "utm_source is too long").optional().or(z.literal("")),
  timestamp: z.string().datetime("Timestamp must be an ISO datetime").optional().or(z.literal("")),
  visitor_id: z
    .string()
    .min(8, "visitor_id is too short")
    .max(128, "visitor_id is too long")
    .regex(/^[A-Za-z0-9._-]+$/, "visitor_id has invalid characters")
    .optional()
    .or(z.literal("")),
})

export const bioSchema = z
  .object({
    bio_details: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const visibleText = getBioVisibleText(data.bio_details ?? "")

    if (visibleText.length > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bio must be at most 1000 characters",
        path: ["bio_details"],
      })
    }
  })

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Provide a valid email"),
    verification_token: z.string().min(1, "Verification token is required"),
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  })

const optionalString = z.string().optional().or(z.literal(""))
const socialLinkProviderSchema = z.enum([
  "facebook",
  "twitter",
  "linkedin",
  "dribbble",
  "github",
  "website",
])
const socialLinksSchema = z
  .array(
    z.object({
      provider: socialLinkProviderSchema,
      url: z.string().url("Provide a valid social URL"),
    })
  )
  .max(12, "Maximum 12 social links allowed")
  .optional()

export const updateProfileSchema = z
  .object({
    first_name: optionalString,
    last_name: optionalString,
    email: z.string().email("Provide a valid email").optional().or(z.literal("")),
    username: optionalString,
    phone: optionalString,
    city: optionalString,
    state: optionalString,
    country: optionalString,
    address: optionalString,
    birthday: optionalString,
    interests: optionalString,
    study: optionalString,
    degree: optionalString,
    website: z.string().url("Provide a valid URL").optional().or(z.literal("")),
    photo: optionalString,
    mission: optionalString,
    profession: optionalString,
    nationality: optionalString,
    organization: optionalString,
    social_links: socialLinksSchema,
  })
  .strict()

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: passwordSchema,
    new_password_confirmation: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Passwords do not match",
    path: ["new_password_confirmation"],
  })

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>
export type PublicProfileTrackInput = z.infer<typeof publicProfileTrackSchema>
export type BioInput = z.infer<typeof bioSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
