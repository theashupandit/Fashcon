import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Textarea component with theme-aware styling.
 */
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-[16px] border border-[var(--border)] bg-[var(--card)]/50 px-5 py-4 text-[14px] font-medium tracking-tight text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

// Exported directly above
