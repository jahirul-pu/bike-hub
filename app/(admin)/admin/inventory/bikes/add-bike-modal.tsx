'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { Plus, Pencil, ExternalLink, ImagePlus, X, Upload } from 'lucide-react';
import Link from 'next/link';
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

/* ─── Reusable field wrapper ─── */
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
      <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
      {children}
    </div>
  );
}

/* ─── Section header ─── */
function SectionHeader({
  title,
  color = 'blue',
}: {
  title: string;
  color?: 'blue' | 'emerald' | 'purple' | 'rose' | 'cyan' | 'amber' | 'indigo' | 'orange' | 'teal';
}) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    blue:    { bg: 'bg-blue-500',    text: '',                                          border: 'border-slate-200 dark:border-slate-700' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400',   border: 'border-emerald-200 dark:border-emerald-900/50' },
    purple:  { bg: 'bg-purple-500',  text: 'text-purple-600 dark:text-purple-400',     border: 'border-purple-200 dark:border-purple-900/50' },
    rose:    { bg: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400',         border: 'border-rose-200 dark:border-rose-900/50' },
    cyan:    { bg: 'bg-cyan-500',    text: 'text-cyan-600 dark:text-cyan-400',         border: 'border-cyan-200 dark:border-cyan-900/50' },
    amber:   { bg: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',       border: 'border-amber-200 dark:border-amber-900/50' },
    indigo:  { bg: 'bg-indigo-500',  text: 'text-indigo-600 dark:text-indigo-400',     border: 'border-indigo-200 dark:border-indigo-900/50' },
    orange:  { bg: 'bg-orange-500',  text: 'text-orange-600 dark:text-orange-400',     border: 'border-orange-200 dark:border-orange-900/50' },
    teal:    { bg: 'bg-teal-500',    text: 'text-teal-600 dark:text-teal-400',         border: 'border-teal-200 dark:border-teal-900/50' },
  };
  const m = map[color] ?? map.blue;

  return (
    <div className={`md:col-span-3 pb-2 mt-4 mb-2 border-b ${m.border} flex items-center gap-2`}>
      <div className={`w-1.5 h-4 ${m.bg} rounded-full`}></div>
      <h3 className={`font-semibold text-slate-800 dark:text-slate-200 uppercase text-xs tracking-widest ${m.text}`}>
        {title}
      </h3>
    </div>
  );
}

const inputClass = 'w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-sm';

/* ════════════════════════════════════════════════════════════════
   BIKE FORM — shared between Add and Edit
   ════════════════════════════════════════════════════════════════ */
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
  const [images, setImages] = useState<string[]>(bike?.images ?? []);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addImageUrl() {
    const url = urlInput.trim();
    if (url && !images.includes(url)) {
      setImages((prev) => [...prev, url]);
      setUrlInput('');
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setImages((prev) => [...prev, data.path]);
        }
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Append images as JSON
    formData.set('images', JSON.stringify(images));
    await onSubmit(formData);
  }

  const d = (v: string | number | undefined | null) => (v != null && v !== '' ? String(v) : undefined);
  const n = (v: number | undefined | null) => (v != null ? String(v) : undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-4 animate-in fade-in slide-in-from-top-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">

        {/* ═══ 1. BASIC INFORMATION ═══ */}
        <SectionHeader title="1. Basic Information" color="blue" />

        <Field label="Brand">
          <input required name="brand" defaultValue={d(bike?.brand)} placeholder="e.g. Yamaha" className={inputClass} />
        </Field>
        <Field label="Model">
          <input required name="model" defaultValue={d(bike?.model)} placeholder="e.g. R15 V4" className={inputClass} />
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
            onChange={(e) => setPowertrain(e.target.value as 'ICE' | 'EV')}
            className={inputClass}
          >
            <option value="ICE">ICE</option>
            <option value="EV">EV</option>
          </select>
        </Field>
        <Field label="Price (BDT)">
          <input type="number" required name="priceBdt" defaultValue={n(bike?.priceBdt)} placeholder="e.g. 500000" className={inputClass} />
        </Field>
        <Field label="Summary" span={3}>
          <textarea name="summary" required defaultValue={d(bike?.summary)} placeholder="Describe the bike for the catalog listing..." className={`${inputClass} h-16`} />
        </Field>

        {/* ═══ IMAGES ═══ */}
        <SectionHeader title="Images" color="orange" />

        <div className="md:col-span-3 space-y-3">
          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
          >
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              {uploading ? 'Uploading...' : 'Click to upload images'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG, WebP — max 5MB each</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* URL input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
              placeholder="Or paste an image URL..."
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <ImagePlus size={16} /> Add
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((src, i) => (
                <div key={`${src}-${i}`} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-[4/3]">
                  <img
                    src={src}
                    alt={`Bike image ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/file.svg'; }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {src.split('/').pop()}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400">{images.length} image{images.length !== 1 ? 's' : ''} added</p>
        </div>

        {/* ═══ 2. ENGINE / MOTOR & PERFORMANCE ═══ */}
        <SectionHeader title={powertrain === 'ICE' ? '2. Engine & Performance' : '2. Motor & Performance'} color="rose" />

        <Field label="Top Speed (km/h)">
          <input type="number" required name="topSpeedKph" defaultValue={n(bike?.topSpeedKph)} placeholder="120" className={inputClass} />
        </Field>
        <Field label="Torque (Nm)">
          <input type="number" step="0.1" required name="torqueNm" defaultValue={n(bike?.torqueNm)} placeholder="14.2" className={inputClass} />
        </Field>

        {powertrain === 'ICE' ? (
          <>
            <Field label="Displacement (CC)">
              <input type="number" step="0.1" name="displacementCc" defaultValue={n(bike?.displacementCc)} placeholder="155" className={inputClass} />
            </Field>
            <Field label="Mileage (km/l)">
              <input type="number" step="0.1" name="mileageKmpl" defaultValue={n(bike?.mileageKmpl)} placeholder="45" className={inputClass} />
            </Field>
            <Field label="Fuel Tank (Liters)">
              <input type="number" step="0.1" name="fuelTankLiters" defaultValue={n(bike?.fuelTankLiters)} placeholder="11" className={inputClass} />
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
              <input type="number" step="0.1" name="motorPowerKw" defaultValue={n(bike?.motorPowerKw)} placeholder="5" className={inputClass} />
            </Field>
            <Field label="Peak Power (kW)">
              <input type="number" step="0.1" name="peakPowerKw" defaultValue={n(bike?.peakPowerKw)} placeholder="6.25" className={inputClass} />
            </Field>
            <Field label="Range (km)">
              <input type="number" step="0.1" name="rangeKm" defaultValue={n(bike?.rangeKm)} placeholder="150" className={inputClass} />
            </Field>
          </>
        )}

        {/* ═══ 3. EV-SPECIFIC: BATTERY & CHARGING ═══ */}
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
              <input type="number" step="0.1" name="voltageV" defaultValue={n(bike?.voltageV)} placeholder="72" className={inputClass} />
            </Field>
            <Field label="Amp-Hours (Ah)">
              <input type="number" step="0.1" name="ampHours" defaultValue={n(bike?.ampHours)} placeholder="40" className={inputClass} />
            </Field>
            <Field label="Charging Time (0-100%)">
              <input type="text" name="chargingTime0100" defaultValue={d(bike?.chargingTime0100)} placeholder="e.g. 5h 30m" className={inputClass} />
            </Field>
            <Field label="Battery Cycle Life (N.B: at 25°C Ideal Condition)">
              <input type="text" name="batteryCycleLife" defaultValue={d(bike?.batteryCycleLife)} placeholder="e.g. 1500 Cycles" className={inputClass} />
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

        {/* ═══ 4. DIMENSIONS & WEIGHT ═══ */}
        <SectionHeader title={`${powertrain === 'EV' ? '4' : '3'}. Dimensions & Weight`} color="purple" />

        <Field label="Kerb Weight (kg)">
          <input type="number" step="0.1" required name="weightKg" defaultValue={n(bike?.weightKg)} placeholder="142" className={inputClass} />
        </Field>
        <Field label="Seat Height (mm)">
          <input type="number" step="0.1" required name="seatHeightMm" defaultValue={n(bike?.seatHeightMm)} placeholder="815" className={inputClass} />
        </Field>
        <Field label="Ground Clearance (mm)">
          <input type="number" step="0.1" required name="groundClearanceMm" defaultValue={n(bike?.groundClearanceMm)} placeholder="170" className={inputClass} />
        </Field>
        <Field label="Wheelbase (mm)">
          <input type="number" step="0.1" required name="wheelbaseMm" defaultValue={n(bike?.wheelbaseMm)} placeholder="1325" className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <>
            <Field label="Length (mm)">
              <input type="number" step="0.1" name="lengthMm" defaultValue={n(bike?.lengthMm)} placeholder="1860" className={inputClass} />
            </Field>
            <Field label="Width (mm)">
              <input type="number" step="0.1" name="widthMm" defaultValue={n(bike?.widthMm)} placeholder="700" className={inputClass} />
            </Field>
            <Field label="Height (mm)">
              <input type="number" step="0.1" name="heightMm" defaultValue={n(bike?.heightMm)} placeholder="1160" className={inputClass} />
            </Field>
            <Field label="Underseat Storage">
              <input type="text" name="underseatStorage" defaultValue={d(bike?.underseatStorage)} placeholder="e.g. 22L / Helmet-fit" className={inputClass} />
            </Field>
          </>
        )}

        {/* ═══ 5. BRAKES, SUSPENSION & TYRES ═══ */}
        <SectionHeader title={`${powertrain === 'EV' ? '5' : '4'}. Brakes, Suspension & Tyres`} color="cyan" />

        <Field label="Front Tyre Size">
          <input type="text" required name="frontTyre" defaultValue={d(bike?.frontTyre)} placeholder="100/80-17" className={inputClass} />
        </Field>
        <Field label="Rear Tyre Size">
          <input type="text" required name="rearTyre" defaultValue={d(bike?.rearTyre)} placeholder="140/70-17" className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <>
            <Field label="Front Brake">
              <input type="text" name="frontBrake" defaultValue={d(bike?.frontBrake)} placeholder="e.g. Disc 220mm" className={inputClass} />
            </Field>
            <Field label="Rear Brake">
              <input type="text" name="rearBrake" defaultValue={d(bike?.rearBrake)} placeholder="e.g. Drum 130mm" className={inputClass} />
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
              <input type="text" name="frontSuspension" defaultValue={d(bike?.frontSuspension)} placeholder="e.g. Telescopic Fork" className={inputClass} />
            </Field>
            <Field label="Rear Suspension">
              <input type="text" name="rearSuspension" defaultValue={d(bike?.rearSuspension)} placeholder="e.g. Mono-shock" className={inputClass} />
            </Field>
          </>
        )}

        {/* ═══ 6. EV SMART FEATURES ═══ */}
        {powertrain === 'EV' && (
          <>
            <SectionHeader title="6. Smart Features & Security" color="indigo" />

            <Field label="Riding Modes">
              <input type="text" name="ridingModes" defaultValue={d(bike?.ridingModes)} placeholder="e.g. Eco, Normal, Sport" className={inputClass} />
            </Field>
            <Field label="Security Features">
              <input type="text" name="securityFeatures" defaultValue={d(bike?.securityFeatures)} placeholder="e.g. Geo-fencing, Anti-theft alarm, Kill switch" className={inputClass} />
            </Field>
            <Field label="App Support">
              <input type="text" name="appSupport" defaultValue={d(bike?.appSupport)} placeholder="e.g. iOS + Android, GPS tracking, OTA updates" className={inputClass} />
            </Field>
          </>
        )}

      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}


/* ════════════════════════════════════════════════════════════════
   ADD BIKE MODAL
   ════════════════════════════════════════════════════════════════ */
export function AddBikeModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      await createBikeCatalogEntry(formData);
      setOpen(false);
    } catch (err) {
      console.error(err);
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
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5 font-medium border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
      >
        <ExternalLink size={14} />
        View Frontend Bikes
      </Link>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
            <Plus size={18} /> Add Bike
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Add Bike to Catalog</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Add a bike model with full specifications. This populates the frontend <strong>/bikes</strong> page.
            </DialogDescription>
          </DialogHeader>
          <BikeForm onSubmit={handleCreate} loading={loading} submitLabel="Add to Bike Catalog" />
        </DialogContent>
      </Dialog>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   EDIT BIKE MODAL
   ════════════════════════════════════════════════════════════════ */
export function EditBikeModal({ bike }: { bike: Bike }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    try {
      formData.append('originalSlug', bike.slug);
      await updateBikeCatalogEntry(formData);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update bike');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
          <Pencil size={15} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Edit — {bike.brand} {bike.model}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Modify specifications. Changes update the frontend <strong>/bikes/{bike.slug}</strong> page.
          </DialogDescription>
        </DialogHeader>
        <BikeForm bike={bike} onSubmit={handleUpdate} loading={loading} submitLabel="Save Changes" />
      </DialogContent>
    </Dialog>
  );
}
