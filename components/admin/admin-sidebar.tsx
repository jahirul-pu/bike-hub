"use client"

import * as React from "react"
import Link from "next/link"
import { CarFront, LayoutDashboard, Bike, Package, ShoppingCart, Tags, type LucideIcon } from "lucide-react"

const navItems: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Bike Catalog", href: "/admin/inventory/bikes", icon: Bike },
  { name: "Parts Inventory", href: "/admin/inventory/parts", icon: Package },
  { name: "Vehicle Hub", href: "/admin/inventory/vehicles", icon: CarFront },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Brands", href: "/admin/brands", icon: Tags },
]

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-slate-800 bg-slate-900 text-white">
      <div className="p-4">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-blue-400 tracking-wider">PLANET LORD</h1>
        <p className="text-xs text-slate-400 uppercase">Savar Hub Admin</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
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
