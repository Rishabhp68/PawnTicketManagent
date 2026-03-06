import { compoundInterestMonthly } from "../utils";

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeLoanBreakdown(input: {
  principal: number;
  annualInterestRatePct: number; // simple interest
  tenureMonths: number;
  processingFee: number;
  startDate: Date;
}) {
  const { principal, annualInterestRatePct, tenureMonths, processingFee, startDate } = input;
  const monthlyRate = annualInterestRatePct;
  const monthlyInterest = round2(compoundInterestMonthly(principal, monthlyRate, 1));
  const totalInterest = round2(compoundInterestMonthly(principal, monthlyRate, tenureMonths));
  const totalPayableAtMaturity = round2(principal + totalInterest + processingFee);
  const maturityDate = addMonths(startDate, tenureMonths);

  // renewal: pay one month interest (simple model)
  const renewalInterestAmount = monthlyInterest;

  return {
    monthlyInterest,
    totalInterest,
    totalPayableAtMaturity,
    maturityDate,
    renewalInterestAmount,
  };
}

export function computeDerivedStatus(status: string, maturityDate?: string | Date) {
  // Keep on-chain status as truth; derive DueSoon/Overdue only for UI.
  const base = (status || "").toLowerCase();
  if (base !== "active") return { label: status, kind: status };
  if (!maturityDate) return { label: "Active", kind: "Active" };

  const md = typeof maturityDate === "string" ? new Date(maturityDate) : maturityDate;
  const now = new Date();
  const days = Math.ceil((md.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Overdue", kind: "Overdue", daysRemaining: days };
  if (days <= 3) return { label: "Due Soon", kind: "Due Soon", daysRemaining: days };
  return { label: "Active", kind: "Active", daysRemaining: days };
}
