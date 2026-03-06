"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  ShieldAlert,
  Shield,
  Search,
  LogOut,
  User,
  Menu,
  PhilippinePeso,
  CreditCard,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { ThemeToggle } from "@/components/app/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

interface HeaderProps {
  role: "officer" | "pawnor";
  userLabel: string;
  nav: { label: string; href: string }[];
  logout: () => void;
  setToggleSearch: (val: boolean) => void
}

function initials(name: string) {
  return name
    ?.split("")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Header(props: HeaderProps) {
  const pathname = usePathname();

  const isOfficer = props.role === "officer";

  const router = useRouter();

  const setToggleSearch = props.setToggleSearch;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* LEFT */}

          <div className="flex items-center gap-8">
            {/* BRAND */}

            <Link
              href={isOfficer ? "/officer" : "/pawnor"}
              className="flex items-center gap-2 font-semibold"
            >
              <div className="flex items-center gap-2">
                <PawnIcon />
                <span className="text-lg font-semibold tracking-tight">
                  Pawn Ticket Management
                </span>
              </div>
            </Link>

            {/* NAV */}

            <nav className="hidden md:flex items-center gap-1">
              {props.nav.map((n) => {
                const active = pathname === n.href;

                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-4">
            {/* SEARCH HINT */}

            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground rounded-md px-2 py-1">
              <Button variant="ghost" onClick={() => setToggleSearch(true)}>
              <Search className="h-3 w-3" />
              <span>Search</span>
              <kbd className="border px-1 rounded">/</kbd>
              </Button>
            </div>

            {/* ROLE BADGE */}

            <Badge
              variant="secondary"
              className={cn(
                "hidden sm:flex items-center gap-1 text-[10px] uppercase tracking-wide",
                isOfficer
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-blue-600 bg-blue-50",
              )}
            >
              {isOfficer ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <Shield className="h-5 w-5" />
              )}

              {isOfficer ? "Officer" : "Pawnor"}
            </Badge>

            {/* USER MENU */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer h-9 w-9">
                  <AvatarFallback className="bg-muted font-medium">
                    {initials(props.userLabel)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">
                  Signed in as
                  <div className="text-sm font-medium">{props.userLabel}</div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push("/accounts")}>
                  <User className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={props.logout}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}

      <div className="absolute top-3 -left-1 flex items-center gap-3">
        {/* Mobile Burger */}

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-10 w-10" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64">
            <div className="flex flex-col gap-4 mt-6">
              {props.nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  {n.label}
                </Link>
              ))}

              <div className="border-t pt-4 mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={props.logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* BRAND */}

        {/* <Link
    href={isOfficer ? "/officer" : "/pawnor"}
    className="flex items-center gap-2 font-semibold"
  >
    {isOfficer ? (
      <ShieldAlert className="h-5 w-5 text-emerald-500" />
    ) : (
      <Shield className="h-5 w-5 text-blue-500" />
    )}

    <span className="text-lg tracking-tight">
      Pawn Ticket
    </span>
  </Link> */}
      </div>
    </header>
  );
}

export function PawnIcon() {
  return (
    <div className="relative h-14 w-14 flex items-center justify-center">
      {/* Shield */}

      <CreditCard
        className="h-14 w-14 text-primary"
        strokeWidth={1.5}
        overflow="hidden"
      />

      {/* Ticket overlay */}

      <PhilippinePeso
        className="absolute bottom-3.5 right-3.5 h-7 w-7 
        z-10
        bg-background
        pt-0
        text-primary"
        strokeWidth={1.5}
      />
    </div>
  );
}
