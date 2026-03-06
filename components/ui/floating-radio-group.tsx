import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function FloatingRadioGroup({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: string
  onValueChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>

      <div className="rounded-md border border-border bg-input p-3 space-y-2">
        <RadioGroup value={value} onValueChange={onValueChange}>
          {options.map(o => (
            <label key={o.value} className="flex items-center gap-2">
              <RadioGroupItem value={o.value} />
              <span>{o.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
