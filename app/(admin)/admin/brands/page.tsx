import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function BrandsAdminPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Brands Management</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage vehicle brands across the system.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]">
          Add Brand
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Brand Name</th>
                <th className="px-6 py-4 font-medium tracking-wider">Slug</th>
                <th className="px-6 py-4 font-medium tracking-wider">Powertrain</th>
                <th className="px-6 py-4 font-medium tracking-wider">Origin</th>
                <th className="px-6 py-4 font-medium tracking-wider">Vehicles</th>
                <th className="px-6 py-4 font-medium text-right tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-white transition-colors">{brand.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{brand.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded inline-flex text-xs font-semibold uppercase tracking-wider ${
                      brand.powertrain === 'EV' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      brand.powertrain === 'ICE' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {brand.powertrain}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{brand.origin || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 text-xs font-medium bg-slate-800 px-2 py-1 rounded-full border border-slate-700">0 Models</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 mr-4 font-medium text-sm transition-colors">Edit</button>
                    <button className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-medium text-slate-400 mb-1">No brands found</p>
                      <p className="text-sm">Add a new brand to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
