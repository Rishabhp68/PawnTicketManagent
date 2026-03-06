import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session.user) return NextResponse.json({ ok: false, error: "Not logged in" }, { status: 401 });
   const res = await fetch(`${process.env.ORDS_URL}?orgId=${session.user.orgId}&userId=${session.user.username}`);
    const data = await res.json();
    if(!data || !data.items || data.items.length == 0) {
        return NextResponse.json({ok: false, error: "User not found"}, {status: 500});
    }
    const balance = data?.items[0];
   return NextResponse.json({ok: true, data: balance});
}