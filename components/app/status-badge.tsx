import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const s = status;
  const klass =
    s === "Active"
      ? "bg-blue-600/15 text-blue-600 border-blue-600/30"
      : s === "Due Soon"
        ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/30"
        : s === "Overdue"
          ? "bg-red-600/15 text-red-600 border-red-600/30"
          : s === "Redeemed"
            ? "bg-emerald-600/15 text-emerald-600 border-emerald-600/30"
            : s === "Closed"
              ? "bg-zinc-500/15 text-zinc-600 border-zinc-500/30"
              : "bg-purple-600/15 text-purple-600 border-purple-600/30";

  return <Badge className={cn("border", klass)} variant="outline">{s}</Badge>;
}
