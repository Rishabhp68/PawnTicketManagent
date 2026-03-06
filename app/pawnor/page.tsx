"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AppShell } from "@/components/app/shell";
import { MetricCard } from "@/components/app/metric-card";
import { StatusBadge } from "@/components/app/status-badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { computeDerivedStatus } from "@/lib/pawn/finance";
import type { PawnTicketToken } from "@/lib/pawn/types";
import { toast } from "sonner";
import DashboardGraph from "@/components/app/dashborad-graph";
import { BalancePerTicketChart } from "@/components/app/balance-per-ticket-chart";
import { TicketStatusChart } from "@/components/app/ticket-status-chart";
import { MaturityTimeline } from "@/components/app/maturity-timeline";
import { PawnorDashboardGraphs } from "@/components/app/pawnor-dashboard-graph";

function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";

  return v.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function tier(points: number) {
  if (points >= 5000) return "Platinum";
  if (points >= 2000) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
}

function TicketCard({ t }: { t: PawnTicketToken }) {
  const derived = computeDerivedStatus(String(t.status), t.maturityDate);
  const actionable = ["Active", "Renewed"].includes(String(t.status));

  const days = (derived as any).daysRemaining;

  return (
    <Card className="flex flex-col border hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
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

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {t.tokenId}
            </CardTitle>

            <CardDescription className="text-xs">
              {t.tokenMetadata?.assetDescription ?? "—"}
            </CardDescription>
          </div>

          <StatusBadge status={String(t.status)} />
        </div>
      </CardHeader>

      {/* Content */}

      <CardContent className="grid gap-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Loan Amount</span>

          <span className="font-semibold">
            {money(t.tokenMetadata?.principalAmount)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Due Date</span>

          <span>
            {t.maturityDate
              ? new Date(t.maturityDate).toLocaleDateString()
              : "—"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Days Remaining</span>

          <span
            className={
              days !== undefined && days <= 5
                ? "font-medium text-destructive"
                : "font-medium"
            }
          >
            {days === undefined ? "—" : days}
          </span>
        </div>
      </CardContent>

      {/* Footer */}

      <CardFooter className="mt-auto flex flex-col gap-2 pt-4">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/tickets/${encodeURIComponent(t.tokenId)}`}>
            View Details
          </Link>
        </Button>

        {actionable && (
          <div className="flex gap-2 w-full">
            <Button asChild className="flex-1">
              <Link
                href={`/tickets/${encodeURIComponent(t.tokenId)}?action=renew`}
              >
                Renew
              </Link>
            </Button>

            <Button asChild variant="secondary" className="flex-1">
              <Link
                href={`/tickets/${encodeURIComponent(t.tokenId)}?action=redeem`}
              >
                Redeem
              </Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

const chartData = [
  {
    ticket: "T1",
    principal: 100,
    interest: 20,
    renew: 0,
  },
  {
    ticket: "T2",
    principal: 150,
    interest: 30,
    renew: 10,
  },
  {
    ticket: "T3",
    principal: 200,
    interest: 40,
    renew: 0,
  },
];

function TicketSection({
  title,
  tickets,
  loading,
}: {
  title: string;
  tickets: PawnTicketToken[];
  loading: boolean;
}) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[170px] w-full rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No tickets in this section.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t) => (
            <TicketCard key={t.tokenId} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PawnorDashboard() {
  const router = useRouter();

  const [me, setMe] = useState<any>(null);
  const [tickets, setTickets] = useState<PawnTicketToken[]>([]);
  const [loyalty, setLoyalty] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const tokenId = process.env.NEXT_PUBLIC_LOYALTY_TOKEN_ID ?? "token1";

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me", { cache: "no-store" });
      const meData = await meRes.json();

      if (!meData?.user) return router.replace("/login");
      if (meData.user.isMinter) return router.replace("/officer");

      setMe(meData.user);

      const res = await fetch("/api/pawn-tickets/pawnor/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "All" }),
      });

      const balRes = await fetch("/api/loyalty/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokenId }),
      });

      const data = await res.json();

      setTickets(data.tickets ?? []);

      const balData = await balRes.json();

      setLoyalty(Number(balData.account?.balance ?? 0));

      setLoading(false);
    })();
  }, [router]);

  const analytics = useMemo(() => {
    const activeLike = tickets.filter((t) =>
      ["Active", "Renewed"].includes(String(t.status)),
    ).length;

    const dueSoon = tickets.filter(
      (t) =>
        computeDerivedStatus(String(t.status), t.maturityDate).kind ===
        "Due Soon",
    ).length;

    const overdue = tickets.filter(
      (t) =>
        computeDerivedStatus(String(t.status), t.maturityDate).kind ===
        "Overdue",
    ).length;

    const outstanding = tickets
      .filter((t) => ["Active", "Renewed"].includes(String(t.status)))
      .reduce(
        (sum, t) => sum + Number(t.tokenMetadata?.principalAmount ?? 0),
        0,
      );

    return { activeLike, dueSoon, overdue, outstanding };
  }, [tickets]);

  const grouped = useMemo(() => {
    return {
      active: tickets.filter((t) =>
        ["Active", "Renewed"].includes(String(t.status)),
      ),
      created: tickets.filter((t) => t.status === "Created"),
      redeemed: tickets.filter((t) => t.status === "Redeemed"),
      closed: tickets.filter((t) => t.status === "Closed"),
    };
  }, [tickets]);

  return (
    <AppShell role="pawnor" userLabel={me?.userId ?? ""} tickets={tickets}>
      {/* Header */}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Pawn Tickets
        </h1>

        <p className="text-sm text-muted-foreground">
          Understand your due dates, interest, and actions at a glance.
        </p>
      </div>

      {/* Metrics */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Active Tickets"
          value={String(analytics.activeLike)}
        />

        <MetricCard
          title="Tickets Due Soon"
          value={String(analytics.dueSoon)}
        />

        <MetricCard title="Overdue" value={String(analytics.overdue)} />

        <MetricCard
          title="Outstanding (Principal)"
          value={money(analytics.outstanding)}
        />

        <MetricCard
          title="Loyalty Balance"
          value={loyalty ? String(loyalty) : "—"}
          subtitle={`Tier: ${tier(loyalty)}`}
        />
      </div>

      {/* Sections */}
      <div className="mt-10">
        <PawnorDashboardGraphs tickets={tickets} />
        </div>
      
      <TicketSection
        title="Active & Renewed Tickets"
        tickets={grouped.active}
        loading={loading}
      />

      {/* <TicketSection
        title="Created Tickets"
        tickets={grouped.created}
        loading={loading}
      /> */}

      <TicketSection
        title="Redeemed Tickets"
        tickets={grouped.redeemed}
        loading={loading}
      />

      <TicketSection
        title="Closed Tickets"
        tickets={grouped.closed}
        loading={loading}
      />

      {/* Info */}

      <div className="mt-10 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
        Tip: Your pawn tickets are ERC-1155 NFTs. They remain visible in your
        wallet via on-chain ownership. Use the tokenId to verify.
      </div>
    </AppShell>
  );
}
