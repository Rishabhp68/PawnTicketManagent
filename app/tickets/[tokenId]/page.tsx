"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { AppShell } from "@/components/app/shell";
import { StatusBadge } from "@/components/app/status-badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PawnTicketToken } from "@/lib/pawn/types";
import { computeDerivedStatus } from "@/lib/pawn/finance";
import { ImagePreview } from "@/components/app/image-preview";
import { SafeImage } from "@/components/app/safe-image";
import { toast } from "sonner";

function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";

  return v.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function LoanTimeline({ schedules }: { schedules?: any[] }) {
  if (!schedules?.length) return null;

  const now = new Date();

  const currentIndex = schedules.findIndex(
    (s) => new Date(s.termPaymentDate) > now,
  );

  return (
    <div className="mt-6 w-full">
      <div className="flex items-center justify-between relative">
        {/* progress line */}
        <div className="absolute top-2 left-0 right-0 h-[2px] bg-muted" />

        {schedules.map((s, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div
              key={s.termId}
              className="relative flex flex-col items-center flex-1 text-center"
            >
              {/* step dot */}

              <div
                className={`
                  relative z-10 h-4 w-4 rounded-full border-2
                  ${
                    isCurrent
                      ? "bg-primary border-primary"
                      : isCompleted
                        ? "bg-primary/70 border-primary/70"
                        : "bg-background border-muted"
                  }
                `}
              />

              {/* label */}

              <span
                className={`
                  mt-2 text-xs
                  ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}
                `}
              >
                {s.term}
              </span>

              {/* date */}

              <span className="text-[10px] text-muted-foreground">
                {new Date(s.termPaymentDate).toLocaleDateString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getHistoryEvent(entry: any) {
  const status = entry.status;

  if (status === "Created") return "Ticket Created";
  if (status === "Active") return "Ticket Issued";
  if (status === "Renewed") return "Interest Payment (Renew)";
  if (status === "Redeemed") return "Loan Redeemed";
  if (status === "Closed") return "Ticket Closed";

  return "State Update";
}

export default function TicketDetailsPage() {
  const params = useParams<{ tokenId: string }>();
  const tokenId = params.tokenId;

  const router = useRouter();
  const search = useSearchParams();

  const initialAction = search.get("action");

  const [loading, setLoading] = useState(true);

  const [me, setMe] = useState<any>(null);
  const [ticket, setTicket] = useState<PawnTicketToken | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [openRenew, setOpenRenew] = useState(initialAction === "renew");
  const [openRedeem, setOpenRedeem] = useState(initialAction === "redeem");

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRenewing, setIsRenewing] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  async function loadData() {
    try {
      const meRes = await fetch("/api/me", { cache: "no-store" });
      const meData = await meRes.json();

      if (!meData?.user) return router.replace("/login");

      setMe(meData.user);

      const res = await fetch("/api/pawn-tickets/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok)
        throw new Error(data.error || "Unable to load ticket");

      setTicket(data.ticket);

      const histRes = await fetch("/api/pawn-tickets/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId }),
      });

      const histData = await histRes.json();
      setHistory(histData.history ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [router, tokenId]);

  if (loading) {
    return (
      <AppShell role="pawnor" userLabel="Loading">
        <div className="space-y-6">
          <Skeleton className="h-8 w-60" />

          <Skeleton className="h-32 w-full" />

          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>

          <Skeleton className="h-64 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!ticket) {
    return (
      <AppShell role="pawnor" userLabel={me?.userId}>
        <div className="text-center text-muted-foreground mt-10">
          Pawn ticket not found.
        </div>
      </AppShell>
    );
  }

  const principal = Number(ticket.tokenMetadata?.principalAmount ?? 0);
  const interestRate = Number(ticket.tokenMetadata?.interestRate ?? 0);

  const interestPaid = Number(ticket.interestPaid ?? 0);
  const totalPaid = Number(ticket.totalAmountPaid ?? 0);

  const now = new Date();

  const currentSchedule = ticket.termSchedules?.find(
    (s) => new Date(s.termPaymentDate) > now,
  );

  const accruedInterest = currentSchedule?.renewAmount; // principal * (interestRate / 100 / 12);

  const payableToday = currentSchedule?.redeemAmount;

  const actionable = ["Active", "Renewed"].includes(ticket.status);

  const LOYALTY_TOKEN_ID = process.env.NEXT_PUBLIC_LOYALTY_TOKEN_ID;
  const FIAT_MONEY_TOKEN_ID = process.env.NEXT_PUBLIC_FIAT_MONEY_TOKEN_ID;
  const ENDORSERS = process.env.NEXT_PUBLIC_ENDORSERS;
  const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL;

  async function renew(ticket: PawnTicketToken, amount: number) {
    try {
      setIsRenewing(true);
      const res = await fetch("/api/pawn-tickets/renew", {
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
          FiatMoneyTokenQuantity: amount.toString(),
          endorsers: ENDORSERS ? JSON.parse(ENDORSERS) : [],
          channel: CHANNEL,
        }),
      });

      if (!res.ok) throw new Error(`Redeem Failed`);

      toast(`Successfully Renewed`);
      loadData();
    } catch (e) {
      toast(`Error: ${e}`);
    } finally {
      setIsRenewing(false);
      setOpenRenew(false);
    }
  }

  async function redeem(ticket: PawnTicketToken, amount: number) {
    try {
      setIsRedeeming(true);
      const res = await fetch("/api/pawn-tickets/redeem", {
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
          FiatMoneyTokenQuantity: amount.toString(),
          endorsers: ENDORSERS ? JSON.parse(ENDORSERS) : [],
          channel: CHANNEL,
        }),
      });

      if (!res.ok) throw new Error(`Redeem Failed`);

      toast(`Successfully Renewed`);
      loadData();
    } catch (e) {
      toast(`Error: ${e}`);
    } finally {
      setIsRedeeming(false);
      setOpenRedeem(false);
    }
  }

  return (
    <AppShell role={me?.isMinter ? "officer" : "pawnor"} userLabel={me?.userId}>
      {ticket.tokenUri && (
        <section className="relative w-full h-[70vh] overflow-hidden mt-5">
          <SafeImage
            src={ticket?.tokenUri}
            alt={tokenId.toString()}
            className="object-contain cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
            fill
          />

          {/* Gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-background to-transparent" />
        </section>
      )}

      <div className="flex justify-between items-start -mt-15 relative z-10">
        <div>
          <h1 className="text-3xl font-semibold">{ticket.tokenId}</h1>

          <p className="text-md text-muted-foreground">
            Pawn Ticket #{ticket.tokenMetadata?.pawnTicketId}
          </p>
        </div>

        <div className="p-4">
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {error && <div className="text-sm text-destructive mt-4">{error}</div>}

      <Card className="mt-6">
        <CardContent className="pt-6 space-y-6">
          {/* Top Loan Overview */}

          <div className="grid gap-6 md:grid-cols-5">
            {/* Collateral */}

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Collateral</div>

              <div className="font-medium text-sm">
                {ticket.tokenMetadata?.assetDescription}
              </div>

              <div className="text-xs text-muted-foreground">
                {ticket.tokenMetadata?.assetType}
              </div>
            </div>

            {/* Principal */}

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Principal</div>

              <div className="text-lg font-semibold">{money(principal)}</div>

              <div className="text-xs text-muted-foreground">
                Assessed {money(ticket.tokenMetadata?.assessedValue)}
              </div>
            </div>

            {/* Interest */}

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Interest</div>

              <div className="font-medium">{interestRate}%</div>

              <div className="text-xs text-muted-foreground">
                {"Monthly"}
              </div>
            </div>

            {/* Dates */}

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Maturity</div>

              <div className="font-medium">
                {new Date(ticket.maturityDate!!).toLocaleDateString()}
              </div>

              <div className="text-xs text-muted-foreground">
                Started{" "}
                {new Date(
                  ticket.tokenMetadata?.loanStartDate,
                ).toLocaleDateString()}
              </div>
            </div>

            {/* Actions */}

            {actionable && !me?.isMinter && (
              <div className="flex flex-col gap-2 justify-center">
                <Button
                  onClick={() => setOpenRenew(true)}
                  className="w-full"
                  disabled={
                    ticket.status !== "Active" && ticket.status !== "Renewed"
                  }
                >
                  Renew
                </Button>

                <Button
                  variant="default"
                  onClick={() => setOpenRedeem(true)}
                  className="w-full"
                  disabled={
                    ticket.status !== "Active" && ticket.status !== "Renewed"
                  }
                >
                  Redeem
                </Button>
              </div>
            )}
          </div>

          {/* Divider */}

          <div className="border-t pt-6 space-y-4">
            {/* Loan Health Header */}

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Loan Health</span>

              <span className="text-xs text-muted-foreground">
                Progress toward redemption
              </span>
            </div>

            {/* Loan Health Calculations */}

            {(() => {
              const totalPaid = ticket.totalAmountPaid ?? 0;
              const totalRequired = principal;
              const remaining = Math.max(totalRequired - totalPaid, 0);

              const progress =
                totalRequired > 0
                  ? Math.min((totalPaid / totalRequired) * 100, 100)
                  : 0;

              return (
                <div className="space-y-3">
                  {/* Numbers */}

                  <div className="flex justify-between text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Paid</div>

                      <div className="font-medium">{money(totalPaid)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        Remaining
                      </div>

                      <div className="font-medium">{money(remaining)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">
                        Total Loan
                      </div>

                      <div className="font-medium">{money(totalRequired)}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}

                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Progress Label */}

                  <div className="text-xs text-muted-foreground text-right">
                    {progress.toFixed(1)}% repaid
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Footer Metadata */}

          <div className="border-t pt-4 text-xs text-muted-foreground flex flex-wrap gap-4">
            <span>Ticket ID: {ticket.tokenMetadata?.pawnTicketId}</span>

            <span>Borrower: {ticket.tokenMetadata?.borrowerUserId}</span>

            <span>
              Terms: {ticket.tokenMetadata?.totalTermsInMonths} months
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Schedule Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <LoanTimeline schedules={ticket.termSchedules} />
        </CardContent>
      </Card>

      <div className="grid gap-4 mt-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <Row label="Asset Type" value={ticket.tokenMetadata.assetType} />
            <Row
              label="Description"
              value={ticket.tokenMetadata.assetDescription}
            />
            <Row
              label="Assessed Value"
              value={money(ticket.tokenMetadata.assessedValue)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <Row label="Principal" value={ticket.status !== "Redeemed" && ticket.status !== "Closed" ? 0 : money(principal)} />
            <Row label="Interest Paid (Till Date)" value={money(interestPaid)} />
            {/* <Row label="Total Paid" value={money(totalPaid)} /> */}
            {/* <Row
              label="Payable Today (For Redemption)"
              value={
                <span className="text-lg font-semibold">
                  {money(payableToday)}
                </span>
              }
            /> */}

            <Separator />

             <Row label="Total Paid" value={money(totalPaid)} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Term Schedule</CardTitle>
        </CardHeader>

        <CardContent>
          {ticket.termSchedules?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Renew</TableHead>
                  <TableHead>Redeem</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ticket.termSchedules.map((t: any) => (
                  <TableRow key={t.termId}>
                    <TableCell className="font-medium">{t.term}</TableCell>

                    <TableCell>
                      {new Date(t.termPaymentDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell>{money(t.renewAmount)}</TableCell>

                    <TableCell>{money(t.redeemAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-6">
              No term schedule available.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>On-Chain History</CardTitle>
          <CardDescription>
            Blockchain state changes recorded for this pawn ticket.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 text-sm">
              No on-chain history available yet.
            </div>
          ) : (
            <div className="relative space-y-6">
              {/* vertical timeline line */}

              <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-muted" />

              {history.map((h: any, i: number) => {
                const event = getHistoryEvent(h);
                const date = h.creationDate || h.timeStamp || h.timestamp;

                return (
                  <div key={i} className="relative pl-10">
                    {/* timeline dot */}

                    <div className="absolute left-[6px] top-1 h-3 w-3 rounded-full bg-primary" />

                    <div className="border rounded-md p-4 bg-muted/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{event}</div>

                          <div className="text-xs text-muted-foreground mt-1">
                            Status: {h.status}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {date ? new Date(date).toLocaleString() : "—"}
                        </div>
                      </div>

                      {/* optional financial details */}

                      {(h.interestPaid || h.totalAmountPaid) && (
                        <div className="mt-3 text-xs text-muted-foreground flex gap-6">
                          {h.interestPaid && (
                            <span>Interest Paid: {money(h.interestPaid)}</span>
                          )}

                          {h.totalAmountPaid && (
                            <span>Total Paid: {money(h.totalAmountPaid)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renew Dialog */}

      <Dialog open={openRenew} onOpenChange={setOpenRenew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew Pawn Ticket</DialogTitle>

            <DialogDescription>
              Pay interest to extend the loan term
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between">
            <span>Interest Due</span>
            <span className="font-medium">{money(accruedInterest)}</span>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRenew(false)}>
              Cancel
            </Button>

            <Button onClick={() => renew(ticket, accruedInterest!!)}>
              {isRenewing ? "Renewing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redeem Dialog */}

      <Dialog open={openRedeem} onOpenChange={setOpenRedeem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Pawn Ticket</DialogTitle>

            <DialogDescription>Pay principal + interest</DialogDescription>
          </DialogHeader>

          <Row label="Total Payable" value={money(payableToday)} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRedeem(false)}>
              Cancel
            </Button>

            <Button onClick={() => redeem(ticket, payableToday!!)}>
              {isRedeeming ? "Redeeming..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {lightboxOpen && (
        <ImagePreview
          open={lightboxOpen}
          imageUrl={ticket?.tokenUri || ""}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </AppShell>
  );
}
