import { NextResponse } from "next/server"

import { getAuthTokenFromCookie } from "@/lib/auth/cookies"
import { apiErrorResponse } from "@/lib/auth/route-helpers"
import { wikiApiRequest } from "@/lib/auth/server-api"

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

function isAllowedFileType(file: File) {
  const lowered = file.name.toLowerCase()
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => lowered.endsWith(ext))
  const hasAllowedMime = ALLOWED_IMAGE_MIME.has(file.type)

  return hasAllowedExtension && hasAllowedMime
}

type BioImageUploadResponse = {
  message?: string
  url: string
}

export async function POST(request: Request) {
  const token = await getAuthTokenFromCookie()

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const image = formData.get("image")

    if (!(image instanceof File)) {
      return NextResponse.json({ message: "Image file is required" }, { status: 422 })
    }

    if (!isAllowedFileType(image)) {
      return NextResponse.json({ message: "Only jpg, png, webp, and gif files are allowed" }, { status: 422 })
    }

    const uploadData = new FormData()
    uploadData.append("image", image)

    const response = await wikiApiRequest<BioImageUploadResponse>("/wiki/me/bio/upload-image", {
      method: "POST",
      token,
      body: uploadData,
    })

    return NextResponse.json(response)
  } catch (error) {
    return apiErrorResponse(error)
  }
}
