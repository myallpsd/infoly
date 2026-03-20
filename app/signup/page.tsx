import { randomUUID } from "crypto"

import { SignupForm } from "@/components/signup-form"

export const dynamic = "force-dynamic"

export default function SignupPage() {
  const seed = randomUUID()
  const imageUrl = `https://picsum.photos/seed/signup-${seed}/1200/1600`

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#ececef] p-5 sm:p-6 md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.85)_0%,rgba(236,236,239,0.4)_35%,rgba(236,236,239,0)_70%)]" />
      <div className="relative w-full max-w-sm md:max-w-5xl">
        <SignupForm imageUrl={imageUrl} />
      </div>
    </div>
  )
}
