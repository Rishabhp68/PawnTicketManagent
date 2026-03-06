"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();
      if (!data?.user) {
        router.replace("/login");
        return;
      }
      router.replace(data.user.isMinter ? "/officer" : "/pawnor");
    })();
  }, [router]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </div>
  );
}
