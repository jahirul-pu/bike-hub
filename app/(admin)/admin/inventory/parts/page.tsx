import { db } from '@/lib/db';
import { Plus } from 'lucide-react';
import * as React from 'react';

export default async function PartsPage() {
  const parts = await db.part.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Parts Inventory</h2>
          <p className="text-slate-500">Manage Motowolf gear and EV components</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Add New Part
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">Part Name</th>
              <th className="px-6 py-4 font-semibold text-slate-700">SKU</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Stock</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Price (BDT)</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">{part.name}</td>
                <td className="px-6 py-4 text-slate-500">{part.sku}</td>
                <td className={`px-6 py-4 ${part.stock < 10 ? 'text-red-500 font-bold' : ''}`}>
                  {part.stock}
                </td>
                <td className="px-6 py-4">Tk {((part.retailPrice ?? part.price) as number)?.toLocaleString?.()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${part.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {part.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
