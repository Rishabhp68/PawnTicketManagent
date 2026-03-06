"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, Shield } from "lucide-react";
import { GlobalSearch } from "@/components/app/global-search";
import { Header } from "./header";
import { useState } from "react";

export function AppShell(props: {
  role: "officer" | "pawnor";
  userLabel: string;
  children: React.ReactNode;
  tickets?: any[]; // optional for global search
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [toggleSearch, setToggleSearch] = useState(false);
  const nav =
    props.role === "officer"
      ? [
          { href: "/officer", label: "Dashboard" },
          { href: "/officer/create", label: "Create Ticket" },
          { href: "/officer/closure", label: "Loan Closure" },
        ]
      : [
          { href: "/pawnor", label: "My Tickets" },
          { href: "/pawnor/loyalty", label: "Loyalty" },
        ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-none">
      {/* GLOBAL COMMAND SEARCH */}

      {props.tickets && <GlobalSearch tickets={props.tickets} open={toggleSearch} setOpen={setToggleSearch} />}

      {/* HEADER */}

      <Header
        role={props.role}
        userLabel={props.userLabel}
        nav={nav}
        logout={logout}
        setToggleSearch={setToggleSearch}
      />

      {/* PAGE CONTENT */}

      <main className="mx-auto max-w-7xl px-6 py-8">{props.children}</main>
    </div>
  );
}
