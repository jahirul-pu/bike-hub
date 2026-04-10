"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bike, Calculator, House, ListChecks, LogIn, ShoppingBag, Store } from "lucide-react";
import { CartDrawer } from "@/components/site/cart-drawer";
import { UniversalSearch } from "@/components/site/universal-search";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/bikes", label: "Bikes", icon: Bike },
  { href: "/compare", label: "Compare", icon: ListChecks },
  { href: "/showrooms", label: "Showroom", icon: Store },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
];

export function SiteHeader() {
  const navSizerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const [navWidth, setNavWidth] = useState<number | null>(null);
  const [sideWidth, setSideWidth] = useState<number | null>(null);

  useEffect(() => {
    const element = navSizerRef.current;
    if (!element) return;

    const updateNavWidth = () => {
      setNavWidth(Math.round(element.getBoundingClientRect().width));
    };

    updateNavWidth();

    const resizeObserver = new ResizeObserver(updateNavWidth);
    resizeObserver.observe(element);
    window.addEventListener("resize", updateNavWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateNavWidth);
    };
  }, []);

  useEffect(() => {
    const logoElement = logoRef.current;
    const loginElement = loginRef.current;
    if (!logoElement || !loginElement) return;

    const updateSideWidth = () => {
      const logoWidth = Math.round(logoElement.getBoundingClientRect().width);
      const loginWidth = Math.round(loginElement.getBoundingClientRect().width);
      setSideWidth(Math.max(logoWidth, loginWidth));
    };

    updateSideWidth();

    const resizeObserver = new ResizeObserver(updateSideWidth);
    resizeObserver.observe(logoElement);
    resizeObserver.observe(loginElement);
    window.addEventListener("resize", updateSideWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSideWidth);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex min-h-16 items-center gap-3 py-2">
          <div ref={logoRef} className="shrink-0" style={sideWidth ? { width: `${sideWidth}px` } : undefined}>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-sm font-black text-slate-900">
                BH
              </span>
              <div className="leading-tight">
                <p className="font-heading text-lg uppercase tracking-wider text-slate-900 sm:text-xl">Bike Hub</p>
                <p className="hidden text-[11px] uppercase tracking-[0.2em] text-slate-500 sm:block">Specs and Comparison</p>
              </div>
            </Link>
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="mx-auto max-w-full"
              style={navWidth ? { width: `${navWidth}px` } : undefined}
            >
              <UniversalSearch />
            </div>
          </div>

          <div
            ref={loginRef}
            className="shrink-0 justify-self-end"
            style={sideWidth ? { width: `${sideWidth}px` } : undefined}
          >
            <div className="float-right flex items-center gap-2">
              <CartDrawer />
              <Link
                href="/login"
                className={cn(buttonVariants(), "shrink-0 bg-slate-900 text-white hover:bg-slate-700")}
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-2 overflow-x-auto pb-2 md:mb-0 md:pb-3">
          <div ref={navSizerRef} className="mx-auto w-fit max-w-full">
            <nav className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
}
