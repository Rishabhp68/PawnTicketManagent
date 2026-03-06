import { Checkbox } from "@/components/ui/checkbox"

interface FloatingCheckboxProps {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}

export function FloatingCheckbox({
  label,
  checked,
  onCheckedChange,
  disabled,
}: FloatingCheckboxProps) {
  return (
    <label
      className={`
        flex items-center gap-3 h-14
        border border-border rounded-md
        bg-input px-3
        cursor-pointer
        ${disabled ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  )
}