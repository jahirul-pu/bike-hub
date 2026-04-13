import Link from "next/link";
import { ClipboardCheck, Bike } from "lucide-react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CertificationPage() {
  const pendingVehicles = await db.vehicle.findMany({
    where: { certificationStatus: "PENDING_APPROVAL" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-6 p-8">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Certification Lab</h1>
            <p className="text-sm text-slate-600">A landing page for certification operations until the detailed workflow is rebuilt.</p>
          </div>
        </div>
      </header>

      <Card className="border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="text-slate-900">Pending Queue</CardTitle>
          <CardDescription>Recent vehicles waiting for approval.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingVehicles.length > 0 ? (
            pendingVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Bike className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">{vehicle.model ?? vehicle.name ?? "Unnamed vehicle"}</p>
                    <p className="text-xs text-slate-500">{vehicle.vin ?? vehicle.chassis ?? "VIN/chassis pending"}</p>
                  </div>
                </div>
                <Link href="/admin/inventory/vehicles" className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline">
                  Open vehicle hub
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600">No vehicles are currently waiting for certification.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
