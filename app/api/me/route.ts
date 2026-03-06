import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.user) return NextResponse.json({ ok: true, user: null });

  const { password, ...safe } = session.user;
  return NextResponse.json({ ok: true, user: safe });
}
