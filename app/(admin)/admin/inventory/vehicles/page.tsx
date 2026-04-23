import { db } from '@/lib/db';
import * as React from 'react';
import { AddVehicleModal } from './add-vehicle-modal';

export default async function VehiclesPage() {
  const pendingBikes = await db.vehicle.findMany({
    where: { certificationStatus: 'PENDING_APPROVAL' },
    include: { inspection: true },
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
              <th className="px-6 py-4 font-semibold text-slate-700">VIN / Chassis</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Inspection</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Submitted</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pendingBikes.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{v.model ?? v.name ?? '—'}</td>
                <td className="px-6 py-4 text-slate-500">{v.vin ?? v.chassis ?? '—'}</td>
                <td className="px-6 py-4">{v.inspection?.status ?? 'Not inspected'}</td>
                <td className="px-6 py-4">{v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Approve</button>
                    <button className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
