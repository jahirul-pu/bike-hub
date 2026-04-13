"use client"

import * as React from "react"
import Link from "next/link"
import { LayoutDashboard, Bike, Package, ClipboardCheck, ShoppingCart } from "lucide-react"

const navItems: { name: string; href: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Parts Inventory", href: "/admin/inventory/parts", icon: Package },
  { name: "Vehicle Hub", href: "/admin/inventory/vehicles", icon: Bike },
  { name: "Certification Lab", href: "/admin/certification", icon: ClipboardCheck },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
]

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-4 border-r border-slate-800">
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
    </aside>
  )
}
