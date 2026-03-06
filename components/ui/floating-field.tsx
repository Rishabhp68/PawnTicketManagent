import * as React from "react"
import { cn } from "@/lib/utils"

interface FloatingFieldProps {
  label: string
  required?: boolean
  error?: string
  helperText?: string
  disabled?: boolean
  readOnly?: boolean
  hasValue?: boolean
  children: React.ReactNode
}

export function FloatingField({
  label,
  required,
  error,
  helperText,
  disabled,
  readOnly,
  hasValue,
  children,
}: FloatingFieldProps) {
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "relative",
          disabled && "opacity-60 pointer-events-none",
          readOnly && "bg-muted/40 rounded-md"
        )}
      >
        {children}

        <label
          className={cn(
            `
            pointer-events-none absolute left-3
            transition-all
            `,
            hasValue
              ? "top-2 text-xs font-semibold"
              : "top-4 text-sm font-medium",
            error
              ? "text-destructive"
              : "text-muted-foreground"
          )}
        >
          {label}
          {required && (
            <span className="ml-0.5 text-destructive">*</span>
          )}
        </label>
      </div>

      {(error || helperText) && (
        <p
          className={cn(
            "text-xs",
            error ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  )
}
