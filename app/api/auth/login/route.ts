import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { obpCall } from "@/lib/obp/client";
import type { AccountDetails } from "@/lib/pawn/types";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  orgId: z.string().min(1),
  userId: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const session = await getSession();
  // Temporarily store creds to call getAccountDetailsByUser.
  session.user = {
    username: parsed.data.username,
    password: parsed.data.password,
    orgId: parsed.data.orgId,
    userId: parsed.data.userId,
  };

  try {
    const account = await obpCall<AccountDetails>("query", ["getAccountDetailsByUser", parsed.data.orgId, parsed.data.userId], {preAuth: session.user});
    
    if (!account?.userAccountId) {
      session.user = undefined;
      await session.save();
      return NextResponse.json({ ok: false, error: "Account not registered" }, { status: 403 });
    }

    const ft = account.associatedFTAccounts?.[0];
    const nft = account.associatedNFTAccount;

    // role check
    const roleRes = await obpCall<{ result: boolean; msg?: string }>("query", [
      "isInRole",
      parsed.data.orgId,
      parsed.data.userId,
      "minter",
      JSON.stringify({ tokenName: "pawnticket" }),
    ], {preAuth: session?.user});

    session.user = {
      ...session.user,
      userAccountId: account.userAccountId,
      ftAccountId: ft?.accountId,
      nftAccountId: nft?.accountId,
      isMinter: !!roleRes?.result,
    };

    await session.save();

    return NextResponse.json({ ok: true, role: session.user.isMinter ? "officer" : "pawnor" });
  } catch (e: any) {
    session.user = undefined;
    await session.save();
    return NextResponse.json({ ok: false, error: e?.message || "Login failed" }, { status: 401 });
  }
}
