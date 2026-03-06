import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface CaptionSelectProps {
  label: string
  value?: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  disabled?: boolean
  error?: string
}

export function CaptionSelect({
  label,
  value,
  onValueChange,
  children,
  disabled,
  error,
}: CaptionSelectProps) {
  return (
    <div className="relative">
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            `
            min-h-14 w-full
            rounded-md
            border border-border
            bg-input
            px-3 py-2
            text-left
            shadow-none
            `,
            error && "border-destructive",
            disabled && "opacity-60"
          )}
        >
          <div className="flex flex-col gap-0.5 w-full">
            {/* Caption label (Oracle-consistent) */}
            <span className={cn("text-xs font-medium text-muted-foreground", !value && "text-md")}>
              {label}
            </span>

            {/* Selected value */}
            <SelectValue className="text-sm font-normal leading-5" />
          </div>
        </SelectTrigger>

        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </div>
  )
}
