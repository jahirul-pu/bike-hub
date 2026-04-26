import Link from "next/link";
import { ClipboardCheck, Bike, ShieldCheck, Megaphone } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CertificationPage() {
  const [certifiedVehicles, promotedVehicles] = await Promise.all([
    db.vehicle.findMany({
      where: { certificationStatus: "CERTIFIED" },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.vehicle.findMany({
      where: { certificationStatus: "PROMOTED" },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-6 p-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Certification Lab</h1>
            <p className="text-sm text-slate-600">Overview of certified and promoted vehicle listings. Manage status from the Used Vehicles page.</p>
          </div>
        </div>
      </header>

      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="h-5 w-5" />
            BikeHub Certified
          </CardTitle>
          <CardDescription>Vehicles that passed inspection and carry the BikeHub Certified badge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {certifiedVehicles.length > 0 ? (
            certifiedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <Bike className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">{vehicle.model ?? vehicle.name ?? "Unnamed vehicle"}</p>
                    <p className="text-xs text-slate-500">{vehicle.powertrain} • {vehicle.category ?? 'Commuter'}</p>
                  </div>
                </div>
                <Link href="/admin/marketplace/used-vehicles" className="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline">
                  Manage
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No certified vehicles yet. Promote them from the Used Vehicles page.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Megaphone className="h-5 w-5" />
            Promoted
          </CardTitle>
          <CardDescription>Vehicles highlighted in the Promoted section of the marketplace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {promotedVehicles.length > 0 ? (
            promotedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <Bike className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="font-medium text-slate-900">{vehicle.model ?? vehicle.name ?? "Unnamed vehicle"}</p>
                    <p className="text-xs text-slate-500">{vehicle.powertrain} • {vehicle.category ?? 'Commuter'}</p>
                  </div>
                </div>
                <Link href="/admin/marketplace/used-vehicles" className="text-sm font-semibold text-amber-700 underline-offset-4 hover:underline">
                  Manage
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No promoted vehicles yet. Set status from the Used Vehicles page.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
