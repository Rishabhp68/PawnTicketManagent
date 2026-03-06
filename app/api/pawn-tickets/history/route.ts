import { NextResponse } from "next/server";
import { z } from "zod";
import { obpCall } from "@/lib/obp/client";

const schema = z.object({ tokenId: z.string().min(1) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const { tokenId } = schema.parse(json);
  const payload = await obpCall<any[]>("query", ["getTokenHistory", tokenId]);
  return NextResponse.json({ ok: true, history: payload ?? [] });
}
