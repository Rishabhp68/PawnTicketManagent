"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { file, z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AppShell } from "@/components/app/shell";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useUploadThing } from "@/lib/uploadthing";
import { computeLoanBreakdown, round2 } from "@/lib/pawn/finance";

import {
  Check,
  Eye,
  FileJson,
  Image as ImageIcon,
  Send,
  Verified,
} from "lucide-react";
import { toast } from "sonner";

import { cn, compoundInterestMonthly, formatDate, shortId } from "@/lib/utils";
import { FloatingInput } from "@/components/ui/floating-input";
import { CaptionDate } from "@/components/ui/caption-date";
import { Badge } from "@/components/ui/badge";
import { SessionUser } from "@/lib/session";
import { CaptionSelect } from "@/components/ui/caption-select";
import { SelectItem } from "@/components/ui/select";

/* ----------------------------- */
/* ZOD SCHEMA */
/* ----------------------------- */

const formSchema = z.object({
  tokenId: z.string().min(1),
  tokenDesc: z.string().min(1),

  pawnTicketId: z.string().min(1),
  pawnShopId: z.string().min(1),

  borrowerId: z.string().min(1),
  borrowerOrgId: z.string().min(1),
  borrowerUserId: z.string().min(1),
  borrowerSSSId: z.string().min(1),

  assetType: z.string().min(1),
  assetDescription: z.string().min(1),
  assessedValue: z.coerce.number(),

  principalAmount: z.coerce.number(),
  interestRate: z.coerce.number(),
  totalTermsInMonths: z.coerce.number(),

  loanStartDate: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

/* ----------------------------- */
/* UTILS */
/* ----------------------------- */

function money(n: any) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";

  return v.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

/* ----------------------------- */
/* PAGE */
/* ----------------------------- */

export default function OfficerCreateTicketPage() {
  const router = useRouter();
  const [me, setMe] = useState<SessionUser | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [tokenUri, setTokenUri] = useState<string | null>(null);
  const [metadataPreview, setMetadataPreview] = useState<any>(null);
  const [mintResult, setMintResult] = useState<any>(null);
  const [issueResult, setIssueResult] = useState<any>(null);
  const [issuingToken, setIssuingToken] = useState<string | null>(null);

  const [ticketImage, setTicketImage] = useState<string | null>(null);
  const [generatingTicket, setGeneratingTicket] = useState(false);
  const [mintingTicket, setMintingTicket] = useState(false);

  const LOYALTY_TOKEN_ID = process.env.NEXT_PUBLIC_LOYALTY_TOKEN_ID;
  const FIAT_MONEY_TOKEN_ID = process.env.NEXT_PUBLIC_FIAT_MONEY_TOKEN_ID;
  const ENDORSERS = process.env.NEXT_PUBLIC_ENDORSERS;
  const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL;
  const uuid = shortId(5);
  const form = useForm({
    resolver: zodResolver(formSchema),

    defaultValues: {
      tokenId: uuid,
      tokenDesc: `Ticket No. ${uuid}`,

      pawnTicketId: uuid,
      pawnShopId: "",

      borrowerId: "",
      borrowerOrgId: "",
      borrowerUserId: "",
      borrowerSSSId: "",

      assetType: "",
      assetDescription: "",
      assessedValue: 0,

      principalAmount: 0,
      interestRate: 10,
      totalTermsInMonths: 5,

      loanStartDate: new Date().toISOString(),
    },
  });

  const { startUpload } = useUploadThing("imageUploader");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/me", { cache: "no-store" });

      const data = await res.json();

      if (!data?.user) return router.replace("/login");

      if (!data.user.isMinter) return router.replace("/pawnor");

      setMe(data.user);
    })();
  }, [router]);

  const principal = useWatch({
    control: form.control,
    name: "principalAmount",
  });

  const rate = useWatch({
    control: form.control,
    name: "interestRate",
  });

  const terms = useWatch({
    control: form.control,
    name: "totalTermsInMonths",
  });

  const loanStartDate = useWatch({
    control: form.control,
    name: "loanStartDate",
  });

  const breakdown = useMemo(() => {
    const p = Number(principal || 0);
    const r = Number(rate || 0);
    const t = Number(terms || 0);

    const start = loanStartDate ? new Date(loanStartDate) : new Date();

    return computeLoanBreakdown({
      principal: p,
      annualInterestRatePct: r,
      tenureMonths: t,
      processingFee: 0,
      startDate: start,
    });
  }, [principal, rate, terms, loanStartDate]);
  const maturityStr = breakdown.maturityDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  /* ----------------------------- */
  /* STEPS */
  /* ----------------------------- */

  const steps = [
    { id: 1, title: "Pawn Shop Details" },
    { id: 2, title: "Pawnor Details" },
    { id: 3, title: "Item Details" },
    { id: 4, title: "Loan Details" },
    { id: 5, title: "Preview" },
    { id: 6, title: "Mint (Created)" },
    { id: 7, title: "Issue (Active)" },
  ];

  /* ----------------------------- */
  /* BUILD METADATA */
  /* ----------------------------- */

  const pawnors = [
    {
      borrowerId: "u2",
      borrowerOrgId: "RishMarch25Part",
      borrowerUserId: "u2",
      borrowerSSSId: "SSS99812",
    },
    {
      borrowerId: "u3",
      borrowerOrgId: "RishMarch25Part",
      borrowerUserId: "u3",
      borrowerSSSId: "SSS99812",
    },
  ];

  function handlePawnorSelect(id: string) {
    const pawnor = pawnors.find((p) => p.borrowerId === id);

    if (!pawnor) return;

    form.setValue("borrowerId", pawnor.borrowerId);
    form.setValue("borrowerOrgId", pawnor.borrowerOrgId);
    form.setValue("borrowerUserId", pawnor.borrowerUserId);
    form.setValue("borrowerSSSId", pawnor.borrowerSSSId);
  }

  function buildMetadata() {
    const v = form.getValues();

    return {
      pawnTicketId: v.pawnTicketId,

      assetType: v.assetType,

      assetDescription: v.assetDescription,

      assessedValue: v.assessedValue,

      principalAmount: v.principalAmount,

      interestRate: v.interestRate,

      totalTermsInMonths: v.totalTermsInMonths,

      loanStartDate: v.loanStartDate,

      maturityDate: breakdown.maturityDate.toISOString(),
    };
  }

  /* ----------------------------- */
  /* VIEW PREVIEW */
  /* ----------------------------- */

  async function generatePawnTicket() {
    try {
      setGeneratingTicket(true);

      const metadata = buildMetadata();

      const res = await fetch("/api/generate-pawn-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId: form.getValues("tokenId"),
          tokenMetadata: {
            pawnTicketId: form.getValues("pawnTicketId"),
            pawnShopId: form.getValues("pawnShopId"),
            borrowerId: form.getValues("borrowerId"),
            borrowerSSSId: form.getValues("borrowerSSSId"),
            assetType: form.getValues("assetType"),
            assetDescription: form.getValues("assetDescription"),
            assessedValue: form.getValues("assessedValue"),
            principalAmount: form.getValues("principalAmount"),
            loanStartDate: form.getValues("loanStartDate"),
            interestRate: form.getValues("interestRate"),
            totalTermsInMonths: form.getValues("totalTermsInMonths"),
          },
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.error);
      }

      setTicketImage(data.imageBase64);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingTicket(false);
    }
  }

  useEffect(() => {
    if (step === 5) {
      generatePawnTicket();
    }
  }, [step]);

  /* ----------------------------- */
  /* MINT */
  /* ----------------------------- */

  async function uploadTicketImage() {
    if (!ticketImage) throw new Error("No ticket image generated");

    // convert base64 -> blob
    const blob = await fetch(ticketImage).then((r) => r.blob());

    // create file
    const file = new File(
      [blob],
      `${form.getValues("tokenId") || "pawn-ticket"}.jpg`,
      {
        type: "image/jpeg",
      },
    );

    // upload
    const uploadRes = await startUpload([file]);

    const uploadedUrl = uploadRes?.[0]?.url;

    if (!uploadedUrl) throw new Error("Upload failed");

    // save to state
    setTokenUri(uploadedUrl);
    
    return uploadedUrl;
  }

  async function uploadAndMint() {
    try {
      setMintingTicket(true);
      const uploadUrl = await uploadTicketImage();
      await mint(uploadUrl);
    } catch (e) {
      toast(`Error in minting. ${(e as Error).message}`);
      throw e;
    } finally {
      setTokenUri(null);
      setMintingTicket(false);
    }
  }

  async function mint(uploadUrl: string) {
    const v = form.getValues();

    if (uploadUrl === null) throw new Error(`Ticket is not upload.`);

    const res = await fetch("/api/pawn-tickets/create", {
      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        tokenId: v.tokenId,
        tokenDesc: v.tokenDesc,
        tokenUri: uploadUrl,

        tokenMetadata: {
          pawnTicketId: v.pawnTicketId,
          pawnShopId: v.pawnShopId,

          borrowerId: v.borrowerId,
          borrowerOrgId: v.borrowerOrgId,
          borrowerUserId: v.borrowerUserId,
          borrowerSSSId: v.borrowerSSSId,

          assetType: v.assetType,
          assetDescription: v.assetDescription,
          assessedValue: v.assessedValue,

          principalAmount: v.principalAmount,

          loanStartDate: new Date(v.loanStartDate).toISOString(),

          interestRate: v.interestRate,
          interestType: "simple",

          totalTermsInMonths: v.totalTermsInMonths,
        },

        status: "Created",
        quantity: "1",
      }),
    });

    const data = await res.json();

    setMintResult(data.result);

    setStep(7);
  }

  /* ----------------------------- */
  /* ISSUE */
  /* ----------------------------- */

  async function issue() {
    const v = form.getValues();
    setIssuingToken(v.tokenId);
    const interestPaid = compoundInterestMonthly(
      v.principalAmount as number,
      v.interestRate as number,
      1,
    );
    try {
      const res = await fetch("/api/pawn-tickets/issue", {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          pawnTicketId: v.tokenId,
          LoyaltyTokenId: LOYALTY_TOKEN_ID,
          FiatMoneyTokenId: FIAT_MONEY_TOKEN_ID,
          FiatMoneyTokenFromOrgId: me?.orgId,
          FiatMoneyTokenFromUserId: me?.userId,
          FiatMoneyTokenToOrgId: v.borrowerOrgId,
          FiatMoneyTokenToUserId: v.borrowerUserId,
          FiatMoneyTokenQuantity: (v.principalAmount as number) - interestPaid,
          endorsers: ENDORSERS ? JSON.parse(ENDORSERS) : [],
          channel: CHANNEL,
        }),
      });
      if (!res.ok) throw new Error("Issuace Failed");
      toast("Ticket Issued Successfully");
      router.push("/officer");
    } catch (e) {
      toast(`Error: ${e}`);
    } finally {
      setIssuingToken(null);
    }
  }

  /* ----------------------------- */
  /* UI */
  /* ----------------------------- */

  return (
    <AppShell role="officer" userLabel={me?.userId ?? ""}>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Pawn Ticket
          </h1>

          <p className="text-sm text-muted-foreground">
            Structured mint-and-issue flow with transparent financials.
          </p>
        </div>

        <div className="text-xs text-muted-foreground">Step {step} of 7</div>
      </div>

      {error && (
        <Alert className="mt-4" variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* LEFT WIZARD */}

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{steps.find((s) => s.id === step)?.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* STEP 1 — Pawn Ticket */}

              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingInput
                    label="Token ID"
                    {...form.register("tokenId")}
                  />

                  <FloatingInput
                    label="Token Description"
                    {...form.register("tokenDesc")}
                  />

                  <FloatingInput
                    label="Pawn Ticket ID"
                    {...form.register("pawnTicketId")}
                  />

                  <FloatingInput
                    label="Pawn Shop ID"
                    {...form.register("pawnShopId")}
                  />
                </div>
              )}

              {/* STEP 2 — Borrower */}
              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Pawnor dropdown */}

                  <CaptionSelect
                    label="Pawnor ID"
                    value={form.watch("borrowerId")}
                    onValueChange={handlePawnorSelect}
                  >
                    {pawnors.map((p) => (
                      <SelectItem key={p.borrowerId} value={p.borrowerId}>
                        {p.borrowerId}
                      </SelectItem>
                    ))}
                  </CaptionSelect>

                  <FloatingInput
                    label="Pawnor Org ID"
                    {...form.register("borrowerOrgId")}
                    readOnly
                  />

                  <FloatingInput
                    label="Pawnor User ID"
                    {...form.register("borrowerUserId")}
                    readOnly
                  />

                  <FloatingInput
                    label="Pawnor SSS ID"
                    {...form.register("borrowerSSSId")}
                    readOnly
                  />
                </div>
              )}

              {/* STEP 3 — Asset */}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FloatingInput
                      label="Asset Type"
                      {...form.register("assetType")}
                    />

                    <FloatingInput
                      label="Assessed Value"
                      type="number"
                      {...form.register("assessedValue")}
                    />
                  </div>

                  <FloatingInput
                    label="Asset Description"
                    {...form.register("assetDescription")}
                  />

                  {/* <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      Upload Asset Image
                    </Label>

                    <UploadButton
                      endpoint="itemImage"
                      onClientUploadComplete={(res) => {
                        const url = res?.[0]?.url;
                        if (url) setTokenUri(url);
                      }}
                    />
                  </div> */}
                </div>
              )}

              {/* STEP 4 — Loan */}

              {step === 4 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FloatingInput
                    label="Principal Amount"
                    type="number"
                    {...form.register("principalAmount")}
                  />

                  <FloatingInput
                    label="Monthly Interest Rate (%)"
                    type="number"
                    {...form.register("interestRate")}
                  />

                  <FloatingInput
                    label="Total Terms (Months)"
                    type="number"
                    {...form.register("totalTermsInMonths")}
                  />

                  <CaptionDate
                    label="Loan Start Date"
                    value={loanStartDate ? new Date(loanStartDate) : undefined}
                    onChange={(d) =>
                      form.setValue("loanStartDate", d?.toISOString() ?? "")
                    }
                  />
                </div>
              )}

              {/* STEP 5 — Metadata */}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Pawn Ticket Preview</h3>

                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={generatePawnTicket}
                    >
                      Regenerate
                    </Button> */}
                  </div>

                  {generatingTicket && (
                    <div className="text-sm text-muted-foreground">
                      Generating pawn ticket...
                    </div>
                  )}

                  {ticketImage && (
                    <div className="rounded-lg border overflow-hidden bg-white">
                      <img
                        src={ticketImage}
                        alt="Pawn Ticket"
                        className="w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6 — Mint */}

              {(step === 6 || step === 7) && (
                <div className="space-y-6">
                  {/* IMAGE PREVIEW */}
                  {step == 7 && (
                    <Badge className="bg-green-600/90">
                      <Verified /> Created
                    </Badge>
                  )}
                  {ticketImage && (
                    <div className="flex justify-center">
                      <img
                        src={ticketImage}
                        alt="Pawn Ticket"
                        className="rounded-lg border shadow-md max-h-[480px] aspect-auto"
                      />
                    </div>
                  )}

                  {/* TOKEN DATA */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FloatingInput
                      label="Token ID"
                      value={form.getValues("tokenId")}
                      readOnly
                    />

                    <FloatingInput
                      label="Token Description"
                      value={form.getValues("tokenDesc")}
                      readOnly
                    />

                    <FloatingInput
                      label="Pawn Ticket ID"
                      value={form.getValues("pawnTicketId")}
                      readOnly
                    />

                    <FloatingInput
                      label="Pawn Shop ID"
                      value={form.getValues("pawnShopId")}
                      readOnly
                    />

                    <FloatingInput
                      label="Borrower ID"
                      value={form.getValues("borrowerId")}
                      readOnly
                    />

                    <FloatingInput
                      label="Borrower SSS ID"
                      value={form.getValues("borrowerSSSId")}
                      readOnly
                    />

                    <FloatingInput
                      label="Asset Type"
                      value={form.getValues("assetType")}
                      readOnly
                    />

                    <FloatingInput
                      label="Assessed Value"
                      value={String(form.getValues("assessedValue"))}
                      readOnly
                    />

                    <FloatingInput
                      label="Principal Amount"
                      value={String(form.getValues("principalAmount"))}
                      readOnly
                    />

                    <FloatingInput
                      label="Interest Rate"
                      value={String(form.getValues("interestRate"))}
                      readOnly
                    />

                    <FloatingInput
                      label="Loan Terms (Months)"
                      value={String(form.getValues("totalTermsInMonths"))}
                      readOnly
                    />

                    <FloatingInput
                      label="Loan Start Date"
                      value={formatDate(form.getValues("loanStartDate"))}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* STEP 7 — Issue */}
            </CardContent>

            <CardFooter className="flex justify-between">
              {step < 7 ? (
                <Button
                  variant="outline"
                  disabled={step === 1}
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={step === 1}
                  onClick={() => router.push("/officer")}
                >
                  Do It Later
                </Button>
              )}

              {step < 6 && (
                <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
              )}
              {step == 6 && (
                <Button
                  onClick={async () => {
                    await uploadAndMint();
                    setStep(7);
                  }}
                >
                  {mintingTicket ? "Minting..." : "Create Pawn Ticket"}
                </Button>
              )}
              {step === 7 && (
                <Button onClick={issue}>
                  {issuingToken ? "Issuing..." : "Issue Pawn Ticket"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT PANEL */}

        <Card>
          <CardHeader>
            <CardTitle>Real-time Breakdown</CardTitle>
            <CardDescription>Updates as loan inputs change.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Principal</span>

              <span className="font-medium">
                {money(Number(principal || 0))}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monthly Interest</span>

              <span className="font-medium">
                {money(breakdown.monthlyInterest)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Interest</span>

              <span className="font-medium">
                {money(breakdown.totalInterest)}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Payable at maturity
              </span>

              <span className="text-lg font-semibold">
                {money(breakdown.totalPayableAtMaturity)}
              </span>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1">
              <div>
                Maturity:
                <span className="ml-1 font-medium">{maturityStr}</span>
              </div>

              <div>
                Renewal interest:
                <span className="ml-1 font-medium">
                  {money(round2(breakdown.renewalInterestAmount))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
