"use client";

import Link from "next/link";
import { Bike, Calculator, House, LayoutDashboard, ListChecks, LogIn, ShoppingBag, Store, User } from "lucide-react";
import { CartDrawer } from "@/components/site/cart-drawer";
import { UniversalSearch } from "@/components/site/universal-search";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth/types";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/bikes", label: "Bikes", icon: Bike },
  { href: "/compare", label: "Compare", icon: ListChecks },
  { href: "/showrooms", label: "Showroom", icon: Store },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag, highlight: true },
];

type SiteHeaderUser = {
  email: string | null;
  name: string | null;
  userRole: UserRole;
};

export function SiteHeader({ currentUser }: { currentUser?: SiteHeaderUser | null }) {
  const isAdmin = currentUser?.userRole === "Admin" && currentUser.email?.toLowerCase() === "admin@bikehub.com";

  return (
    <header className="relative sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      {/* Actions pinned to absolute top-right corner of header */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-3.5">
          <CartDrawer />
          {isAdmin ? (
            <Link
              href="/admin"
              title={`Admin: ${currentUser.email ?? "BikeHub"}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-12 px-6 rounded-2xl shrink-0 gap-2 border-emerald-300 bg-white text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50 text-base font-semibold shadow-sm"
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <LayoutDashboard className="h-5 w-5" />
              <span>Admin</span>
            </Link>
          ) : currentUser ? (
            <Link
              href="/account"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-12 px-6 rounded-2xl shrink-0 gap-2 bg-slate-900 text-white hover:bg-slate-700 text-base font-semibold shadow-sm"
              )}
            >
              <User className="h-5 w-5" />
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-12 px-6 rounded-2xl shrink-0 gap-2 bg-slate-900 text-white hover:bg-slate-700 text-base font-semibold shadow-sm"
              )}
            >
              <LogIn className="h-5 w-5" />
              Login
            </Link>
          )}
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-6 py-4">
          {/* Logo on the left */}
          <div className="shrink-0">
            <Link href="/" className="inline-flex items-center">
              <img src="/logo.png" alt="BikeHub Logo" className="h-32 sm:h-40 w-auto object-contain" />
            </Link>
          </div>

          {/* Search bar + nav stacked on the right */}
          <div className="min-w-0 flex-1 flex flex-col gap-3">
            {/* Search Bar */}
            <div className="w-full">
              <UniversalSearch />
            </div>

            {/* Navigation links */}
            <div className="overflow-x-auto pb-1">
              <nav className="flex items-center gap-3">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: item.highlight ? "default" : "ghost" }),
                        "h-11 px-5 rounded-xl shrink-0 gap-2.5 text-base font-semibold transition-all duration-200",
                        item.highlight
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/30 animate-pulse hover:shadow-lg hover:shadow-orange-500/30 hover:from-amber-400 hover:to-orange-500"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
