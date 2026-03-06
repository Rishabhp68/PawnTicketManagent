import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>(
  (
    {
      label,
      error,
      helperText,
      required,
      readOnly,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1">
        <div
          className={cn(
            "relative",
            disabled && "opacity-60 pointer-events-none"
          )}
        >
          <Input
            ref={ref}
            placeholder=" "
            readOnly={readOnly}
            disabled={disabled}
            className={cn(
              "peer h-14 pt-6",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            {...props}
          />

          <label
            className={cn(
              `
              pointer-events-none absolute left-3
              transition-all
              `,
              `
              top-4 text-md font-medium text-muted-foreground
              peer-focus:top-2
              peer-focus:text-xs
              peer-focus:font-medium
              peer-focus:text-primary
              peer-placeholder-shown:top-4
              peer-placeholder-shown:text-xs
              peer-placeholder-shown:font-medium
              `,
              `
              peer-not-placeholder-shown:top-2
              peer-not-placeholder-shown:text-xs
              peer-not-placeholder-shown:font-medium
              `,
                error && "text-destructive"
              )}
            >
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
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
    );
  }
);

FloatingInput.displayName = "FloatingInput";
