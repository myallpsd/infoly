import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cache } from "react"
import {
  BadgeCheckIcon,
  FacebookIcon,
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TwitterIcon,
  UserIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import {
  PublicProfileActionLink,
  PublicProfileViewTracker,
} from "@/components/wiki/public-profile-trackers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { wikiApiRequest, WikiApiError } from "@/lib/auth/server-api"

type SocialLink = {
  provider: string
  url: string
}

type WikiPublicUser = {
  username: string
  first_name: string | null
  last_name: string | null
  display_name: string
  full_name?: string | null
  photo: string | null
  avatar_url?: string | null
  bio_details: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  country: string | null
  address: string | null
  location_text?: string | null
  birthday: string | null
  website: string | null
  interests: string | null
  study: string | null
  degree: string | null
  mission: string | null
  profession: string | null
  nationality: string | null
  organization: string | null
  social_links: SocialLink[] | null
  is_blue_verified: boolean | null
}

type PublicWikiProfileResponse = {
  message: string
  user: WikiPublicUser
}

function normalizeValue(value: string | null | undefined) {
  const text = String(value ?? "").trim()
  return text.length ? text : "--"
}

function normalizeRichHtml(value: string | null | undefined) {
  const text = String(value ?? "").trim()
  return text.length ? text : "<span class='text-slate-400'>--</span>"
}

function resolveUrl(value: string | null | undefined) {
  const text = String(value ?? "").trim()
  if (!text) return ""
  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("/")) return text
  return ""
}

function resolveExternalUrl(value: string | null | undefined) {
  const text = String(value ?? "").trim()
  if (!text) return ""
  if (text.startsWith("http://") || text.startsWith("https://")) return text
  return `https://${text}`
}

function buildLocation(user: WikiPublicUser) {
  const explicit = String(user.location_text ?? "").trim()
  if (explicit) return explicit

  return [user.city, user.state, user.country]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(", ")
}

function resolvePhoneHref(value: string | null | undefined) {
  const text = String(value ?? "").trim()
  if (!text) return ""
  return `tel:${text.replace(/\s+/g, "")}`
}

function resolveMailHref(value: string | null | undefined) {
  const text = String(value ?? "").trim()
  if (!text) return ""
  return `mailto:${text}`
}

function formatBirthday(value: string | null | undefined) {
  const text = String(value ?? "").trim()
  if (!text) return "--"
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return text
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date)
}

function makeDisplayName(user: WikiPublicUser) {
  const explicit = String(user.full_name ?? "").trim()
  if (explicit) return explicit

  const first = String(user.first_name ?? "").trim()
  const last = String(user.last_name ?? "").trim()
  const full = `${first} ${last}`.trim()
  return full || normalizeValue(user.display_name)
}

function normalizeSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const provider = String((item as { provider?: unknown }).provider ?? "").trim().toLowerCase()
      const url = String((item as { url?: unknown }).url ?? "").trim()
      if (!provider || !url) return null
      return { provider, url }
    })
    .filter((item): item is SocialLink => Boolean(item))
}

const providerIconMap: Record<string, LucideIcon> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  linkedin: LinkedinIcon,
  dribbble: GlobeIcon,
  github: GithubIcon,
  website: GlobeIcon,
}

function socialIconForProvider(provider: string) {
  return providerIconMap[provider] ?? GlobeIcon
}

const FRONT_WEBSITE_LOGO_SRC = "/auth-fallback.svg"
const STATIC_BIO_TITLE = "My bio"
const STATIC_FOOTER_BRAND = "profilex"
const STATIC_FOOTER_BRAND_URL = "https://profilo.dev/"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://profilo.dev"

function makeCanonical(username: string) {
  return `${BASE_URL}/wiki/${encodeURIComponent(username)}`
}

function stripHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const fetchPublicProfile = cache(async (username: string) => {
  return wikiApiRequest<PublicWikiProfileResponse>(`/wiki/public/${encodeURIComponent(username)}`, {
    method: "GET",
  })
})

