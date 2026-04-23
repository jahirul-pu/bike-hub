import { db } from '@/lib/db';
import * as React from 'react';
import { AddVehicleModal } from './add-vehicle-modal';
import { extractUsedVehicleRegistration, formatUsedVehicleDate } from '@/lib/used-vehicles';

export default async function VehiclesPage() {
  const pendingBikes = await db.vehicle.findMany({
    where: { certificationStatus: 'PENDING_APPROVAL' },
    include: { brand: true, inspection: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Used Vehicles</h2>
          <p className="text-slate-500">Marketplace vehicles awaiting certification approval</p>
        </div>
        <AddVehicleModal />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Model</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Registration</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Inspection</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Submitted</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pendingBikes.map((v) => {
              const registration = extractUsedVehicleRegistration(v.summary);

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
                  </td>
                  <td className="px-6 py-4">{v.inspection?.status ?? 'Not inspected'}</td>
                  <td className="px-6 py-4">{v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Approve</button>
                      <button className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm">Reject</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
