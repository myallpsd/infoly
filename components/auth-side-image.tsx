"use client"

import { useState } from "react"

type AuthSideImageProps = {
  src: string
  alt: string
  title: string
  subtitle: string
}

const FALLBACK_SRC = "/auth-fallback.svg"

export function AuthSideImage({ src, alt, title, subtitle }: AuthSideImageProps) {
  const [imageSrc, setImageSrc] = useState(src)

  return (
    <div className="absolute inset-0">
      <img
        src={imageSrc}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => {
          if (imageSrc !== FALLBACK_SRC) {
            setImageSrc(FALLBACK_SRC)
          }
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.08)_45%,rgba(0,0,0,0.45)_100%)]" />

      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
        <div className="inline-block max-w-md rounded-xl border border-white/20 bg-black/40 px-4 py-3.5 shadow-xl backdrop-blur-md">
          <h2 className="text-[19px] font-semibold leading-tight text-white md:text-[22px]">{title}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/90 md:text-[15px]">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
