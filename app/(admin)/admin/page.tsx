import Link from "next/link";
import { Bike, CarFront, Package, ShoppingCart, Tags } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const adminSections = [
  {
    title: "Bike Catalog",
    description: "Edit the models and specs that power the public /bikes frontend pages.",
    href: "/admin/inventory/bikes",
    icon: Bike,
    tone: "from-sky-500/15 to-blue-500/10 border-sky-200/70",
  },
  {
    title: "Vehicle Hub",
    description: "Review marketplace/certification listings separately from the frontend bike catalog.",
    href: "/admin/inventory/vehicles",
    icon: CarFront,
    tone: "from-emerald-500/15 to-teal-500/10 border-emerald-200/70",
  },
  {
    title: "Parts Inventory",
    description: "Track stock levels for gear, accessories, and EV components.",
    href: "/admin/inventory/parts",
    icon: Package,
    tone: "from-blue-500/15 to-cyan-500/10 border-blue-200/70",
  },
  {
    title: "Brands",
    description: "Manage supported manufacturers and powertrain coverage.",
    href: "/admin/brands",
    icon: Tags,
    tone: "from-amber-500/15 to-orange-500/10 border-amber-200/70",
  },
  {
    title: "Orders",
    description: "Check order operations and prepare the next admin workflow.",
    href: "/admin/orders",
    icon: ShoppingCart,
    tone: "from-slate-500/15 to-slate-400/10 border-slate-200/80",
  },
];

export default async function AdminDashboardPage() {
  const [brandCount, partCount, vehicleCount, pendingVehicleCount] = await Promise.all([
    db.brand.count(),
    db.part.count(),
    db.vehicle.count(),
    db.vehicle.count({
      where: { certificationStatus: "PENDING_APPROVAL" },
    }),
  ]);

  return (
    <div className="space-y-8 p-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Admin</p>
        <h1 className="font-heading text-4xl uppercase tracking-wide text-slate-900">Operations Dashboard</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          The `/admin` route now has its own landing page. Use it as the entry point for inventory,
          brands, and order operations.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-white/90">
          <CardHeader className="pb-2">
            <CardDescription>Registered Brands</CardDescription>
            <CardTitle className="text-3xl text-slate-900">{brandCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white/90">
          <CardHeader className="pb-2">
            <CardDescription>Tracked Parts</CardDescription>
            <CardTitle className="text-3xl text-slate-900">{partCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white/90">
          <CardHeader className="pb-2">
            <CardDescription>Total Vehicles</CardDescription>
            <CardTitle className="text-3xl text-slate-900">{vehicleCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white/90">
          <CardHeader className="pb-2">
            <CardDescription>Pending Certification</CardDescription>
            <CardTitle className="text-3xl text-slate-900">{pendingVehicleCount}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;

          return (
            <Link key={section.href} href={section.href} className="block">
              <Card
                className={`h-full border bg-gradient-to-br ${section.tone} transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg`}
              >
                <CardHeader className="space-y-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-slate-900">{section.title}</CardTitle>
                    <CardDescription className="text-sm text-slate-600">
                      {section.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-semibold text-slate-900">Open section</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
