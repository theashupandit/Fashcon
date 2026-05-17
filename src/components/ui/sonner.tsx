"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-500" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-500" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-primary" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-[var(--glass)] group-[.toaster]:text-[var(--foreground)] group-[.toaster]:border-[var(--border)] group-[.toaster]:backdrop-blur-xl group-[.toaster]:shadow-2xl group-[.toaster]:rounded-[18px] group-[.toaster]:px-3.5 group-[.toaster]:py-2.5 group-[.toaster]:font-bold group-[.toaster]:text-[12px] group-[.toaster]:tracking-tight group-[.toaster]:min-w-[280px] sm:group-[.toaster]:min-w-[320px]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-black group-[.toast]:rounded-[12px] group-[.toast]:px-3 group-[.toast]:py-1.5",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-[12px] group-[.toast]:px-3 group-[.toast]:py-1.5",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
