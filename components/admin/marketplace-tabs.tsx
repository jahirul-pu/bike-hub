"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, LayoutGrid, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const marketplaceTabs = [
  { label: "Overview", href: "/admin/marketplace", icon: LayoutGrid },
  { label: "Parts Inventory", href: "/admin/marketplace/parts", icon: Package },
  { label: "Used Vehicles", href: "/admin/marketplace/used-vehicles", icon: CarFront },
];

export default function MarketplaceTabs() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin/marketplace") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {marketplaceTabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors",
              isActive(tab.href)
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
