import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CaptionDateProps {
  label: string
  value?: Date
  onChange: (date?: Date) => void
  disabled?: boolean
  error?: string
}

export function CaptionDate({
  label,
  value,
  onChange,
  disabled,
  error,
}: CaptionDateProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            `
            h-14 w-full
            rounded-md
            border
            bg-input
            px-3
            pt-2
            pb-2
            text-left
            font-normal
            `,
            error && "border-destructive"
          )}
        >
          <div className="flex flex-col gap-0.5 w-full">
            {/* Caption label (Oracle-consistent) */}
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>

            {/* Date value */}
            <span
              className={cn(
                "text-sm leading-5",
                !value && "text-muted-foreground"
              )}
            >
              {value ? format(value, "PPP") : "Select date"}
            </span>
          </div>

          <CalendarIcon className="ml-auto h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}