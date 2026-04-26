import Link from "next/link";
import { CarFront, Package } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const marketplaceSections = [
  {
    title: "Parts Inventory",
    description: "Manage spare parts, accessories, and additives powering the public marketplace.",
    href: "/admin/marketplace/parts",
    icon: Package,
    tone: "from-blue-500/15 to-cyan-500/10 border-blue-200/70",
  },
  {
    title: "Used Vehicles",
    description: "Manage used vehicle listings and control promoted / certified sections.",
    href: "/admin/marketplace/used-vehicles",
    icon: CarFront,
    tone: "from-emerald-500/15 to-teal-500/10 border-emerald-200/70",
  },
];

export default async function MarketplaceAdminPage() {
  const [partCount, vehicleCount, certifiedCount, promotedCount] = await Promise.all([
    db.part.count(),
    db.vehicle.count(),
    db.vehicle.count({
      where: { certificationStatus: "CERTIFIED" },
    }),
    db.vehicle.count({
      where: { certificationStatus: "PROMOTED" },
    }),
  ]);

  return (
    <div className="space-y-8 p-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 bg-white/90">
          <CardHeader className="pb-2">
            <CardDescription>Tracked Parts</CardDescription>
            <CardTitle className="text-3xl text-slate-900">{partCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white/90">
          <CardHeader className="pb-2">
            <CardDescription>Used Vehicles</CardDescription>
            <CardTitle className="text-3xl text-slate-900">{vehicleCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white/90">
          <CardHeader className="pb-2">
            <CardDescription>Certified</CardDescription>
            <CardTitle className="text-3xl text-emerald-700">{certifiedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-slate-200 bg-white/90">
          <CardHeader className="pb-2">
            <CardDescription>Promoted</CardDescription>
            <CardTitle className="text-3xl text-amber-700">{promotedCount}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {marketplaceSections.map((section) => {
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
