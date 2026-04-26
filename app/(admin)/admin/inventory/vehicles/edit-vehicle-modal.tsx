'use client';

import * as React from 'react';
import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ImagePlus, Pencil, X } from 'lucide-react';
import { InspectionChecklist } from './inspection-checklist';
import { deserializeInspection } from '@/lib/inspection';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { updateVehicle } from './actions';
import { extractUsedVehicleRegistration, parseUsedVehicleImages } from '@/lib/used-vehicles';

type EditableVehicle = {
  id: string;
  brand: string;
  model: string;
  category: string;
  powertrain: string;
  priceBdt?: number;
  askingPrice?: number;
  inspectionStatus?: string | null;
  summary: string;
  displacementCc?: number;
  motorPowerKw?: number;
  topSpeedKph?: number;
  mileageKmpl?: number;
  rangeKm?: number;
  fuelTankLiters?: number;
  gearbox?: string;
  torqueNm?: number;
  weightKg?: number;
  seatHeightMm?: number;
  wheelbaseMm?: number;
  groundClearanceMm?: number;
  frontTyre?: string;
  rearTyre?: string;
  images?: string;
  certificationStatus: string;
};

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
      <label className="block text-xs font-semibold uppercase text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  color = 'blue',
}: {
  title: string;
  color?: 'blue' | 'emerald' | 'purple' | 'rose' | 'cyan' | 'amber' | 'teal';
}) {
  const map: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500', border: 'border-slate-200', text: '' },
    emerald: { bg: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-600' },
    rose: { bg: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-600' },
    cyan: { bg: 'bg-cyan-500', border: 'border-cyan-200', text: 'text-cyan-600' },
    amber: { bg: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-600' },
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

export function EditVehicleModal({ vehicle }: { vehicle: EditableVehicle }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const registration = extractUsedVehicleRegistration(vehicle.summary);
  const existingImages = parseUsedVehicleImages(vehicle.images);

  const [powertrain, setPowertrain] = useState<'ICE' | 'EV'>(vehicle.powertrain === 'EV' ? 'EV' : 'ICE');
  const [registrationStatus, setRegistrationStatus] = useState<'Registered' | 'On Test'>(
    registration.registrationStatus || 'On Test'
  );
  const initValidity = registration.registrationValidityPeriod
    ? new Date(registration.registrationValidityPeriod)
    : undefined;
  const initPurchase = registration.purchaseDate ? new Date(registration.purchaseDate) : undefined;
  const [registrationValidityDate, setRegistrationValidityDate] = useState<Date | undefined>(
    initValidity && !Number.isNaN(initValidity.getTime()) ? initValidity : undefined
  );
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    initPurchase && !Number.isNaN(initPurchase.getTime()) ? initPurchase : undefined
  );
  const [imageUrls, setImageUrls] = useState<string[]>(existingImages);
  const [newImageUrl, setNewImageUrl] = useState('');
  const currentYear = new Date().getFullYear();
  const calendarStartMonth = new Date(currentYear - 10, 0, 1);
  const calendarEndMonth = new Date(currentYear + 10, 11, 31);

  function addImageUrl() {
    const trimmed = newImageUrl.trim();
    if (trimmed && !imageUrls.includes(trimmed)) {
      setImageUrls((prev) => [...prev, trimmed]);
      setNewImageUrl('');
    }
  }

  function removeImageUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set('images', JSON.stringify(imageUrls));
      const result = await updateVehicle(vehicle.id, formData);

      if (!result.success) {
        alert(result.error ?? 'Failed to update vehicle');
        return;
      }

      setOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  }

  // Extract odometer from registration data
  const odometerValue = registration.odometerKm ?? '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
        <Pencil size={12} />
        Edit
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Edit Vehicle — {vehicle.brand} {vehicle.model}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Update vehicle details, pricing, and specs. Changes are saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-2 pt-4">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
            <SectionHeader title="Marketplace Listing" color="teal" />

            <Field label="Asking Price (BDT)">
              <input type="number" required name="askingPrice" min="0" step="0.01" defaultValue={vehicle.askingPrice} className={inputClass} />
            </Field>

            <Field label="Odometer Reading (km)">
              <input type="number" required name="odometerKm" min="0" step="1" defaultValue={odometerValue} className={inputClass} />
            </Field>
            <Field label="Registration Status">
              <select
                name="registrationStatus"
                value={registrationStatus}
                onChange={(event) => setRegistrationStatus(event.target.value as 'Registered' | 'On Test')}
                className={inputClass}
              >
                <option value="Registered">Registered</option>
                <option value="On Test">On Test</option>
              </select>
            </Field>
            {registrationStatus === 'Registered' ? (
              <>
                <Field label="Registration Number">
                  <input
                    required
                    name="registrationNumber"
                    defaultValue={registration.registrationNumber ?? ''}
                    placeholder="e.g. DHAKA METRO-XX-XX-XXXX"
                    autoCapitalize="characters"
                    onInput={(event) => {
                      event.currentTarget.value = event.currentTarget.value.toUpperCase();
                    }}
                    className={`${inputClass} uppercase`}
                  />
                </Field>
                <Field label="Validity Period">
                  <input
                    type="hidden"
                    name="registrationValidityPeriod"
                    value={registrationValidityDate ? format(registrationValidityDate, 'yyyy-MM-dd') : ''}
                  />
                  <Popover>
                    <PopoverTrigger>
                      <div
                        role="button"
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          'w-full justify-between rounded-lg border-slate-300 bg-white px-3 py-2 text-sm font-normal hover:bg-white',
                          !registrationValidityDate && 'text-slate-500'
                        )}
                      >
                        {registrationValidityDate ? format(registrationValidityDate, 'PPP') : 'Select validity date'}
                        <CalendarIcon className="h-4 w-4 text-slate-500" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={registrationValidityDate}
                        onSelect={setRegistrationValidityDate}
                        captionLayout="dropdown"
                        startMonth={calendarStartMonth}
                        endMonth={calendarEndMonth}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </>
            ) : null}
            <Field label="Purchase Date">
              <input type="hidden" name="purchaseDate" value={purchaseDate ? format(purchaseDate, 'yyyy-MM-dd') : ''} />
              <Popover>
                <PopoverTrigger>
                  <div
                    role="button"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full justify-between rounded-lg border-slate-300 bg-white px-3 py-2 text-sm font-normal hover:bg-white',
                      !purchaseDate && 'text-slate-500'
                    )}
                  >
                    {purchaseDate ? format(purchaseDate, 'PPP') : 'Select purchase date'}
                    <CalendarIcon className="h-4 w-4 text-slate-500" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={purchaseDate}
                    onSelect={setPurchaseDate}
                    captionLayout="dropdown"
                    startMonth={calendarStartMonth}
                    endMonth={calendarEndMonth}
                  />
                </PopoverContent>
              </Popover>
            </Field>
            <Field label="Seller Notes" span={3}>
              <textarea
                name="description"
                defaultValue={registration.listingSummary}
                placeholder="Optional listing notes, condition notes, or seller context..."
                className={`${inputClass} h-16`}
              />
            </Field>

            <SectionHeader title="Basic Information" color="blue" />

            <Field label="Brand">
              <input required name="brand" defaultValue={vehicle.brand} className={inputClass} />
            </Field>
            <Field label="Model">
              <input required name="model" defaultValue={vehicle.model} className={inputClass} />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={vehicle.category} className={inputClass}>
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
            <Field label="Reference Price (BDT)">
              <input type="number" name="priceBdt" min="0" step="0.01" defaultValue={vehicle.priceBdt} className={inputClass} />
            </Field>
            <Field label="Summary" span={3}>
              <textarea
                name="summary"
                required
                defaultValue={registration.listingSummary || ''}
                placeholder="Describe the bike for the listing..."
                className={`${inputClass} h-16`}
              />
            </Field>

            <SectionHeader title={powertrain === 'ICE' ? 'Engine & Performance' : 'Motor & Performance'} color="rose" />

            <Field label="Top Speed (km/h)">
              <input type="number" required name="topSpeedKph" defaultValue={vehicle.topSpeedKph} className={inputClass} />
            </Field>

            {powertrain === 'ICE' ? (
              <>
                <Field label="Displacement (CC)">
                  <input type="number" step="0.1" name="displacementCc" defaultValue={vehicle.displacementCc} className={inputClass} />
                </Field>
                <Field label="Mileage (km/l)">
                  <input type="number" step="0.1" name="mileageKmpl" defaultValue={vehicle.mileageKmpl} className={inputClass} />
                </Field>
                <Field label="Fuel Tank (Liters)">
                  <input type="number" step="0.1" name="fuelTankLiters" defaultValue={vehicle.fuelTankLiters} className={inputClass} />
                </Field>
                <Field label="Gearbox">
                  <select name="gearbox" defaultValue={vehicle.gearbox ?? '5-speed'} className={inputClass}>
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
                  <input type="number" step="0.1" name="motorPowerKw" defaultValue={vehicle.motorPowerKw} className={inputClass} />
                </Field>
                <Field label="Range (km)">
                  <input type="number" step="0.1" name="rangeKm" defaultValue={vehicle.rangeKm} className={inputClass} />
                </Field>
              </>
            )}

            <SectionHeader title="Dimensions & Weight" color="purple" />

            <Field label="Kerb Weight (kg)">
              <input type="number" step="0.1" required name="weightKg" defaultValue={vehicle.weightKg} className={inputClass} />
            </Field>
            <Field label="Seat Height (mm)">
              <input type="number" step="0.1" required name="seatHeightMm" defaultValue={vehicle.seatHeightMm} className={inputClass} />
            </Field>
            <Field label="Ground Clearance (mm)">
              <input type="number" step="0.1" required name="groundClearanceMm" defaultValue={vehicle.groundClearanceMm} className={inputClass} />
            </Field>
            <Field label="Wheelbase (mm)">
              <input type="number" step="0.1" required name="wheelbaseMm" defaultValue={vehicle.wheelbaseMm} className={inputClass} />
            </Field>

            <SectionHeader title="Wheels" color="cyan" />

            <Field label="Front Tyre Size">
              <input type="text" required name="frontTyre" defaultValue={vehicle.frontTyre} className={inputClass} />
            </Field>
            <Field label="Rear Tyre Size">
              <input type="text" required name="rearTyre" defaultValue={vehicle.rearTyre} className={inputClass} />
            </Field>

            <SectionHeader title="Images" color="amber" />

            <div className="space-y-3 md:col-span-3">
              {imageUrls.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {imageUrls.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="group relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={url}
                        alt={`Vehicle image ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          (event.target as HTMLImageElement).src =
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
                  onChange={(event) => setNewImageUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
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
            </div>
          </div>

          {/* 50-Point Inspection Checklist */}
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <div className="h-4 w-1.5 rounded-full bg-indigo-500" />
              <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-600">50-Point Inspection</h3>
            </div>
            <InspectionChecklist initialScores={deserializeInspection(vehicle.inspectionStatus)} />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
