'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import type { Bike } from '@/lib/bikes-data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createBikeCatalogEntry, updateBikeCatalogEntry } from './actions';

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: number;
}) {
  const spanClass = span === 3 ? 'md:col-span-3' : span === 2 ? 'md:col-span-2' : '';
  return (
    <div className={`space-y-1 ${spanClass}`}>
      <label className="text-xs font-semibold uppercase text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  color = 'blue',
}: {
  title: string;
  color?: 'blue' | 'emerald' | 'purple' | 'rose' | 'cyan' | 'amber' | 'indigo' | 'orange' | 'teal';
}) {
  const map: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500', border: 'border-slate-200', text: '' },
    emerald: { bg: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-600' },
    rose: { bg: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-600' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-200', text: 'text-cyan-600' },
    amber: { bg: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-600' },
    indigo: { bg: 'bg-indigo-500', border: 'border-indigo-200', text: 'text-indigo-600' },
    orange: { bg: 'bg-orange-500', border: 'border-orange-200', text: 'text-orange-600' },
    teal: { bg: 'bg-teal-500', border: 'border-teal-200', text: 'text-teal-600' },
  };
  const tone = map[color] ?? map.blue;

  return (
    <div className={`mb-2 mt-4 flex items-center gap-2 border-b pb-2 md:col-span-3 ${tone.border}`}>
      <div className={`h-4 w-1.5 rounded-full ${tone.bg}`} />
      <h3 className={`text-xs font-semibold uppercase tracking-widest text-slate-800 ${tone.text}`}>{title}</h3>
    </div>
  );
}

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';

function BikeForm({
  bike,
  onSubmit,
  loading,
  submitLabel,
}: {
  bike?: Bike;
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  submitLabel: string;
}) {
  const [powertrain, setPowertrain] = useState<'ICE' | 'EV'>(bike?.powertrain ?? 'ICE');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
  }

  const textValue = (value: string | number | undefined | null) => (value != null && value !== '' ? String(value) : undefined);
  const numberValue = (value: number | undefined | null) => (value != null ? String(value) : undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-4">
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
        <SectionHeader title="1. Basic Information" color="blue" />

        <Field label="Brand">
          <input required name="brand" defaultValue={textValue(bike?.brand)} placeholder="Yamaha" className={inputClass} />
        </Field>
        <Field label="Model">
          <input required name="model" defaultValue={textValue(bike?.model)} placeholder="R15 V4" className={inputClass} />
        </Field>
        <Field label="Category">
          <select name="category" defaultValue={bike?.category ?? 'Commuter'} className={inputClass}>
            <option value="Commuter">Commuter</option>
            <option value="Sport">Sport</option>
            <option value="Adventure">Adventure</option>
            <option value="Scooter">Scooter</option>
          </select>
        </Field>
        <Field label="Powertrain">
          <select
            name="powertrain"
            value={powertrain}
            onChange={(event) => setPowertrain(event.target.value as 'ICE' | 'EV')}
            className={inputClass}
          >
            <option value="ICE">ICE</option>
            <option value="EV">EV</option>
          </select>
        </Field>
        <Field label="Price (BDT)">
          <input type="number" required name="priceBdt" defaultValue={numberValue(bike?.priceBdt)} className={inputClass} />
        </Field>
        <Field label="Summary" span={3}>
          <textarea
            name="summary"
            required
            defaultValue={textValue(bike?.summary)}
            placeholder="Describe the bike for the catalog listing..."
            className={`${inputClass} h-16`}
          />
        </Field>

        <SectionHeader title={powertrain === 'ICE' ? '2. Engine & Performance' : '2. Motor & Performance'} color="rose" />

        <Field label="Top Speed (km/h)">
          <input type="number" required name="topSpeedKph" defaultValue={numberValue(bike?.topSpeedKph)} className={inputClass} />
        </Field>
        <Field label="Torque (Nm)">
          <input type="number" step="0.1" required name="torqueNm" defaultValue={numberValue(bike?.torqueNm)} className={inputClass} />
        </Field>

        {powertrain === 'ICE' ? (
          <>
            <Field label="Displacement (CC)">
              <input type="number" step="0.1" name="displacementCc" defaultValue={numberValue(bike?.displacementCc)} className={inputClass} />
            </Field>
            <Field label="Mileage (km/l)">
              <input type="number" step="0.1" name="mileageKmpl" defaultValue={numberValue(bike?.mileageKmpl)} className={inputClass} />
            </Field>
            <Field label="Fuel Tank (Liters)">
              <input type="number" step="0.1" name="fuelTankLiters" defaultValue={numberValue(bike?.fuelTankLiters)} className={inputClass} />
            </Field>
            <Field label="Gearbox">
              <select name="gearbox" defaultValue={bike?.gearbox ?? '5-speed'} className={inputClass}>
                <option value="4-speed">4-speed</option>
                <option value="5-speed">5-speed</option>
                <option value="6-speed">6-speed</option>
                <option value="CVT">CVT (Scooter)</option>
              </select>
            </Field>
          </>
        ) : (
          <>
            <Field label="Rated Power (kW)">
              <input type="number" step="0.1" name="motorPowerKw" defaultValue={numberValue(bike?.motorPowerKw)} className={inputClass} />
            </Field>
            <Field label="Peak Power (kW)">
              <input type="number" step="0.1" name="peakPowerKw" defaultValue={numberValue(bike?.peakPowerKw)} className={inputClass} />
            </Field>
            <Field label="Range (km)">
              <input type="number" step="0.1" name="rangeKm" defaultValue={numberValue(bike?.rangeKm)} className={inputClass} />
            </Field>
          </>
        )}

        {powertrain === 'EV' && (
          <>
            <SectionHeader title="3. Battery & Charging" color="emerald" />

            <Field label="Battery Type">
              <select name="batteryType" defaultValue={bike?.batteryType ?? 'Lithium-ion'} className={inputClass}>
                <option value="Lithium-ion">Lithium-ion</option>
                <option value="LFP">LFP (LiFePO4)</option>
                <option value="Lead-acid">Lead-acid</option>
                <option value="NMC">NMC</option>
              </select>
            </Field>
            <Field label="Voltage (V)">
              <input type="number" step="0.1" name="voltageV" defaultValue={numberValue(bike?.voltageV)} className={inputClass} />
            </Field>
            <Field label="Amp-Hours (Ah)">
              <input type="number" step="0.1" name="ampHours" defaultValue={numberValue(bike?.ampHours)} className={inputClass} />
            </Field>
            <Field label="Charging Time (0-100%)">
              <input type="text" name="chargingTime0100" defaultValue={textValue(bike?.chargingTime0100)} className={inputClass} />
            </Field>
            <Field label="Battery Cycle Life">
              <input type="text" name="batteryCycleLife" defaultValue={textValue(bike?.batteryCycleLife)} className={inputClass} />
            </Field>
            <Field label="IP Rating">
              <select name="ipRating" defaultValue={bike?.ipRating ?? 'IP67'} className={inputClass}>
                <option value="IP54">IP54</option>
                <option value="IP65">IP65</option>
                <option value="IP67">IP67</option>
                <option value="IP68">IP68</option>
              </select>
            </Field>
          </>
        )}

        <SectionHeader title={`${powertrain === 'EV' ? '4' : '3'}. Dimensions & Weight`} color="purple" />

        <Field label="Kerb Weight (kg)">
          <input type="number" step="0.1" required name="weightKg" defaultValue={numberValue(bike?.weightKg)} className={inputClass} />
        </Field>
        <Field label="Seat Height (mm)">
          <input type="number" step="0.1" required name="seatHeightMm" defaultValue={numberValue(bike?.seatHeightMm)} className={inputClass} />
        </Field>
        <Field label="Ground Clearance (mm)">
          <input type="number" step="0.1" required name="groundClearanceMm" defaultValue={numberValue(bike?.groundClearanceMm)} className={inputClass} />
        </Field>
        <Field label="Wheelbase (mm)">
          <input type="number" step="0.1" required name="wheelbaseMm" defaultValue={numberValue(bike?.wheelbaseMm)} className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <>
            <Field label="Length (mm)">
              <input type="number" step="0.1" name="lengthMm" defaultValue={numberValue(bike?.lengthMm)} className={inputClass} />
            </Field>
            <Field label="Width (mm)">
              <input type="number" step="0.1" name="widthMm" defaultValue={numberValue(bike?.widthMm)} className={inputClass} />
            </Field>
            <Field label="Height (mm)">
              <input type="number" step="0.1" name="heightMm" defaultValue={numberValue(bike?.heightMm)} className={inputClass} />
            </Field>
            <Field label="Underseat Storage">
              <input type="text" name="underseatStorage" defaultValue={textValue(bike?.underseatStorage)} className={inputClass} />
            </Field>
          </>
        )}

        <SectionHeader title={`${powertrain === 'EV' ? '5' : '4'}. Brakes, Suspension & Tyres`} color="cyan" />

        <Field label="Front Tyre Size">
          <input type="text" required name="frontTyre" defaultValue={textValue(bike?.frontTyre)} className={inputClass} />
        </Field>
        <Field label="Rear Tyre Size">
          <input type="text" required name="rearTyre" defaultValue={textValue(bike?.rearTyre)} className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <>
            <Field label="Front Brake">
              <input type="text" name="frontBrake" defaultValue={textValue(bike?.frontBrake)} className={inputClass} />
            </Field>
            <Field label="Rear Brake">
              <input type="text" name="rearBrake" defaultValue={textValue(bike?.rearBrake)} className={inputClass} />
            </Field>
            <Field label="ABS / CBS">
              <select name="absType" defaultValue={bike?.absType ?? 'CBS'} className={inputClass}>
                <option value="None">None</option>
                <option value="CBS">CBS</option>
                <option value="Single Channel">Single Channel ABS</option>
                <option value="Dual Channel">Dual Channel ABS</option>
              </select>
            </Field>
            <Field label="Front Suspension">
              <input type="text" name="frontSuspension" defaultValue={textValue(bike?.frontSuspension)} className={inputClass} />
            </Field>
            <Field label="Rear Suspension">
              <input type="text" name="rearSuspension" defaultValue={textValue(bike?.rearSuspension)} className={inputClass} />
            </Field>
          </>
        )}

        {powertrain === 'EV' && (
          <>
            <SectionHeader title="6. Smart Features & Security" color="indigo" />

            <Field label="Riding Modes">
              <input type="text" name="ridingModes" defaultValue={textValue(bike?.ridingModes)} className={inputClass} />
            </Field>
            <Field label="Security Features">
              <input type="text" name="securityFeatures" defaultValue={textValue(bike?.securityFeatures)} className={inputClass} />
            </Field>
            <Field label="App Support">
              <input type="text" name="appSupport" defaultValue={textValue(bike?.appSupport)} className={inputClass} />
            </Field>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          disabled={loading}
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function AddBikeModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      await createBikeCatalogEntry(formData);
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to add bike');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/bikes"
        target="_blank"
        className="flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
      >
        <ExternalLink size={14} />
        View Frontend Bikes
      </Link>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
          <Plus size={18} />
          Add Bike
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Add Bike to Catalog</DialogTitle>
            <DialogDescription className="text-slate-500">
              Add a bike model with full specifications. This populates the frontend <strong>/bikes</strong> page.
            </DialogDescription>
          </DialogHeader>
          <BikeForm onSubmit={handleCreate} loading={loading} submitLabel="Add to Bike Catalog" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EditBikeModal({ bike }: { bike: Bike }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    try {
      formData.append('originalSlug', bike.slug);
      await updateBikeCatalogEntry(formData);
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update bike');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
        title="Edit"
      >
        <Pencil size={15} />
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Edit - {bike.brand} {bike.model}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Modify specifications. Changes update the frontend <strong>/bikes/{bike.slug}</strong> page.
          </DialogDescription>
        </DialogHeader>
        <BikeForm bike={bike} onSubmit={handleUpdate} loading={loading} submitLabel="Save Changes" />
      </DialogContent>
    </Dialog>
  );
}