type PublicWikiProfilePageProps = {
  params: Promise<{ username: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PublicWikiProfilePageProps): Promise<Metadata> {
  const { username } = await params
  const canonical = makeCanonical(username)

  try {
    const response = await fetchPublicProfile(username)
    const profile = response.user
    const displayName = makeDisplayName(profile)
    const bioText = stripHtml(profile.bio_details)
    const summary = [normalizeValue(profile.profession), buildLocation(profile)].filter((part) => part !== "--").join(" • ")
    const description = bioText || `${displayName}'s public profile${summary ? ` — ${summary}` : ""}.`
    const ogImage = resolveUrl(profile.avatar_url || profile.photo)

    return {
      title: `${displayName} (@${profile.username}) | Public Profile`,
      description: description.slice(0, 160),
      alternates: { canonical },
      openGraph: {
        title: `${displayName} (@${profile.username})`,
        description: description.slice(0, 200),
        url: canonical,
        type: "profile",
        siteName: "Infoly",
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${displayName} (@${profile.username})`,
        description: description.slice(0, 200),
        images: ogImage ? [ogImage] : undefined,
      },
    }
  } catch {
    return {
      title: `@${username} | Public Profile`,
      description: `Explore @${username}'s public profile and bio on Infoly.`,
      alternates: { canonical },
    }
  }
}

export default async function PublicWikiProfilePage({ params }: PublicWikiProfilePageProps) {
  const { username } = await params
  let response: PublicWikiProfileResponse

  try {
    response = await fetchPublicProfile(username)
  } catch (error) {
    if (error instanceof WikiApiError && error.status === 404) {
      notFound()
    }

    const message =
      error instanceof WikiApiError
        ? `HTTP ${error.status}: ${error.message}`
        : "Unable to load public profile."

    return (
      <main className="mx-auto flex min-h-svh w-full max-w-3xl items-center justify-center bg-[#eff2fa] px-4 py-10">
        <Card className="w-full border-[#d6d9de] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-xl text-[#111827]">Public profile unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#374151]">
            <p>{message}</p>
            <p>
              Check the username and try again, for example:
              {" "}
              <Link href="/wiki/khairulkabir" className="font-medium underline">
                /wiki/khairulkabir
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  const profile = response.user
  const displayName = makeDisplayName(profile)
  const photoUrl = resolveUrl(profile.avatar_url || profile.photo)
  const websiteLogoUrl = FRONT_WEBSITE_LOGO_SRC
  const location = buildLocation(profile) || "--"
  const websiteUrl = resolveExternalUrl(profile.website)
  const phoneHref = resolvePhoneHref(profile.phone)
  const mailHref = resolveMailHref(profile.email)
  const footerBrand = STATIC_FOOTER_BRAND
  const footerBrandUrl = STATIC_FOOTER_BRAND_URL
  const socialLinks = normalizeSocialLinks(profile.social_links)
  const designation = normalizeValue(profile.profession)
  const canonical = makeCanonical(profile.username)
  const richBioPlainText = stripHtml(profile.bio_details)
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${displayName} (@${profile.username})`,
    url: canonical,
    mainEntity: {
      "@type": "Person",
      name: displayName,
      alternateName: `@${profile.username}`,
      jobTitle: designation !== "--" ? designation : undefined,
      description: richBioPlainText || undefined,
      email: profile.email || undefined,
      telephone: profile.phone || undefined,
      image: photoUrl || undefined,
      sameAs: socialLinks.map((item) => item.url),
      homeLocation: location !== "--" ? { "@type": "Place", name: location } : undefined,
    },
  }
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Wiki", item: `${BASE_URL}/wiki` },
      { "@type": "ListItem", position: 3, name: profile.username, item: canonical },
    ],
  }

  const quickFacts = [
    { label: "First Name", value: normalizeValue(profile.first_name) },
    { label: "Last Name", value: normalizeValue(profile.last_name) },
    { label: "Birthday", value: formatBirthday(profile.birthday) },
    { label: "Interests", value: normalizeValue(profile.interests) },
    { label: "Study", value: normalizeValue(profile.study) },
    { label: "Degree", value: normalizeValue(profile.degree) },
    { label: "Website", value: normalizeValue(profile.website) },
  ]

  const allProfileFields = [
    { label: "First Name", value: normalizeValue(profile.first_name) },
    { label: "Last Name", value: normalizeValue(profile.last_name) },
    { label: "Username", value: normalizeValue(profile.username) },
    { label: "Email", value: normalizeValue(profile.email) },
    { label: "Phone", value: normalizeValue(profile.phone) },
    { label: "City", value: normalizeValue(profile.city) },
    { label: "State", value: normalizeValue(profile.state) },
    { label: "Country", value: normalizeValue(profile.country) },
    { label: "Address", value: normalizeValue(profile.address) },
    { label: "Birthday", value: formatBirthday(profile.birthday) },
    { label: "Website", value: normalizeValue(profile.website) },
    { label: "Interests", value: normalizeValue(profile.interests) },
    { label: "Study", value: normalizeValue(profile.study) },
    { label: "Degree", value: normalizeValue(profile.degree) },
    { label: "Mission", value: normalizeValue(profile.mission) },
    { label: "Profession", value: normalizeValue(profile.profession) },
    { label: "Nationality", value: normalizeValue(profile.nationality) },
    { label: "Organization", value: normalizeValue(profile.organization) },
  ]

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(34,197,94,0.12),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 md:py-12">
      <PublicProfileViewTracker username={profile.username} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <style>{`
        .rich-content a { color: #1d4ed8; text-decoration: underline; }
        .rich-content h1,.rich-content h2,.rich-content h3,.rich-content h4,.rich-content h5,.rich-content h6 { margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 700; line-height: 1.35; color: #0f172a; }
        .rich-content h1 { font-size: 1.875rem; }
        .rich-content h2 { font-size: 1.5rem; }
        .rich-content h3 { font-size: 1.25rem; }
        .rich-content h4 { font-size: 1.125rem; }
        .rich-content p,.rich-content ul,.rich-content ol,.rich-content blockquote { margin-top: 0.75rem; margin-bottom: 0.75rem; }
        .rich-content ul,.rich-content ol { padding-left: 1.25rem; }
        .rich-content ul { list-style: disc; }
        .rich-content ol { list-style: decimal; }
        .rich-content blockquote { border-left: 4px solid #cbd5e1; padding-left: 0.75rem; color: #334155; font-style: italic; }
        .rich-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin-top: 0.75rem; margin-bottom: 0.75rem; }
        .rich-content table { width: 100%; border-collapse: collapse; margin-top: 0.75rem; margin-bottom: 0.75rem; }
        .rich-content th,.rich-content td { border: 1px solid #cbd5e1; padding: 0.5rem; text-align: left; }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl border border-slate-200/70 bg-white/70 p-6 backdrop-blur">
          <div className="flex items-center gap-3">
            {websiteLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={websiteLogoUrl} alt="Website Logo" className="m-auto h-20 rounded-xl object-cover" />
            ) : (
              <p className="m-auto text-sm font-semibold text-slate-500">--</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <section className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow ring-1 ring-slate-200">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Profile Logo" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="size-12 text-slate-500" />
                )}
              </div>

              {socialLinks.length ? (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {socialLinks.map((social, index) => {
                    const Icon = socialIconForProvider(social.provider)

                    return (
                      <PublicProfileActionLink
                        key={`${social.provider}-${index}`}
                        username={profile.username}
                        href={social.url}
                        eventType="website_click"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dbeafe] bg-gradient-to-br from-[#eff6ff] to-[#f8fafc] text-[#1d4ed8] transition hover:-translate-y-0.5 hover:border-[#93c5fd] hover:text-[#1e3a8a] hover:shadow-[0_8px_18px_rgba(37,99,235,0.22)]"
                      >
                        <Icon className="size-4" />
                      </PublicProfileActionLink>
                    )
                  })}
                </div>
              ) : null}

              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <h1 className="flex items-center justify-center gap-1 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
                    <span>{displayName}</span>
                    {profile.is_blue_verified === true ? (
                      <span className="inline-flex items-center justify-center text-[#1da1f2]" title="Blue Verified" aria-label="Blue Verified">
                        <BadgeCheckIcon className="size-5 fill-[#1da1f2] text-white" />
                      </span>
                    ) : null}
                  </h1>
                  <p className="mt-1 text-center text-sm font-semibold text-slate-700">{designation}</p>
                </div>

                <div>
                  <dd className="flex items-center gap-2 text-slate-800">
                    <PhoneIcon className="size-4 text-blue-500" />
                    {phoneHref ? (
                      <PublicProfileActionLink username={profile.username} href={phoneHref} eventType="phone_click">
                        {normalizeValue(profile.phone)}
                      </PublicProfileActionLink>
                    ) : (
                      "--"
                    )}
                  </dd>
                </div>

                <div>
                  <dd className="flex items-center gap-2 break-all text-slate-800">
                    <MailIcon className="size-4 text-blue-500" />
                    {mailHref ? (
                      <PublicProfileActionLink username={profile.username} href={mailHref} eventType="contact_click">
                        {normalizeValue(profile.email)}
                      </PublicProfileActionLink>
                    ) : (
                      "--"
                    )}
                  </dd>
                </div>

                <div>
                  <dd className="flex items-center gap-2 text-slate-800">
                    <MapPinIcon className="size-4 text-blue-500" />
                    <span>{location}</span>
                  </dd>
                </div>
              </dl>
            </section>
          </aside>

          <section className="space-y-6 lg:col-span-8">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">{STATIC_BIO_TITLE}</h2>
              {String(profile.mission ?? "").trim() ? (
                <p className="mt-3 text-[15px] leading-8 text-slate-700">{profile.mission}</p>
              ) : null}
              <div className="rich-content mt-3 text-[15px] leading-8 text-slate-700" dangerouslySetInnerHTML={{ __html: normalizeRichHtml(profile.bio_details) }} />
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">Quick Facts</h2>
              <ul className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                {quickFacts.map((fact) => (
                  <li key={fact.label} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-500">{fact.label}</p>
                    <p className="mt-1 break-all font-bold text-slate-900">
                      {fact.label === "Website" && websiteUrl ? (
                        <PublicProfileActionLink
                          username={profile.username}
                          href={websiteUrl}
                          eventType="website_click"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          {fact.value}
                        </PublicProfileActionLink>
                      ) : (
                        fact.value
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">Complete Profile Data</h2>
              <ul className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                {allProfileFields.map((field) => (
                  <li key={field.label} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-500">{field.label}</p>
                    <p className="mt-1 break-all font-bold text-slate-900">
                      {field.label === "Website" && websiteUrl ? (
                        <PublicProfileActionLink
                          username={profile.username}
                          href={websiteUrl}
                          eventType="website_click"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline"
                        >
                          {field.value}
                        </PublicProfileActionLink>
                      ) : field.label === "Email" && mailHref ? (
                        <PublicProfileActionLink
                          username={profile.username}
                          href={mailHref}
                          eventType="contact_click"
                          className="text-blue-700 hover:underline"
                        >
                          {field.value}
                        </PublicProfileActionLink>
                      ) : field.label === "Phone" && phoneHref ? (
                        <PublicProfileActionLink
                          username={profile.username}
                          href={phoneHref}
                          eventType="phone_click"
                          className="text-blue-700 hover:underline"
                        >
                          {field.value}
                        </PublicProfileActionLink>
                      ) : (
                        field.value
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </div>

        <footer className="mt-10 border-t border-slate-200/70 pt-6 text-center text-sm text-slate-500">
          <nav aria-label="Public profile links" className="mb-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href={`/wiki/${profile.username}`} className="font-medium text-slate-700 hover:text-blue-700 hover:underline">
              Profile Home
            </Link>
            <Link href="/signup" className="font-medium text-slate-700 hover:text-blue-700 hover:underline">
              Create Your Profile
            </Link>
            <Link href="/login" className="font-medium text-slate-700 hover:text-blue-700 hover:underline">
              Member Login
            </Link>
          </nav>
          <p>
            Powered by{" "}
            {footerBrandUrl ? (
              <a href={footerBrandUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-700 hover:text-blue-700">
                {footerBrand}
              </a>
            ) : (
              <span className="font-semibold text-slate-700">{footerBrand}</span>
            )}
          </p>
          <p className="mt-1">&copy; {new Date().getFullYear()} {footerBrand}. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
