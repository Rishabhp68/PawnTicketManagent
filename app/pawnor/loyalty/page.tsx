"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/shell";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function tier(points: number) {
  if (points >= 5000) return "Platinum";
  if (points >= 2000) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
}

function nextTier(points: number) {
  if (points < 500) return 500;
  if (points < 2000) return 2000;
  if (points < 5000) return 5000;
  return 5000;
}

export default function LoyaltyPage() {
  const router = useRouter();

  const tokenId = process.env.NEXT_PUBLIC_LOYALTY_TOKEN_ID ?? "token1";

  const [me, setMe] = useState<any>(null);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const totalPages = Math.ceil(history.length / pageSize);

  const paginatedHistory = history.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me", { cache: "no-store" });
      const meData = await meRes.json();

      if (!meData?.user) return router.replace("/login");
      if (meData.user.isMinter) return router.replace("/officer");

      setMe(meData.user);

      load();
    })();
  }, [router]);

  async function load() {
    const balRes = await fetch("/api/loyalty/balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tokenId }),
    });

    const balData = await balRes.json();

    setBalance(Number(balData.account?.balance ?? 0));

    const histRes = await fetch("/api/loyalty/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tokenId }),
    });

    const histData = await histRes.json();
    
    setHistory(histData.history ?? []);
  }

  const currentTier = tier(balance);
  const next = nextTier(balance);
  const progress = Math.min((balance / next) * 100, 100);

  return (
    <AppShell role="pawnor" userLabel={me?.userId ?? ""}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Loyalty Rewards
        </h1>

        <p className="text-sm text-muted-foreground">
          Earn loyalty tokens through pawn creation, renewal and redemption.
        </p>
      </div>

      {/* Balance Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Loyalty Balance</CardTitle>

          <CardDescription>
            Token ID: {tokenId}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="flex items-center justify-between">

            <div className="text-5xl font-semibold tracking-tight">
              {balance.toFixed(2)}
            </div>

            <Badge className="text-sm px-3 py-1">
              {currentTier} Tier
            </Badge>

          </div>

          <div>

            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progress to next tier</span>

              <span>
                {balance.toFixed(0)} / {next}
              </span>
            </div>

            <Progress value={progress} />

          </div>

        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="mt-6">

        <CardHeader>
          <CardTitle>Transaction History</CardTitle>

          <CardDescription>
            Mint, credit and debit events for loyalty tokens
          </CardDescription>
        </CardHeader>

        <CardContent>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {paginatedHistory.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHistory.map((h, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-muted-foreground">
                      {h.timestamp
                        ? new Date(h.timestamp).toLocaleString()
                        : "—"}
                    </TableCell>

                    <TableCell className="font-medium">
                      {h.transactionType ?? "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      {h.transactedAmount ?? "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      {h.balance ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}

            </TableBody>
          </Table>

          {/* Pagination */}

          {totalPages > 1 && (
            <Pagination className="mt-6">

              <PaginationContent>

                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setPage((p) => Math.max(p - 1, 1))
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        isActive={page === pageNumber}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPage((p) => Math.min(p + 1, totalPages))
                    }
                  />
                </PaginationItem>

              </PaginationContent>

            </Pagination>
          )}

        </CardContent>
      </Card>
    </AppShell>
  );
}