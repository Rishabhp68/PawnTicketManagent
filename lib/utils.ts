import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortId(len = 4) {
  const s = Math.random().toFixed(len)
    .slice(2, 2 + len);
  return s.toUpperCase();
}

export function formatDate(
  isoString: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!isoString) return "-";

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    ...options,
  }).format(date);
}

export function compoundInterestMonthly(
  principal: number,
  monthlyRatePercent: number,
  months: number
) {
  const r = monthlyRatePercent / 100;

  const amount = principal * Math.pow(1 + r, months);

  const interest = amount - principal;

  return interest
}