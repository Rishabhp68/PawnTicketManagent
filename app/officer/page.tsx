"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/shell";
import { MetricCard } from "@/components/app/metric-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { computeDerivedStatus } from "@/lib/pawn/finance";
import { StatusBadge } from "@/components/app/status-badge";
import { ArrowRight, Plus, Search, WalletCards } from "lucide-react";
import type { PawnTicketToken } from "@/lib/pawn/types";
import { toast } from "sonner";

const LOYALTY_TOKEN_ID = process.env.NEXT_PUBLIC_LOYALTY_TOKEN_ID;
const FIAT_MONEY_TOKEN_ID = process.env.NEXT_PUBLIC_FIAT_MONEY_TOKEN_ID;
const ENDORSERS = process.env.NEXT_PUBLIC_ENDORSERS;
const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL;

function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";

  return v.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function RiskBadge({ risk }: { risk: string }) {
  const map: any = {
    High: "destructive",
    Medium: "secondary",
    Low: "outline",
  };

  return <Badge variant={map[risk]}>{risk}</Badge>;
}

function getRisk(ticket: PawnTicketToken) {
  const derived = computeDerivedStatus(ticket.status, ticket.maturityDate);

  if (ticket.status === "Defaulted") return "High";
  if (derived.kind === "Overdue") return "High";
  if (derived.kind === "Due Soon") return "Medium";

  return "Low";
}

