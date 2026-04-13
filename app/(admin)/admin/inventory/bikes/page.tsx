import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { bikes } from '@/lib/bikes-data';
import { AddBikeModal, EditBikeModal } from './add-bike-modal';

export default function BikeCatalogPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bike Catalog</h2>
          <p className="text-slate-500">
            Manage bike models and specifications shown on the{' '}
            <Link href="/bikes" target="_blank" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
              /bikes <ExternalLink size={12} />
            </Link>{' '}
            frontend page.
          </p>
        </div>
        <AddBikeModal />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Brand / Model</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Category</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Powertrain</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Price (BDT)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Key Spec</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">Frontend Link</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {bikes.map((bike) => (
              <tr key={bike.slug} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">{bike.brand}</p>
                  <p className="text-sm text-slate-500">{bike.model}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {bike.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      bike.powertrain === 'EV' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {bike.powertrain}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {new Intl.NumberFormat('en-BD').format(bike.priceBdt)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {bike.powertrain === 'ICE'
                    ? `${bike.displacementCc ?? '-'} cc · ${bike.topSpeedKph} km/h`
                    : `${bike.motorPowerKw ?? '-'} kW · ${bike.rangeKm ?? '-'} km range`}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/bikes/${bike.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View <ExternalLink size={12} />
                  </Link>
                </td>
                <td className="px-6 py-4 text-right">
                  <EditBikeModal bike={bike} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">{bikes.length} bike models in catalog</p>
    </div>
  );
}
