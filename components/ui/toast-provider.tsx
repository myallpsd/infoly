"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { CircleCheckBigIcon, XIcon } from "lucide-react"

type ToastKind = "success" | "error"

type ToastItem = {
  id: string
  kind: ToastKind
  message: string
}

type ToastContextValue = {
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = makeId()

    setToasts((prev) => [...prev, { id, kind, message }])

    setTimeout(() => {
      dismiss(id)
    }, 3200)
  }, [dismiss])

  const contextValue = useMemo<ToastContextValue>(() => {
    return {
      success: (message: string) => push("success", message),
      error: (message: string) => push("error", message),
    }
  }, [push])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-2 rounded-md border border-[#d6d9de] bg-white p-3 shadow-sm"
          >
            <span
              className={toast.kind === "success" ? "mt-0.5 text-emerald-600" : "mt-0.5 text-red-600"}
            >
              <CircleCheckBigIcon className="size-4" />
            </span>
            <p className="flex-1 text-[13px] font-medium text-[#111827]">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded p-1 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827]"
              aria-label="Dismiss"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }

  return context
}
