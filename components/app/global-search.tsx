"use client";

import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { cn } from "@/lib/utils";
import type { PawnTicketToken } from "@/lib/pawn/types";
import { Badge } from "@/components/ui/badge";

function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";

  return v.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function statusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-500";
    case "Renewed":
      return "bg-purple-500";
    case "Redeemed":
      return "bg-emerald-500";
    case "Closed":
      return "bg-gray-400";
    case "Defaulted":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
}

export function GlobalSearch({ tickets, open, setOpen }: { tickets: PawnTicketToken[], open: boolean, setOpen: (val: boolean) => void }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  /* FUZZY SEARCH */

  const fuse = useMemo(() => {
    return new Fuse(tickets, {
      threshold: 0.35,
      keys: [
        "tokenId",
        "tokenMetadata.borrowerUserId",
        "tokenMetadata.assetDescription",
      ],
    });
  }, [tickets]);

  const results = useMemo(() => {
    if (!query) return tickets.slice(0, 8);
    return fuse
      .search(query)
      .map((r) => r.item)
      .slice(0, 8);
  }, [query, fuse, tickets]);

  /* OPEN SEARCH */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* KEYBOARD NAVIGATION */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }

      if (e.key === "Enter") {
        const item = results[activeIndex];
        if (item) {
          router.push(`/tickets/${item.tokenId}`);
          setOpen(false);
        }
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, activeIndex, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-xl">
        {/* SEARCH INPUT */}

        <div className="flex items-center gap-3 border-b px-4 py-2 mr-5">
          <Search className="h-4 w-4 text-muted-foreground" />

          <Input
            autoFocus
            placeholder="Search pawn tickets..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            className="border-none focus-visible:ring-0"
          />

          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <kbd className="border px-1 rounded">↑</kbd>
            <kbd className="border px-1 rounded">↓</kbd>
          </div>
        </div>

        {/* RESULTS */}

        <div className="max-h-80 overflow-x-hidden">
          {results.length === 0 && (
            <div className="px-6 py-8 text-sm text-muted-foreground text-center">
              No matching pawn tickets
            </div>
          )}

          {results.map((t, i) => (
            <div
              key={t.tokenId}
              onClick={() => {
                router.push(`/tickets/${t.tokenId}`);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 cursor-pointer transition-all duration-150",
                i === activeIndex
                  ? "bg-muted scale-[1.01]"
                  : "hover:bg-muted/50",
              )}
            >
              {/* LEFT */}

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">{t.tokenId}</span>

                  <span className="text-xs text-muted-foreground">
                    {t.tokenMetadata?.borrowerUserId} •{" "}
                    {t.tokenMetadata?.assetDescription}
                  </span>
                </div>
              </div>

              {/* RIGHT */}

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {money(t.tokenMetadata?.principalAmount)}
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-2 py-0.5 font-medium capitalize",
                    t.status === "Active" &&
                      "bg-green-500/10 text-green-600 border-green-500/20",
                    t.status === "Renewed" &&
                      "bg-purple-500/10 text-purple-600 border-purple-500/20",
                    t.status === "Redeemed" &&
                      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                    t.status === "Closed" &&
                      "bg-gray-500/10 text-gray-600 border-gray-500/20",
                    t.status === "Defaulted" &&
                      "bg-red-500/10 text-red-600 border-red-500/20",
                  )}
                >
                  {t.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}

        <div className="flex justify-between gap-4 px-4 py-2 border-t text-xs text-muted-foreground">
          <div>
            Press <kbd className="border px-1 rounded">Enter</kbd> to open
          </div>

          <div>
            <kbd className="border px-1 rounded">Esc</kbd> to close
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