export default function OfficerDashboard() {
  const router = useRouter();

  const [me, setMe] = useState<any>(null);
  const [tickets, setTickets] = useState<PawnTicketToken[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [issuingToken, setIssuingToken] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/pawn-tickets/officer/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "All" }),
    });

    const data = await res.json();
    setTickets(data.tickets ?? []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me", { cache: "no-store" });
      const meData = await meRes.json();

      if (!meData?.user) return router.replace("/login");
      if (!meData.user.isMinter) return router.replace("/pawnor");

      setMe(meData.user);

      await load();
    })();
  }, [router]);

  const analytics = useMemo(() => {
    const now = new Date();

    const dueToday = tickets.filter((t) => {
      if (!t.maturityDate) return false;

      const md = new Date(t.maturityDate);

      return (
        md.toDateString() === now.toDateString() &&
        String(t.status) === "Active"
      );
    }).length;

    const overdue = tickets.filter(
      (t) => computeDerivedStatus(t.status, t.maturityDate).kind === "Overdue",
    ).length;

    const active = tickets.filter((t) => t.status === "Active").length;

    const redeemed = tickets.filter((t) => t.status === "Redeemed").length;

    const defaulted = tickets.filter((t) => t.status === "Defaulted").length;

    const outstanding = tickets
      .filter((t) => ["Active", "Renewed"].includes(t.status))
      .reduce(
        (sum, t) => sum + Number(t.tokenMetadata?.principalAmount ?? 0),
        0,
      );

    return {
      dueToday,
      overdue,
      active,
      redeemed,
      defaulted,
      outstanding,
    };
  }, [tickets]);

  async function issue(ticket: PawnTicketToken) {
    setIssuingToken(ticket.tokenId);
    try {
      const res = await fetch("/api/pawn-tickets/issue", {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          pawnTicketId: ticket.tokenId,
          LoyaltyTokenId: LOYALTY_TOKEN_ID,
          FiatMoneyTokenId: FIAT_MONEY_TOKEN_ID,
          FiatMoneyTokenFromOrgId: ticket.tokenMetadata.pawnShopOrgId,
          FiatMoneyTokenFromUserId: ticket.tokenMetadata.pawnShopUserId,
          FiatMoneyTokenToOrgId: ticket.tokenMetadata.borrowerOrgId,
          FiatMoneyTokenToUserId: ticket.tokenMetadata.borrowerUserId,
          FiatMoneyTokenQuantity: ticket.tokenMetadata.principalAmount - (ticket.interestPaid || 0),
          endorsers: ENDORSERS
          ? JSON.parse(ENDORSERS)
          : [],
          channel: CHANNEL,
        }),
      });
      if (!res.ok) throw new Error("Issuace Failed");
      toast("Ticket Issued Successfully");
      window.location.reload();
    } catch (e) {
      toast(`Error: ${e}`);
    } finally {
      setIssuingToken(null);
    }
  }

  return (
    <AppShell role="officer" userLabel={me?.userId ?? ""} tickets={tickets}>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Officer Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor pawn ticket portfolio health and operational actions.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => router.push("/officer/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Pawn Ticket
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/officer/closure")}
          >
            Loan Closure
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SEARCH */}

      {/* <Card className="mt-6">
        <CardContent className="pt-4 flex gap-2">
          <Input
            placeholder="Search pawn ticket by tokenId..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button
            onClick={() =>
              search && router.push(`/tickets/${encodeURIComponent(search)}`)
            }
          >
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </CardContent>
      </Card> */}

      {/* METRICS */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Active"
          value={String(analytics.active)}
          right={<WalletCards className="h-4 w-4 text-muted-foreground" />}
        />

        <MetricCard title="Due Today" value={String(analytics.dueToday)} />

        {/* <MetricCard title="Overdue" value={String(analytics.overdue)} /> */}

        <MetricCard title="Overdue" value={String(analytics.defaulted)} />

        <MetricCard title="Redeemed" value={String(analytics.redeemed)} />

        <MetricCard title="Outstanding" value={money(analytics.outstanding)} />
      </div>

      {/* ALERTS */}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Collection Alerts</CardTitle>
          <CardDescription>
            Tickets requiring immediate attention.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          {analytics.overdue > 0 && (
            <div className="flex justify-between">
              <span>Overdue Loans</span>
              <span className="text-destructive font-medium">
                {analytics.overdue}
              </span>
            </div>
          )}

          {analytics.dueToday > 0 && (
            <div className="flex justify-between">
              <span>Due Today</span>
              <span className="font-medium">{analytics.dueToday}</span>
            </div>
          )}

          {analytics.defaulted > 0 && (
            <div className="flex justify-between">
              <span>Defaulted Loans</span>
              <span className="text-destructive font-medium">
                {analytics.defaulted}
              </span>
            </div>
          )}

          {analytics.overdue === 0 &&
            analytics.dueToday === 0 &&
            analytics.defaulted === 0 && (
              <div className="text-muted-foreground">No urgent alerts.</div>
            )}
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pawn Ticket Portfolio</CardTitle>
          <CardDescription>
            Complete overview of pawn tickets and loan health.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No pawn tickets found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tickets.map((t) => {
                const derived = computeDerivedStatus(t.status, t.maturityDate);

                const risk = getRisk(t);

                return (
                  <Card
                    key={t.tokenId}
                    className="hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/tickets/${t.tokenId}`)}
                  >
                    <CardHeader>
                      {t.tokenUri && (
                        <div className="rounded-lg border overflow-hidden bg-white">
                          <img
                            src={t.tokenUri}
                            alt="Pawn Ticket"
                            className="w-full object-contain"
                          />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-4">
                      {/* HEADER */}

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">{t.tokenId}</div>

                          <div className="text-xs text-muted-foreground">
                            {t.tokenMetadata?.borrowerUserId ?? "—"}
                          </div>
                        </div>

                        <StatusBadge status={derived.label} />
                      </div>

                      {/* COLLATERAL */}

                      <div>
                        <div className="text-xs text-muted-foreground">
                          Collateral
                        </div>

                        <div className="font-medium">
                          {t.tokenMetadata?.assetDescription ?? "—"}
                        </div>
                      </div>

                      {/* FINANCIALS */}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Principal
                          </div>

                          <div className="font-medium">
                            {money(t.tokenMetadata?.principalAmount)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground">
                            Due Date
                          </div>

                          <div className="font-medium">
                            {t.maturityDate
                              ? new Date(t.maturityDate).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                      </div>

                      {/* RISK */}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Risk Level
                        </div>

                        <RiskBadge risk={risk} />
                      </div>

                      {/* ACTIONS */}

                      <div
                        className="flex gap-2 pt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => router.push(`/tickets/${t.tokenId}`)}
                        >
                          View
                        </Button>

                        {t.status === "Redeemed" && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push("/officer/closure")}
                          >
                            Close
                          </Button>
                        )}
                        {t.status === "Created" && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => issue(t)}
                          >
                            {issuingToken && issuingToken === t.tokenId
                              ? "Issuing..."
                              : "Issue"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
