'use client';

import * as React from 'react';
import { AreaChart, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, BatteryCharging, DollarSign, Flame, Box, ClipboardCheck, ArrowRight } from 'lucide-react';

export default function DashboardClient({
  stats,
  pendingPipeline,
  lowStockParts,
  chartFunnel,
  chartCategories,
}: {
  stats: any;
  pendingPipeline: any[];
  lowStockParts: any[];
  chartFunnel: any[];
  chartCategories: any[];
}) {
  const PIE_COLORS = ['#94a3b8', '#f59e0b', '#10b981']; // Draft, Pending, Certified

  return (
    <div className="p-8 lg:ml-64 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Mission Control</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Aggregated platform overview covering inventory and operations.</p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Marketplace Value</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Tk {stats.totalValue.toLocaleString()}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 border-b-4 border-b-amber-500">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-xl">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Certification Queue</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.queueCount} Pending</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 border-b-4 border-b-cyan-500">
          <div className="p-4 bg-cyan-100 text-cyan-600 rounded-xl">
            <BatteryCharging size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">EV Fleet Density</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.fleetMix.ev}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4 border-b-4 border-b-orange-500">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-xl">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ICE Fleet Density</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.fleetMix.ice}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Pipeline & Data Visuals */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Visuals Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Inventory Value by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartCategories}>
                    <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Certification Funnel</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartFunnel} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                      {chartFunnel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 text-xs font-medium text-slate-500 mt-2">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Draft</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Pending</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Certified</div>
                </div>
              </div>
            </div>
          </div>

          {/* Certification Pipeline */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Certification Pipeline</h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">View All <ArrowRight size={14} /></button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-medium">Vehicle</th>
                  <th className="px-6 py-4 font-medium">Submitted</th>
                  <th className="px-6 py-4 font-medium">Status / Score</th>
                  <th className="px-6 py-4 font-medium">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {pendingPipeline.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No vehicles pending certification.</td></tr>
                ) : (
                  pendingPipeline.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-white">{v.model || v.name || 'Unknown Model'}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{v.vin || v.chassis || 'No VIN'}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          {v.inspection?.status || 'Processing'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {/* Fallback to tech since assigned field might not exist strictly */}
                            {v.inspection?.technicianId ? 'T' : '?'}
                          </div>
                          <span className="text-slate-600 dark:text-slate-300">{v.inspection?.technicianId || 'Unassigned'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Alerts */}
        <div className="space-y-8">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-400">Low Stock Alert Center</h3>
            </div>
            
            <div className="space-y-4">
              {lowStockParts.length === 0 ? (
                <p className="text-red-700 dark:text-red-400 text-sm">Inventory health is nominal.</p>
              ) : (
                lowStockParts.map((p) => (
                  <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-100 dark:border-red-900/50 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-200 text-sm">{p.name}</h4>
                      <p className="text-slate-500 text-xs mt-0.5">{p.sku}</p>
                    </div>
                    <div className="text-center">
                      <span className="block text-xl font-bold text-red-600">{p.stock}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Left</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="w-full mt-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
              Reorder Critical Items
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
