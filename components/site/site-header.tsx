import Link from "next/link";
import { Bike, Calculator, ListChecks, LogIn, ShoppingBag, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Bike },
  { href: "/bikes", label: "Bikes", icon: ListChecks },
  { href: "/compare", label: "Compare", icon: ListChecks },
  { href: "/showrooms", label: "Showroom", icon: Store },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-sm font-black text-slate-900">
              BH
            </span>
            <div className="leading-tight">
              <p className="font-heading text-xl uppercase tracking-wider text-slate-900">Bike Hub</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Specs and Comparison</p>
            </div>
          </Link>

          <Link
            href="/login"
            className={cn(buttonVariants(), "bg-slate-900 text-white hover:bg-slate-700")}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </div>

        <nav className="-mx-2 mb-2 flex items-center gap-2 overflow-x-auto px-2 pb-2 md:mb-0 md:justify-center md:overflow-visible md:pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "shrink-0 gap-2 text-slate-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
