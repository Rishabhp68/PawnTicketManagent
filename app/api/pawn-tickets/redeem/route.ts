import { NextResponse } from "next/server";
import { z } from "zod";
import { obpCall } from "@/lib/obp/client";
import { microTxTransactionService } from "@/components/app/microTx-api-client";

const schema = z.object({ tokenId: z.string().min(1), ftTokenId: z.string().min(1), amount: z.number().positive() });

export async function POST(req: Request) {
   const body = await req.json();
     // const payload = await obpCall<any>("tx", ["issuePawnTicket", tokenId, ftTokenId]);
       const res = await microTxTransactionService.loanRedemption(body);
     return res;
}
