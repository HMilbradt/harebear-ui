"use client"

import { useTheme } from "@/components/theme/theme-provider"
import { Toaster as Sonner, toast, type ExternalToast, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedMode } = useTheme()

  return (
    <Sonner
      theme={resolvedMode}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          // harebear: the Undo action reads as a soft primary button.
          actionButton: "bg-primary-soft! text-primary! font-medium! h-8! px-3! rounded-md!",
        },
      }}
      {...props}
    />
  )
}

export interface ToastUndoOptions extends Omit<ExternalToast, "action"> {
  /** Called when Undo is pressed. The toast closes. */
  onUndo: () => void
  /** Default "Undo". */
  undoLabel?: React.ReactNode
  /** Milliseconds before it closes. Default 9000. Sonner pauses the timer on hover and while the page is hidden. */
  duration?: number
}

/**
 * harebear: a toast with an Undo action for something that already happened ("Moved 3 to-dos to Done").
 * Uses the mounted <Toaster />. Returns the toast id (pass it to `toast.dismiss` from sonner).
 */
function toastUndo(
  message: React.ReactNode,
  { onUndo, undoLabel = "Undo", duration = 9000, ...options }: ToastUndoOptions,
) {
  return toast(message, { duration, ...options, action: { label: undoLabel, onClick: () => onUndo() } })
}

export { Toaster, toastUndo }
