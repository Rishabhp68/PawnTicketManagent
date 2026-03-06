"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  orgId: z.string().min(1, "Org ID is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      orgId: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        ...values,
        userId: values.username,
      };

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.replace(data.role === "officer" ? "/officer" : "/pawnor");
    } catch (err: any) {
      setError(err?.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background image */}
      <div className="absolute inset-0 bg-[url('/bg-pattern.png')] bg-cover bg-center opacity-40" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/90 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10">

        {/* Header */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <div className="text-lg font-semibold tracking-tight">
                Pawn Ticket Management
              </div>
              <div className="text-xs text-muted-foreground">
                Blockchain backed pawn ticket lifecycle
              </div>
            </div>
          </div>

          <ThemeToggle />
        </div>

        {/* Main content */}
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 md:grid-cols-2 md:items-center">

          {/* HERO SECTION */}
          <div className="space-y-6">

            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Secure Pawn Ticket Platform
            </h1>

            <p className="text-muted-foreground max-w-md">
              Manage pawn tickets with full transparency and blockchain-backed
              ownership. Officers manage issuance while customers track
              renewals and redemption easily.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4 pt-2">

              <Card className="bg-background/70 backdrop-blur-md border-border/40 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Financial transparency
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Clear loan breakdown
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-xs text-muted-foreground">
                  Principal, interest, and maturity amounts are always visible.
                </CardContent>
              </Card>

              <Card className="bg-background/70 backdrop-blur-md border-border/40 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    On-chain ownership
                  </CardTitle>
                  <CardDescription className="text-xs">
                    ERC-1155 pawn ticket NFTs
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-xs text-muted-foreground">
                  Pawn tickets are tokenized and visible directly in your wallet.
                </CardContent>
              </Card>

            </div>
          </div>

          {/* LOGIN CARD */}
          <Card className="border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl">

            <CardHeader className="space-y-2">
              <CardTitle className="text-xl font-semibold">
                Account Sign In
              </CardTitle>

              <CardDescription>
                Verify your registered account and role.
              </CardDescription>
            </CardHeader>

            <CardContent>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Sign in failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >

                <div className="grid gap-2">
                  <Label>Username</Label>
                  <Input
                    className="bg-background/90"
                    placeholder="Enter your username"
                    {...form.register("username")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input
                    className="bg-background/90"
                    type="password"
                    placeholder="Enter your password"
                    {...form.register("password")}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Organization ID</Label>
                  <Input
                    className="bg-background/90"
                    placeholder="e.g. RishMarch25Part"
                    {...form.register("orgId")}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Sign In"}
                </Button>

              </form>

              <div className="mt-4 text-xs text-muted-foreground">
                Authentication verifies your account using{" "}
                <span className="font-medium text-foreground">
                  getAccountDetails
                </span>{" "}
                and determines your role via{" "}
                <span className="font-medium text-foreground">
                  isInRole
                </span>.
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}