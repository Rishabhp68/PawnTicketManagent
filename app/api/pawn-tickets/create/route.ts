import { NextResponse } from "next/server";
import { z } from "zod";
import { obpCall } from "@/lib/obp/client";

const schema = z.object({
  tokenId: z.string().min(1),
  tokenDesc: z.string().min(1),
  tokenUri: z.string().url(),
  tokenMetadata: z.record(z.string(), z.any()),
  status: z.string().default("Created"),
  quantity: z.string().default("1"),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const d = schema.parse(json);

  const tokenPayload = {
    tokenId: d.tokenId,
    tokenDesc: d.tokenDesc,
    tokenUri: d.tokenUri,
    tokenMetadata: d.tokenMetadata,
    status: d.status,
  };

  const payload = await obpCall<any>("tx", ["createPawnTicketToken", JSON.stringify(tokenPayload), d.quantity], { sameOrgEndorser: true });
  return NextResponse.json({ ok: true, result: payload });
}
