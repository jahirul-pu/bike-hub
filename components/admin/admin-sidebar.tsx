"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bike, CarFront, ChevronDown, LayoutDashboard, Package, ShoppingBag, ShoppingCart, Tags, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bike Catalog", href: "/admin/inventory/bikes", icon: Bike },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Brands", href: "/admin/brands", icon: Tags },
]

const marketplaceItems: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Parts Inventory", href: "/admin/marketplace/parts", icon: Package },
  { name: "Used Vehicles", href: "/admin/marketplace/used-vehicles", icon: CarFront },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const isMarketplaceActive = pathname === "/admin/marketplace" || pathname.startsWith("/admin/marketplace/")

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-slate-800 bg-slate-900 text-white">
      <div className="p-4">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-blue-400 tracking-wider">PLANET LORD</h1>
          <p className="text-xs text-slate-400 uppercase">Savar Hub Admin</p>
        </div>
        <nav className="space-y-2">
          {navItems.slice(0, 2).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive(item.href)
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}

          <Link
            href="/admin/marketplace"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              isMarketplaceActive
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <ShoppingBag size={20} />
            <span className="font-medium">Marketplace</span>
            <ChevronDown
              size={16}
              className={cn(
                "ml-auto text-slate-400 transition-transform",
                isMarketplaceActive ? "rotate-180" : ""
              )}
            />
          </Link>

          <div className="ml-6 space-y-1 border-l border-slate-800 pl-3">
            {marketplaceItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-slate-800/80 text-white"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                )}
              >
                <item.icon size={16} />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </div>

          {navItems.slice(2).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive(item.href)
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
