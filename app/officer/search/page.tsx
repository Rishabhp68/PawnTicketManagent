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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function OfficerSearchPage() {
  const router = useRouter();

  const [me, setMe] = useState<any>(null);
  const [tokenId, setTokenId] = useState("");

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/me", { cache: "no-store" });
      const meData = await meRes.json();

      if (!meData?.user) return router.replace("/login");
      if (!meData.user.isMinter) return router.replace("/pawnor");

      setMe(meData.user);
    })();
  }, [router]);

  function search() {
    if (!tokenId) return;
    router.push(`/tickets/${encodeURIComponent(tokenId)}`);
  }

  return (
    <AppShell role="officer" userLabel={me?.userId ?? ""}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Search Pawn Ticket
        </h1>
        <p className="text-sm text-muted-foreground">
          Find pawn tickets quickly by their NFT token ID.
        </p>
      </div>

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Token Lookup</CardTitle>
          <CardDescription>Enter the pawn ticket NFT tokenId.</CardDescription>
        </CardHeader>

        <CardContent className="flex gap-2">
          <Input
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="pawnTicket3"
            className="flex-1"
          />

          <Button onClick={search}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      <div className="mt-4 text-xs text-muted-foreground">
        Tip: Every pawn ticket is an ERC-1155 NFT. Use the token ID printed on
        the pawn receipt.
      </div>
    </AppShell>
  );
}
