import { NextResponse } from "next/server";
import { z } from "zod";
import { obpCall } from "@/lib/obp/client";
import type { PawnTicketToken } from "@/lib/pawn/types";

const schema = z.object({ status: z.string().optional() });

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const { status } = schema.parse(json);
  const args = ["getAllPawnTicketsForUser", status ?? ""];
  const payload = await obpCall<PawnTicketToken[]>("query", args);
  return NextResponse.json({ ok: true, tickets: payload ?? [] });
}
