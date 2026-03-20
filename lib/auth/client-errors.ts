import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

export type ApiErrorPayload = {
  message: string
  errors?: Record<string, string[]>
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as T | ApiErrorPayload | null

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload | null
    const error = new Error(errorPayload?.message ?? "Request failed") as Error & {
      status?: number
      errors?: Record<string, string[]>
    }

    error.status = response.status
    error.errors = errorPayload?.errors

    throw error
  }

  return payload as T
}

export function applyBackendFieldErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  errors?: Record<string, string[]>
) {
  if (!errors) {
    return
  }

  for (const [field, messages] of Object.entries(errors)) {
    if (!messages?.length) {
      continue
    }

    setError(field as Path<TFieldValues>, {
      type: "server",
      message: messages[0],
    })
  }
}
