'use client';

import * as React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createVehicle } from './actions';

const inputClass = 'w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-sm';
const accentInputClass = 'w-full px-3 py-2 border rounded-lg bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 text-sm';

export function AddVehicleModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [powertrain, setPowertrain] = useState('ICE');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createVehicle(formData);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
          <Plus size={18} /> Add Marketplace Listing
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Add Marketplace Listing</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Register a physical unit for sale on the marketplace. Each listing requires a unique VIN/chassis number and goes through certification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Vehicle Identity */}
            <div className="md:col-span-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-widest">Vehicle Identity</h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Brand</label>
              <input required name="brand" placeholder="e.g. Yamaha" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Model</label>
              <input required name="model" placeholder="e.g. R15 V4" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
              <select name="category" defaultValue="Commuter" className={inputClass}>
                <option value="Commuter">Commuter</option>
                <option value="Sport">Sport</option>
                <option value="Adventure">Adventure</option>
                <option value="Scooter">Scooter</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Powertrain</label>
              <select 
                name="powertrain" 
                value={powertrain}
                onChange={(e) => setPowertrain(e.target.value)}
                className={inputClass}
              >
                <option value="ICE">ICE</option>
                <option value="EV">EV</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Market Value (BDT)</label>
              <input type="number" required name="priceBdt" placeholder="e.g. 500000" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Top Speed (km/h)</label>
              <input type="number" required name="topSpeedKph" placeholder="120" className={inputClass} />
            </div>

            {powertrain === 'ICE' ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Displacement (CC)</label>
                  <input type="number" step="0.1" name="displacementCc" placeholder="155" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Mileage (KMPL)</label>
                  <input type="number" step="0.1" name="mileageKmpl" placeholder="45" className={inputClass} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Motor Power (kW)</label>
                  <input type="number" step="0.1" name="motorPowerKw" placeholder="5" className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Range (km)</label>
                  <input type="number" step="0.1" name="rangeKm" placeholder="150" className={inputClass} />
                </div>
              </>
            )}

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Listing Description</label>
              <textarea name="summary" required placeholder="Describe this unit's condition..." className={`${inputClass} h-16`} />
            </div>

            {/* Physical Unit Certification */}
            <div className="md:col-span-2 pb-2 mt-4 mb-2 border-b border-amber-200 dark:border-amber-900/50 flex items-center gap-2">
              <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
              <h3 className="font-semibold uppercase text-xs tracking-widest text-amber-600 dark:text-amber-400">Physical Unit Certification</h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Chassis / VIN Number</label>
              <input required name="chassis" placeholder="17-Digit Identifier" className={accentInputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Listed Asking Price</label>
              <input type="number" required name="askingPrice" placeholder="Final offer price" className={accentInputClass} />
            </div>

          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Cancel</button>
            <button 
              disabled={loading}
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all"
            >
              {loading ? "Adding..." : "Create & Send To Lab"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
