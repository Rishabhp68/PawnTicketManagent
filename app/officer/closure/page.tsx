"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/shell";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { StatusBadge } from "@/components/app/status-badge";
import type { PawnTicketToken } from "@/lib/pawn/types";

import { Loader2, CheckCircle2, Ticket } from "lucide-react";

export default function OfficerClosurePage() {
  const router = useRouter();

  const [me, setMe] = useState<any>(null);
  const [tickets, setTickets] = useState<PawnTicketToken[]>([]);
  const [tokenId, setTokenId] = useState("");
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState<string | null>(null);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/pawn-tickets/officer/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Redeemed" }),
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

  const redeemed = useMemo(
    () => tickets.filter((t) => t.status === "Redeemed"),
    [tickets],
  );

  async function close(id: string) {
    setClosing(id);

    await fetch("/api/pawn-tickets/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: id }),
    });

    setClosing(null);
    await load();
  }

  return (
    <AppShell role="officer" userLabel={me?.userId ?? ""}>
      {/* HEADER */}

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Loan Closure</h1>

        <p className="text-sm text-muted-foreground">
          Finalize pawn ticket closure once the borrower redeems their loan.
        </p>
      </div>

      {/* METRICS */}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Redeemed Tickets</p>
              <p className="text-2xl font-semibold">{redeemed.length}</p>
            </div>

            <Ticket className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending Closures</p>
              <p className="text-2xl font-semibold">{redeemed.length}</p>
            </div>

            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Officer</p>
              <p className="text-lg font-medium">{me?.userId}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN GRID */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* CLOSE BY TOKEN */}

        <Card>
          <CardHeader>
            <CardTitle>Close by Token ID</CardTitle>

            <CardDescription>
              Manually close a redeemed pawn ticket.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Input
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="pawnTicket123"
            />

            <Button
              className="w-full"
              disabled={!tokenId}
              onClick={() => close(tokenId)}
            >
              Close Pawn Ticket
            </Button>
          </CardContent>
        </Card>

        {/* REDEEMED TABLE */}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Redeemed Tickets Awaiting Closure</CardTitle>

            <CardDescription>
              These pawn tickets have been redeemed and must be closed on-chain.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading redeemed tickets…
              </div>
            ) : redeemed.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No redeemed tickets awaiting closure.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token ID</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {redeemed.map((t) => (
                    <TableRow key={t.tokenId}>
                      <TableCell className="font-medium">{t.tokenId}</TableCell>

                      <TableCell className="text-muted-foreground">
                        {t.tokenMetadata?.borrowerUserId}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={String(t.status)} />
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={closing === t.tokenId}
                          onClick={() => close(t.tokenId)}
                        >
                          {closing === t.tokenId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Close"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
