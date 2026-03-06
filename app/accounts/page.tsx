"use client";

import { AppShell } from "@/components/app/shell";
import { formatDate } from "@/lib/utils";
import { Clipboard, ClipboardIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const [details, setDetails] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [m, b] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/fiat/balance").then((r) => r.json()),
      ]);

   
      if(!m.ok) throw new Error(m.error || "UnAuthorized");
      // if (!d.ok) throw new Error(d.error || "Failed details");
      if (!b.ok) throw new Error(b.error || "Failed balance");
      // if (!h.ok) throw new Error(h.error || "Failed history");

      setMe(m.user);
      // setDetails(d.data);
      setBalance(b.data?.balance);
      // setHistory(
      //   Array.isArray(h.data)
      //     ? h.data
      //     : Array.isArray(h.data?.transactions)
      //     ? h.data.transactions
      //     : []
      // );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // const associated = Array.isArray(
  //   details?.associatedNFTAccount?.associatedNFTs
  // )
  //   ? details.associatedNFTAccount.associatedNFTs
  //   : [];

  // const userAccountId =
  //   details?.userAccountId ||
  //   details?.UserAccountId ||
  //   details?.accountId;

  // const nftAccountId = details?.associatedNFTAccount?.accountId;

  const orgId = me?.orgId;
  const userId = me?.userId;

  return (
    <div className="min-h-screen flex flex-col">
      
    <AppShell role={me?.role} userLabel={me?.userId ?? ""}>
      <main className="container mx-auto px-6 py-10 space-y-10">
        <h1 className="text-3xl font-bold">Account Overview</h1>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            {/* ===================== */}
            {/* ACCOUNT SUMMARY */}
            {/* ===================== */}
            <section className="grid md:grid-cols-3 gap-6">
              {/* USER ACCOUNT */}
              <div className="rounded-xl border bg-white p-6 flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">
                  Org ID
                </p>

                <div className="flex items-center gap-2 justify-between">
                  <code className="font-mono text-sm px-2 py-1 rounded break-all max-w-full">
                    {orgId}
                  </code>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(orgId)
                    }
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    Copy
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Primary account identifier Org ID
                </p>
              </div>

              {/* NFT ACCOUNT */}
              <div className="rounded-xl border bg-white p-6 flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">
                  User ID
                </p>

                <div className="flex items-center gap-2 justify-between">
                  <code className="font-mono text-sm px-2 py-1 rounded break-all max-w-full">
                    {userId || "-"}
                  </code>
                  {userId && (
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(userId)
                      }
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      Copy
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Primary account identifier User ID
                </p>
              </div>

              {/* ASSOCIATED TOKENS */}
              <div className="rounded-xl border bg-white p-6 flex flex-col">
                <p className="text-sm text-muted-foreground mb-3">
                  Balance
                </p>

                <div className="flex items-center gap-2 justify-between">
                  <code className="font-mono text-sm px-2 py-1 rounded break-all max-w-full">
                    ₱ {balance || "-"}
                  </code>
                  {balance && (
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(balance.toString())
                      }
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      Copy
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Primary account balance
                </p>

                {/* {associated.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No associated tokens
                  </p>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                    {associated.map((t: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm"
                      >
                        <span className="font-medium truncate">
                          {t.nftTokenId || t.tokenId}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          Share: {t.tokenShare}
                        </span>
                      </div>
                    ))}
                  </div>
                )} */}
              </div>
            </section>

            {/* ===================== */}
            {/* TRANSACTION HISTORY */}
            {/* ===================== */}
            {/* <section className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Transaction History
              </h2>

              <div className="overflow-x-auto rounded-xl border bg-white">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-muted/70 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 w-[220px] text-left">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 w-[120px] text-center">
                        Type
                      </th>
                      <th className="px-4 py-3 w-[120px] text-left">
                        From
                      </th>
                      <th className="px-4 py-3 w-[120px] text-left">
                        To
                      </th>
                      <th className="px-4 py-3 w-[120px] text-center">
                        Amount
                      </th>
                      <th className="px-4 py-3 w-[160px] text-left">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-muted-foreground"
                        >
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      history.map((tx: any, i: number) => (
                        <tr
                          key={tx.transactionId || i}
                          className="border-t hover:bg-muted/40 transition"
                        >
                          <td className="px-4 py-3 break-all font-medium">
                            {tx.transactionId || tx.txId}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {tx.transactionType || tx.type}
                          </td>
                          <td className="px-4 py-3 break-all text-muted-foreground">
                            {tx.triggeredByUserAccountId ||
                              tx.fromAccountId}
                          </td>
                          <td className="px-4 py-3 break-all text-muted-foreground">
                            {tx.transactedAccount ||
                              tx.toAccountId}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">
                            {tx.transactedAmount || tx.quantity}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDateTime(tx.timestamp || tx.date)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section> */}
          </>
        )}
      </main>
      </AppShell>
    </div>
  );
}