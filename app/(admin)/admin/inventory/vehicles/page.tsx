import { db } from '@/lib/db';
import * as React from 'react';
import { AddVehicleModal } from './add-vehicle-modal';
import { EditVehicleModal } from './edit-vehicle-modal';
import { VehicleStatusActions } from './vehicle-status-actions';
import { extractUsedVehicleRegistration, formatUsedVehicleDate } from '@/lib/used-vehicles';

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  APPROVED: { label: 'User Listed', bg: 'bg-slate-100', text: 'text-slate-700' },
  PROMOTED: { label: 'Promoted', bg: 'bg-amber-100', text: 'text-amber-800' },
  CERTIFIED: { label: 'Certified', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  PENDING_APPROVAL: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

export default async function VehiclesPage() {
  const vehicles = await db.vehicle.findMany({
    include: { brand: true, inspection: true },
    orderBy: { createdAt: 'desc' },
  });

  const certifiedCount = vehicles.filter((v) => v.certificationStatus === 'CERTIFIED').length;
  const promotedCount = vehicles.filter((v) => v.certificationStatus === 'PROMOTED').length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Used Vehicles</h2>
          <p className="text-slate-500">
            {vehicles.length} total · {certifiedCount} certified · {promotedCount} promoted
          </p>
        </div>
        <AddVehicleModal />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Model</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Registration</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Inspection</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Added</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {vehicles.map((v) => {
              const registration = extractUsedVehicleRegistration(v.summary);
              const config = statusConfig[v.certificationStatus] ?? statusConfig.APPROVED;

              return (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">
                    <div>{v.brand?.name ?? 'BikeHub'} {v.model ?? v.name ?? '—'}</div>
                    <div className="text-xs text-slate-500">{v.powertrain} • {v.category ?? 'Commuter'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="font-medium text-slate-800">{registration.registrationStatus}</div>
                    {registration.registrationNumber ? (
                      <div>{registration.registrationNumber}</div>
                    ) : (
                      <div>On test ride setup</div>
                    )}
                    {registration.registrationValidityPeriod ? (
                      <div className="text-xs text-slate-400">
                        Valid until {formatUsedVehicleDate(registration.registrationValidityPeriod)}
                      </div>
                    ) : null}
                    {registration.purchaseDate ? (
                      <div className="text-xs text-slate-400">
                        Purchased on {formatUsedVehicleDate(registration.purchaseDate)}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">{v.inspection?.status ?? 'Not inspected'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <EditVehicleModal vehicle={{
                        id: v.id,
                        brand: v.brand?.name ?? '',
                        model: v.model ?? '',
                        category: v.category ?? 'Commuter',
                        powertrain: v.powertrain,
                        priceBdt: v.priceBdt ?? undefined,
                        askingPrice: v.askingPrice ?? undefined,
                        summary: v.summary ?? '',
                        displacementCc: v.displacementCc ?? undefined,
                        motorPowerKw: v.motorPowerKw ?? undefined,
                        topSpeedKph: v.topSpeedKph ?? undefined,
                        mileageKmpl: v.mileageKmpl ?? undefined,
                        rangeKm: v.rangeKm ?? undefined,
                        fuelTankLiters: v.fuelTankLiters ?? undefined,
                        gearbox: v.gearbox ?? undefined,
                        torqueNm: v.torqueNm ?? undefined,
                        weightKg: v.weightKg ?? undefined,
                        seatHeightMm: v.seatHeightMm ?? undefined,
                        wheelbaseMm: v.wheelbaseMm ?? undefined,
                        groundClearanceMm: v.groundClearanceMm ?? undefined,
                        frontTyre: v.frontTyre ?? undefined,
                        rearTyre: v.rearTyre ?? undefined,
                        images: v.images ?? undefined,
                        certificationStatus: v.certificationStatus,
                      }} />
                      <VehicleStatusActions
                        vehicleId={v.id}
                        currentStatus={v.certificationStatus}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  No vehicles yet. Add your first used vehicle listing above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
