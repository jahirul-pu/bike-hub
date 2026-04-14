'use client';

import * as React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Bike } from '@/lib/bikes-data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createBikeCatalogEntry, deleteBikeCatalogEntry, updateBikeCatalogEntry } from './actions';

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

function YesNoSelect({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <select name={name} defaultValue={defaultValue ?? 'No'} className={inputClass}>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );
}

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
  const [imageUrls, setImageUrls] = useState<string[]>(bike?.images ?? []);
  const [newImageUrl, setNewImageUrl] = useState('');

  function addImageUrl() {
    const trimmed = newImageUrl.trim();
    if (trimmed && !imageUrls.includes(trimmed)) {
      setImageUrls((prev) => [...prev, trimmed]);
      setNewImageUrl('');
    }
  }

  function removeImageUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('images', JSON.stringify(imageUrls));
    await onSubmit(formData);
  }

  const textValue = (value: string | number | undefined | null) => (value != null && value !== '' ? String(value) : undefined);
  const numberValue = (value: number | undefined | null) => (value != null ? String(value) : undefined);

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-4">
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">

        {/* ═══════════════════════════════════════════════════
            1. BASIC INFORMATION  (shared)
        ═══════════════════════════════════════════════════ */}
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
        <Field label="Launch Year">
          <input type="number" name="launchYear" defaultValue={numberValue(bike?.launchYear)} placeholder="e.g. 2024" className={inputClass} />
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
        <Field label="Colors (comma separated)" span={3}>
          <input
            name="colors"
            defaultValue={bike?.colors?.join(', ')}
            placeholder="Pearl White, Red, Cyan, Gray"
            className={inputClass}
          />
        </Field>

        {/* ═══════════════════════════════════════════════════
            2. ENGINE / MOTOR & PERFORMANCE
        ═══════════════════════════════════════════════════ */}
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
          </>
        ) : (
          <>
            <Field label="Rated Power (kW)">
              <input type="number" step="0.1" name="motorPowerKw" defaultValue={numberValue(bike?.motorPowerKw)} className={inputClass} />
            </Field>
            <Field label="Peak Power (kW)">
              <input type="number" step="0.1" name="peakPowerKw" defaultValue={numberValue(bike?.peakPowerKw)} className={inputClass} />
            </Field>
          </>
        )}

        {/* ═══════════════════════════════════════════════════
            ICE: 3. Transmission  |  EV: 3. Battery
        ═══════════════════════════════════════════════════ */}
        {powertrain === 'ICE' ? (
          <>
            <SectionHeader title="3. Transmission" color="emerald" />

            <Field label="Gearbox">
              <select name="gearbox" defaultValue={bike?.gearbox ?? '5-speed'} className={inputClass}>
                <option value="4-speed">4-speed</option>
                <option value="5-speed">5-speed</option>
                <option value="6-speed">6-speed</option>
                <option value="CVT">CVT (Scooter)</option>
              </select>
            </Field>
            <Field label="Clutch Type">
              <input type="text" name="clutchType" defaultValue={textValue(bike?.clutchType)} placeholder="e.g. Wet multi-plate" className={inputClass} />
            </Field>
            <Field label="Final Drive">
              <select name="finalDrive" defaultValue={bike?.finalDrive ?? 'Chain'} className={inputClass}>
                <option value="Chain">Chain</option>
                <option value="Belt">Belt</option>
                <option value="Shaft">Shaft</option>
              </select>
            </Field>

            <SectionHeader title="4. Fuel & Efficiency" color="amber" />

            <Field label="Fuel Type">
              <select name="fuelType" defaultValue={bike?.fuelType ?? 'Petrol'} className={inputClass}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
              </select>
            </Field>
            <Field label="Mileage (km/l)">
              <input type="number" step="0.1" name="mileageKmpl" defaultValue={numberValue(bike?.mileageKmpl)} className={inputClass} />
            </Field>
            <Field label="Fuel Tank (Liters)">
              <input type="number" step="0.1" name="fuelTankLiters" defaultValue={numberValue(bike?.fuelTankLiters)} className={inputClass} />
            </Field>
            <Field label="Reserve Fuel Capacity">
              <input type="text" name="reserveFuelCapacity" defaultValue={textValue(bike?.reserveFuelCapacity)} placeholder="e.g. 1.5 L" className={inputClass} />
            </Field>
          </>
        ) : (
          <>
            <SectionHeader title="3. Battery" color="emerald" />

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
            <Field label="Battery Cycle Life">
              <input type="text" name="batteryCycleLife" defaultValue={textValue(bike?.batteryCycleLife)} placeholder="e.g. 800 – 1,000" className={inputClass} />
            </Field>

            <SectionHeader title="4. Charging" color="amber" />

            <Field label="Charging Time (0-100%)">
              <input type="text" name="chargingTime0100" defaultValue={textValue(bike?.chargingTime0100)} placeholder="e.g. 6–8 hours" className={inputClass} />
            </Field>

            <SectionHeader title="5. Range & Efficiency" color="teal" />

            <Field label="Range (km)">
              <input type="number" step="0.1" name="rangeKm" defaultValue={numberValue(bike?.rangeKm)} className={inputClass} />
            </Field>

            <SectionHeader title="6. Controller & Electronics" color="purple" />

            <Field label="Riding Modes">
              <input type="text" name="ridingModes" defaultValue={textValue(bike?.ridingModes)} placeholder="e.g. Eco, TTFR, Sports" className={inputClass} />
            </Field>
          </>
        )}

        {/* ═══════════════════════════════════════════════════
            DIMENSIONS & WEIGHT  (shared, numbered differently)
        ═══════════════════════════════════════════════════ */}
        <SectionHeader title={powertrain === 'ICE' ? '5. Dimensions & Weight' : '7. Dimensions & Weight'} color="purple" />

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
        <Field label="Length (mm)">
          <input type="number" step="0.1" name="lengthMm" defaultValue={numberValue(bike?.lengthMm)} className={inputClass} />
        </Field>
        <Field label="Width (mm)">
          <input type="number" step="0.1" name="widthMm" defaultValue={numberValue(bike?.widthMm)} className={inputClass} />
        </Field>
        <Field label="Height (mm)">
          <input type="number" step="0.1" name="heightMm" defaultValue={numberValue(bike?.heightMm)} className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <Field label="Underseat Storage">
            <input type="text" name="underseatStorage" defaultValue={textValue(bike?.underseatStorage)} placeholder="e.g. 32L" className={inputClass} />
          </Field>
        )}

        {/* ═══════════════════════════════════════════════════
            CHASSIS & SUSPENSION  (shared, numbered differently)
        ═══════════════════════════════════════════════════ */}
        <SectionHeader title={powertrain === 'ICE' ? '6. Chassis & Suspension' : '8. Suspension'} color="cyan" />

        {powertrain === 'ICE' && (
          <Field label="Frame Type">
            <input type="text" name="frameType" defaultValue={textValue(bike?.frameType)} placeholder="e.g. Diamond, Deltabox, Trellis" className={inputClass} />
          </Field>
        )}
        <Field label="Front Suspension">
          <input type="text" name="frontSuspension" defaultValue={textValue(bike?.frontSuspension)} placeholder={powertrain === 'ICE' ? 'e.g. Telescopic Fork' : 'e.g. Hydraulic Fork'} className={inputClass} />
        </Field>
        <Field label="Rear Suspension">
          <input type="text" name="rearSuspension" defaultValue={textValue(bike?.rearSuspension)} placeholder={powertrain === 'ICE' ? 'e.g. Mono-shock' : 'e.g. Dual Shock Absorber'} className={inputClass} />
        </Field>

        {/* ═══════════════════════════════════════════════════
            BRAKES & WHEELS  (shared, numbered differently)
        ═══════════════════════════════════════════════════ */}
        <SectionHeader title={powertrain === 'ICE' ? '7. Brakes & Wheels' : '9. Brakes & Wheels'} color="rose" />

        <Field label="Front Brake">
          <input type="text" name="frontBrake" defaultValue={textValue(bike?.frontBrake)} placeholder="e.g. Disc 300 mm" className={inputClass} />
        </Field>
        <Field label="Rear Brake">
          <input type="text" name="rearBrake" defaultValue={textValue(bike?.rearBrake)} placeholder="e.g. Drum 130 mm" className={inputClass} />
        </Field>
        <Field label="ABS">
          <select name="absType" defaultValue={bike?.absType ?? 'None'} className={inputClass}>
            <option value="None">None</option>
            <option value="Single Channel">Single Channel ABS</option>
            <option value="Dual Channel">Dual Channel ABS</option>
          </select>
        </Field>
        <Field label="Front Tyre Size">
          <input type="text" required name="frontTyre" defaultValue={textValue(bike?.frontTyre)} className={inputClass} />
        </Field>
        <Field label="Rear Tyre Size">
          <input type="text" required name="rearTyre" defaultValue={textValue(bike?.rearTyre)} className={inputClass} />
        </Field>
        <Field label="Wheel Type">
          <select name="wheelType" defaultValue={bike?.wheelType ?? 'Alloy'} className={inputClass}>
            <option value="Alloy">Alloy</option>
            <option value="Spoke">Spoke</option>
          </select>
        </Field>
        <Field label="Tyre Type">
          <select name="tyreType" defaultValue={bike?.tyreType ?? 'Tubeless'} className={inputClass}>
            <option value="Tubeless">Tubeless</option>
            <option value="Tube">Tube</option>
          </select>
        </Field>

        {/* ═══════════════════════════════════════════════════
            FEATURES & ELECTRONICS / SMART TECH  (shared, numbered differently)
        ═══════════════════════════════════════════════════ */}
        <SectionHeader title={powertrain === 'ICE' ? '8. Features & Electronics' : '10. Features & Smart Tech'} color="indigo" />

        <Field label="Display Type">
          <select name="displayType" defaultValue={bike?.displayType ?? (powertrain === 'EV' ? 'LCD' : 'Digital')} className={inputClass}>
            <option value="LCD">LCD</option>
            <option value="TFT">TFT</option>
            <option value="LED">LED</option>
            <option value="Digital">Digital</option>
            <option value="Analog + Digital">Analog + Digital</option>
          </select>
        </Field>
        <Field label="Bluetooth Connectivity">
          <YesNoSelect name="bluetoothConnectivity" defaultValue={bike?.bluetoothConnectivity} />
        </Field>
        <Field label="Navigation">
          <YesNoSelect name="navigation" defaultValue={bike?.navigation} />
        </Field>
        <Field label="Riding Modes">
          {powertrain === 'ICE' ? (
            <YesNoSelect name="ridingModes" defaultValue={bike?.ridingModes} />
          ) : (
            <input type="text" name="ridingModes" defaultValue={textValue(bike?.ridingModes)} placeholder="e.g. Eco, Normal, Sport" className={inputClass} />
          )}
        </Field>
        <Field label="Traction Control">
          <YesNoSelect name="tractionControl" defaultValue={bike?.tractionControl} />
        </Field>
        <Field label="Cruise Control">
          <YesNoSelect name="cruiseControl" defaultValue={bike?.cruiseControl} />
        </Field>
        <Field label="Quick Shifter">
          <YesNoSelect name="quickShifter" defaultValue={bike?.quickShifter} />
        </Field>
        <Field label="USB Charging Port">
          <YesNoSelect name="usbChargingPort" defaultValue={bike?.usbChargingPort ?? 'Yes'} />
        </Field>
        <Field label="App Support">
          <input type="text" name="appSupport" defaultValue={textValue(bike?.appSupport)} placeholder="e.g. Yes (Y-Connect)" className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <>
            <Field label="GPS Tracking">
              <YesNoSelect name="gpsTracking" defaultValue={bike?.gpsTracking ?? 'Yes'} />
            </Field>
            <Field label="Keyless Start">
              <YesNoSelect name="keylessStart" defaultValue={bike?.keylessStart ?? 'Yes'} />
            </Field>
            <Field label="OTA Updates">
              <YesNoSelect name="otaUpdates" defaultValue={bike?.otaUpdates} />
            </Field>
          </>
        )}

        {/* ═══════════════════════════════════════════════════
            LIGHTING  (shared)
        ═══════════════════════════════════════════════════ */}
        <SectionHeader title={powertrain === 'ICE' ? '9. Lighting' : '11. Lighting'} color="amber" />

        <Field label="Headlight Type">
          <select name="headlightType" defaultValue={bike?.headlightType ?? 'LED'} className={inputClass}>
            <option value="LED">LED</option>
            <option value="LED Projector">LED Projector</option>
            <option value="Projector LED">Projector LED</option>
            <option value="Halogen">Halogen</option>
          </select>
        </Field>
        <Field label="DRL (Daytime Running Light)">
          <YesNoSelect name="drl" defaultValue={bike?.drl} />
        </Field>
        <Field label="Tail Light Type">
          <select name="tailLightType" defaultValue={bike?.tailLightType ?? 'LED'} className={inputClass}>
            <option value="LED">LED</option>
            <option value="Bulb">Bulb</option>
          </select>
        </Field>
        <Field label="Turn Signal Type">
          <select name="turnSignalType" defaultValue={bike?.turnSignalType ?? 'LED'} className={inputClass}>
            <option value="LED">LED</option>
            <option value="Bulb">Bulb</option>
          </select>
        </Field>

        {/* ═══════════════════════════════════════════════════
            SAFETY  (shared)
        ═══════════════════════════════════════════════════ */}
        <SectionHeader title={powertrain === 'ICE' ? '10. Safety' : '12. Safety'} color="rose" />

        <Field label="CBS (Combined Braking)">
          <YesNoSelect name="cbs" defaultValue={bike?.cbs} />
        </Field>
        <Field label="Engine Kill Switch">
          <YesNoSelect name="engineKillSwitch" defaultValue={bike?.engineKillSwitch ?? 'Yes'} />
        </Field>
        <Field label="Side Stand Engine Cut-off">
          <YesNoSelect name="sideStandCutOff" defaultValue={bike?.sideStandCutOff ?? 'Yes'} />
        </Field>
        <Field label="Security Features">
          <input type="text" name="securityFeatures" defaultValue={textValue(bike?.securityFeatures)} placeholder={powertrain === 'EV' ? 'e.g. Geo-fencing, Anti-theft' : 'e.g. Anti-theft alarm'} className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <>
            <Field label="Geo-fencing">
              <YesNoSelect name="geoFencing" defaultValue={bike?.geoFencing} />
            </Field>
            <Field label="Fall Sensor">
              <YesNoSelect name="fallSensor" defaultValue={bike?.fallSensor} />
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

        {/* ═══════════════════════════════════════════════════
            IMAGES  (shared)
        ═══════════════════════════════════════════════════ */}
        <SectionHeader title={powertrain === 'ICE' ? '11. Images' : '13. Images'} color="orange" />

        <div className="md:col-span-3 space-y-3">
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                  <img
                    src={url}
                    alt={`Bike image ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,' +
                        encodeURIComponent(
                          '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect width="96" height="96" fill="%23f1f5f9"/><text x="48" y="52" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="11">No preview</text></svg>'
                        );
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="absolute right-1 top-1 hidden rounded-full bg-red-500 p-0.5 text-white shadow-sm group-hover:block"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImageUrl();
                }
              }}
              placeholder="/bikes/my-image.webp or https://..."
              className={inputClass}
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ImagePlus size={16} />
              Add
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Add image URLs (local paths like <code>/bikes/image.webp</code> or external URLs). First image is used as the card thumbnail.
          </p>
        </div>
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

export function DeleteBikeButton({ bike }: { bike: Bike }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete ${bike.brand} ${bike.model} from the bike catalog?`);
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    try {
      await deleteBikeCatalogEntry(bike.slug);
    } catch (error) {
      console.error(error);
      alert('Failed to delete bike');
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={deleting}
      onClick={handleDelete}
      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      title="Delete"
    >
      <Trash2 size={15} />
    </button>
  );
}
