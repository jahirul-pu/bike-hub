'use client';

import * as React from 'react';
import { useId, useRef, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ExternalLink, ImagePlus, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { bikes, type Bike } from '@/lib/bikes-data';
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
import { createVehicle } from './actions';

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

function YesNoSelect({ name }: { name: string }) {
  return (
    <select name={name} defaultValue="No" className={inputClass}>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );
}

function InspectionCheckbox({
  name,
  passLabel,
  failLabel,
}: {
  name: string;
  passLabel: string;
  failLabel: string;
}) {
  const [value, setValue] = useState<'pass' | 'fail'>('pass');
  const yesId = useId();
  const noId = useId();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
      <input type="hidden" name={name} value={value} />

      <label htmlFor={yesId} className="flex items-center gap-2">
        <input
          id={yesId}
          type="checkbox"
          checked={value === 'pass'}
          onChange={() => setValue('pass')}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span>{passLabel}</span>
      </label>

      <label htmlFor={noId} className="flex items-center gap-2">
        <input
          id={noId}
          type="checkbox"
          checked={value === 'fail'}
          onChange={() => setValue('fail')}
          className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
        />
        <span>{failLabel}</span>
      </label>
    </div>
  );
}

type AutofillBike = Bike & Partial<Record<'batteryType' | 'voltageV' | 'ampHours' | 'peakPowerKw', string | number>>;

const inspectionSections = [
  {
    title: 'Engine & Transmission',
    color: 'rose' as const,
    points: [
      'Cold start (no struggle)',
      'Idle stability',
      'Engine noise (no knocking)',
      'Acceleration smoothness',
      'Gear shifting smooth',
      'Clutch response',
      'No excessive vibration',
      'No oil leakage',
      'Exhaust smoke normal',
      'Engine heat normal',
    ],
  },
  {
    title: 'Frame & Structure',
    color: 'amber' as const,
    points: [
      'Frame alignment',
      'No visible bends',
      'No major rust',
      'No weld damage',
      'Swingarm condition',
      'Crash signs absent',
    ],
  },
  {
    title: 'Suspension & Steering',
    color: 'cyan' as const,
    points: [
      'Front fork leakage',
      'Front suspension smooth',
      'Rear suspension condition',
      'Steering alignment',
      'Handle straight',
      'No unusual play',
    ],
  },
  {
    title: 'Brakes',
    color: 'rose' as const,
    points: [
      'Front brake response',
      'Rear brake response',
      'Brake pads condition',
      'Disc condition',
      'No brake noise',
      'Brake fluid level OK',
    ],
  },
  {
    title: 'Electrical System',
    color: 'indigo' as const,
    points: [
      'Battery health',
      'Self-start works',
      'Headlight working',
      'Indicators working',
      'Brake light working',
      'Horn working',
    ],
  },
  {
    title: 'Wheels & Tires',
    color: 'teal' as const,
    points: [
      'Tire tread depth',
      'Tire condition (no cracks)',
      'Rim condition',
      'Wheel alignment',
      'Wheel bearing smooth',
    ],
  },
  {
    title: 'Body & Cosmetics',
    color: 'orange' as const,
    points: [
      'Fuel tank condition',
      'Fairings condition',
      'Paint quality',
      'Seat condition',
      'No major scratches/dents',
    ],
  },
  {
    title: 'Documents & Legal',
    color: 'purple' as const,
    points: [
      'Registration valid',
      'Engine number match',
      'Chassis number match',
      'Tax updated',
      'Insurance valid',
      'Service history available',
    ],
  },
];

const defaultInspectionAnswerLabels = { passLabel: 'Pass', failLabel: 'Fail' };

const inspectionQuestions: Record<string, string> = {
  'Cold start (no struggle)': 'Does the bike cold start without struggle?',
  'Idle stability': 'Is the engine idle stable?',
  'Engine noise (no knocking)': 'Is the engine noise normal without knocking?',
  'Acceleration smoothness': 'Is the acceleration smooth?',
  'Gear shifting smooth': 'Does the bike shift gears smoothly?',
  'Clutch response': 'Is the clutch response good?',
  'No excessive vibration': 'Is there any excessive vibration?',
  'No oil leakage': 'Is there any oil leakage?',
  'Exhaust smoke normal': 'Is the exhaust smoke normal?',
  'Engine heat normal': 'Is the engine heat normal?',
  'Frame alignment': 'Is the frame properly aligned?',
  'No visible bends': 'Are there any visible bends?',
  'No major rust': 'Is there any major rust?',
  'No weld damage': 'Is there any weld damage?',
  'Swingarm condition': 'Is the swingarm in good condition?',
  'Crash signs absent': 'Are crash signs absent?',
  'Front fork leakage': 'Is there any front fork leakage?',
  'Front suspension smooth': 'Is the front suspension smooth?',
  'Rear suspension condition': 'Is the rear suspension in good condition?',
  'Steering alignment': 'Is the steering aligned correctly?',
  'Handle straight': 'Is the handle straight?',
  'No unusual play': 'Is there any unusual play?',
  'Front brake response': 'Is the front brake response good?',
  'Rear brake response': 'Is the rear brake response good?',
  'Brake pads condition': 'Are the brake pads in good condition?',
  'Disc condition': 'Is the disc in good condition?',
  'No brake noise': 'Is there any brake noise?',
  'Brake fluid level OK': 'Is the brake fluid level OK?',
  'Battery health': 'Is the battery health good?',
  'Self-start works': 'Does the self-start work properly?',
  'Headlight working': 'Is the headlight working?',
  'Indicators working': 'Are the indicators working?',
  'Brake light working': 'Is the brake light working?',
  'Horn working': 'Is the horn working?',
  'Tire tread depth': 'Is the tire tread depth adequate?',
  'Tire condition (no cracks)': 'Are the tires free from cracks?',
  'Rim condition': 'Are the rims in good condition?',
  'Wheel alignment': 'Are the wheels properly aligned?',
  'Wheel bearing smooth': 'Are the wheel bearings smooth?',
  'Fuel tank condition': 'Is the fuel tank in good condition?',
  'Fairings condition': 'Are the fairings in good condition?',
  'Paint quality': 'Is the paint quality good?',
  'Seat condition': 'Is the seat in good condition?',
  'No major scratches/dents': 'Are there any major scratches or dents?',
  'Registration valid': 'Is the registration valid?',
  'Engine number match': 'Does the engine number match?',
  'Chassis number match': 'Does the chassis number match?',
  'Tax updated': 'Is the tax updated?',
  'Insurance valid': 'Is the insurance valid?',
  'Service history available': 'Is the service history available?',
};

const inspectionAnswerLabels: Record<string, { passLabel: string; failLabel: string }> = {
  'Cold start (no struggle)': { passLabel: 'Starts Easily', failLabel: 'Struggles' },
  'Idle stability': { passLabel: 'Stable', failLabel: 'Unstable' },
  'Engine noise (no knocking)': { passLabel: 'Normal', failLabel: 'Knocking' },
  'Acceleration smoothness': { passLabel: 'Smooth', failLabel: 'Rough' },
  'Gear shifting smooth': { passLabel: 'Smooth', failLabel: 'Rough' },
  'Clutch response': { passLabel: 'Good', failLabel: 'Poor' },
  'No excessive vibration': { passLabel: 'Normal', failLabel: 'Excessive' },
  'No oil leakage': { passLabel: 'No Leak', failLabel: 'Leak Found' },
  'Exhaust smoke normal': { passLabel: 'Normal', failLabel: 'Abnormal' },
  'Engine heat normal': { passLabel: 'Normal', failLabel: 'Overheating' },
  'Frame alignment': { passLabel: 'Aligned', failLabel: 'Misaligned' },
  'No visible bends': { passLabel: 'None', failLabel: 'Visible' },
  'No major rust': { passLabel: 'None', failLabel: 'Present' },
  'No weld damage': { passLabel: 'No Damage', failLabel: 'Damage Found' },
  'Swingarm condition': { passLabel: 'Good', failLabel: 'Poor' },
  'Crash signs absent': { passLabel: 'Absent', failLabel: 'Present' },
  'Front fork leakage': { passLabel: 'No Leak', failLabel: 'Leak Found' },
  'Front suspension smooth': { passLabel: 'Smooth', failLabel: 'Rough' },
  'Rear suspension condition': { passLabel: 'Good', failLabel: 'Poor' },
  'Steering alignment': { passLabel: 'Aligned', failLabel: 'Misaligned' },
  'Handle straight': { passLabel: 'Straight', failLabel: 'Bent' },
  'No unusual play': { passLabel: 'None', failLabel: 'Present' },
  'Front brake response': { passLabel: 'Good', failLabel: 'Poor' },
  'Rear brake response': { passLabel: 'Good', failLabel: 'Poor' },
  'Brake pads condition': { passLabel: 'Good', failLabel: 'Worn' },
  'Disc condition': { passLabel: 'Good', failLabel: 'Damaged' },
  'No brake noise': { passLabel: 'Quiet', failLabel: 'Noise Present' },
  'Brake fluid level OK': { passLabel: 'OK', failLabel: 'Low' },
  'Battery health': { passLabel: 'Good', failLabel: 'Weak' },
  'Self-start works': { passLabel: 'Working', failLabel: 'Not Working' },
  'Headlight working': { passLabel: 'Working', failLabel: 'Not Working' },
  'Indicators working': { passLabel: 'Working', failLabel: 'Not Working' },
  'Brake light working': { passLabel: 'Working', failLabel: 'Not Working' },
  'Horn working': { passLabel: 'Working', failLabel: 'Not Working' },
  'Tire tread depth': { passLabel: 'Adequate', failLabel: 'Low' },
  'Tire condition (no cracks)': { passLabel: 'No Cracks', failLabel: 'Cracked' },
  'Rim condition': { passLabel: 'Good', failLabel: 'Damaged' },
  'Wheel alignment': { passLabel: 'Aligned', failLabel: 'Misaligned' },
  'Wheel bearing smooth': { passLabel: 'Smooth', failLabel: 'Rough' },
  'Fuel tank condition': { passLabel: 'Good', failLabel: 'Poor' },
  'Fairings condition': { passLabel: 'Good', failLabel: 'Poor' },
  'Paint quality': { passLabel: 'Good', failLabel: 'Poor' },
  'Seat condition': { passLabel: 'Good', failLabel: 'Poor' },
  'No major scratches/dents': { passLabel: 'None', failLabel: 'Present' },
  'Registration valid': { passLabel: 'Valid', failLabel: 'Invalid' },
  'Engine number match': { passLabel: 'Match', failLabel: 'Mismatch' },
  'Chassis number match': { passLabel: 'Match', failLabel: 'Mismatch' },
  'Tax updated': { passLabel: 'Updated', failLabel: 'Due' },
  'Insurance valid': { passLabel: 'Valid', failLabel: 'Expired' },
  'Service history available': { passLabel: 'Available', failLabel: 'Unavailable' },
};

function inspectionFieldName(sectionTitle: string, point: string) {
  return `inspection__${sectionTitle}__${point}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)+/g, '');
}

function setNamedFieldValue(form: HTMLFormElement | null, name: string, value: string | number | undefined | null) {
  if (!form) {
    return;
  }

  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
    return;
  }

  field.value = value != null ? String(value) : '';
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

function VehicleForm({
  onSubmit,
  loading,
}: {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [powertrain, setPowertrain] = useState<'ICE' | 'EV'>('ICE');
  const [registrationStatus, setRegistrationStatus] = useState<'Registered' | 'On Test'>('Registered');
  const [registrationValidityDate, setRegistrationValidityDate] = useState<Date | undefined>(undefined);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedCatalogSlug, setSelectedCatalogSlug] = useState('');

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

  function applyCatalogBike(bike: AutofillBike) {
    setPowertrain(bike.powertrain);
    setImageUrls(bike.images ?? []);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const form = formRef.current;
        const values: Record<string, string | number | undefined> = {
          brand: bike.brand,
          model: bike.model,
          category: bike.category,
          powertrain: bike.powertrain,
          priceBdt: bike.priceBdt,
          launchYear: bike.launchYear,
          summary: bike.summary,
          colors: bike.colors?.join(', '),
          warranty: bike.warranty,
          topSpeedKph: bike.topSpeedKph,
          displacementCc: bike.displacementCc,
          engineType: bike.engineType,
          noOfCylinders: bike.noOfCylinders,
          maxPower: bike.maxPower,
          maxTorque: bike.maxTorque,
          coolingSystem: bike.coolingSystem,
          fuelSystem: bike.fuelSystem,
          compressionRatio: bike.compressionRatio,
          boreStroke: bike.boreStroke,
          emissionStandard: bike.emissionStandard,
          motorPowerKw: bike.motorPowerKw,
          peakPowerKw: bike.peakPowerKw,
          torqueNm: bike.torqueNm,
          gearbox: bike.gearbox,
          clutchType: bike.clutchType,
          finalDrive: bike.finalDrive,
          fuelType: bike.fuelType,
          mileageKmpl: bike.mileageKmpl,
          fuelTankLiters: bike.fuelTankLiters,
          reserveFuelCapacity: bike.reserveFuelCapacity,
          batteryType: bike.batteryType,
          voltageV: bike.voltageV,
          ampHours: bike.ampHours,
          batteryCycleLife: bike.batteryCycleLife,
          chargingTime0100: bike.chargingTime0100,
          rangeKm: bike.rangeKm,
          ridingModes: bike.ridingModes,
          weightKg: bike.weightKg,
          seatHeightMm: bike.seatHeightMm,
          groundClearanceMm: bike.groundClearanceMm,
          wheelbaseMm: bike.wheelbaseMm,
          lengthMm: bike.lengthMm,
          widthMm: bike.widthMm,
          heightMm: bike.heightMm,
          underseatStorage: bike.underseatStorage,
          frameType: bike.frameType,
          frontSuspension: bike.frontSuspension,
          rearSuspension: bike.rearSuspension,
          frontBrake: bike.frontBrake,
          rearBrake: bike.rearBrake,
          absType: bike.absType,
          frontTyre: bike.frontTyre,
          rearTyre: bike.rearTyre,
          wheelType: bike.wheelType,
          tyreType: bike.tyreType,
          displayType: bike.displayType,
          bluetoothConnectivity: bike.bluetoothConnectivity,
          navigation: bike.navigation,
          tractionControl: bike.tractionControl,
          cruiseControl: bike.cruiseControl,
          quickShifter: bike.quickShifter,
          usbChargingPort: bike.usbChargingPort,
          appSupport: bike.appSupport,
          gpsTracking: bike.gpsTracking,
          keylessStart: bike.keylessStart,
          otaUpdates: bike.otaUpdates,
          headlightType: bike.headlightType,
          drl: bike.drl,
          tailLightType: bike.tailLightType,
          turnSignalType: bike.turnSignalType,
          cbs: bike.cbs,
          engineKillSwitch: bike.engineKillSwitch,
          sideStandCutOff: bike.sideStandCutOff,
          securityFeatures: bike.securityFeatures,
          geoFencing: bike.geoFencing,
          fallSensor: bike.fallSensor,
          ipRating: bike.ipRating,
        };

        Object.entries(values).forEach(([name, value]) => setNamedFieldValue(form, name, value));
      });
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('images', JSON.stringify(imageUrls));
    await onSubmit(formData);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-2 pt-4">
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-3">
        <SectionHeader title="0. Marketplace Listing" color="teal" />

        <Field label="Autofill From Bike Catalog" span={3}>
          <select
            value={selectedCatalogSlug}
            onChange={(event) => {
              const nextSlug = event.target.value;
              setSelectedCatalogSlug(nextSlug);

              const selectedBike = bikes.find((bike) => bike.slug === nextSlug);
              if (selectedBike) {
                applyCatalogBike(selectedBike as AutofillBike);
              }
            }}
            className={inputClass}
          >
            <option value="">Select a catalog bike to auto-fill specs</option>
            {bikes.map((bike) => (
              <option key={bike.slug} value={bike.slug}>
                {bike.brand} {bike.model} ({bike.powertrain})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Asking Price (BDT)">
          <input type="number" required name="askingPrice" min="0" step="0.01" className={inputClass} />
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
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </>
        ) : null}
        <Field label="Seller Notes" span={3}>
          <textarea
            name="description"
            placeholder="Optional listing notes, condition notes, or seller context..."
            className={`${inputClass} h-16`}
          />
        </Field>

        <SectionHeader title="1. Basic Information" color="blue" />

        <Field label="Brand">
          <input required name="brand" placeholder="Yamaha" className={inputClass} />
        </Field>
        <Field label="Model">
          <input required name="model" placeholder="R15 V4" className={inputClass} />
        </Field>
        <Field label="Category">
          <select name="category" defaultValue="Commuter" className={inputClass}>
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
          <input type="number" name="priceBdt" min="0" step="0.01" className={inputClass} />
        </Field>
        <Field label="Launch Year">
          <input type="number" name="launchYear" placeholder="e.g. 2024" className={inputClass} />
        </Field>
        <Field label="Summary" span={3}>
          <textarea
            name="summary"
            required
            placeholder="Describe the bike for the listing..."
            className={`${inputClass} h-16`}
          />
        </Field>
        <Field label="Colors (comma separated)" span={3}>
          <input name="colors" placeholder="Pearl White, Red, Cyan, Gray" className={inputClass} />
        </Field>
        <Field label="Warranty" span={3}>
          <input name="warranty" placeholder="e.g. 2 yrs / 20,000 km" className={inputClass} />
        </Field>

        <SectionHeader title={powertrain === 'ICE' ? '2. Engine & Performance' : '2. Motor & Performance'} color="rose" />

        <Field label="Top Speed (km/h)">
          <input type="number" required name="topSpeedKph" className={inputClass} />
        </Field>

        {powertrain === 'ICE' ? (
          <>
            <Field label="Displacement (CC)">
              <input type="number" step="0.1" name="displacementCc" className={inputClass} />
            </Field>
            <Field label="Engine Type">
              <select name="engineType" defaultValue="SOHC" className={inputClass}>
                <option value="SOHC">SOHC</option>
                <option value="DOHC">DOHC</option>
              </select>
            </Field>
            <Field label="No. of Cylinders">
              <select name="noOfCylinders" defaultValue="Single Cylinder" className={inputClass}>
                <option value="Single Cylinder">Single Cylinder</option>
                <option value="Dual Cylinder">Dual Cylinder</option>
                <option value="Three Cylinder">Three Cylinder</option>
                <option value="Four Cylinder">Four Cylinder</option>
              </select>
            </Field>
            <Field label="Max Power (HP / PS @ RPM)">
              <input type="text" name="maxPower" placeholder="e.g. 13.2 HP @ 8,000 RPM" className={inputClass} />
            </Field>
            <Field label="Max Torque (Nm @ RPM)">
              <input type="text" name="maxTorque" placeholder="e.g. 14.2 Nm @ 6,500 RPM" className={inputClass} />
            </Field>
            <Field label="Cooling System">
              <select name="coolingSystem" defaultValue="Air Cooled" className={inputClass}>
                <option value="Air Cooled">Air Cooled</option>
                <option value="Liquid Cooled">Liquid Cooled</option>
                <option value="Oil Cooled">Oil Cooled</option>
              </select>
            </Field>
            <Field label="Fuel System">
              <select name="fuelSystem" defaultValue="Fuel Injected" className={inputClass}>
                <option value="Fuel Injected">Fuel Injected</option>
                <option value="Carburator">Carburator</option>
              </select>
            </Field>
            <Field label="Compression Ratio">
              <input type="text" name="compressionRatio" placeholder="e.g. 11.6:1" className={inputClass} />
            </Field>
            <Field label="Bore x Stroke">
              <input type="text" name="boreStroke" placeholder="e.g. 57.3 mm x 58.7 mm" className={inputClass} />
            </Field>
            <Field label="Emission Standard">
              <input type="text" name="emissionStandard" placeholder="e.g. BS6 / Euro 5" className={inputClass} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Rated Power (kW)">
              <input type="number" step="0.1" name="motorPowerKw" className={inputClass} />
            </Field>
            <Field label="Peak Power (kW)">
              <input type="number" step="0.1" name="peakPowerKw" className={inputClass} />
            </Field>
            <Field label="Torque (Nm)">
              <input type="number" step="0.1" name="torqueNm" className={inputClass} />
            </Field>
          </>
        )}

        {powertrain === 'ICE' ? (
          <>
            <SectionHeader title="3. Transmission" color="emerald" />

            <Field label="Gearbox">
              <select name="gearbox" defaultValue="5-speed" className={inputClass}>
                <option value="4-speed">4-speed</option>
                <option value="5-speed">5-speed</option>
                <option value="6-speed">6-speed</option>
                <option value="CVT">CVT (Scooter)</option>
              </select>
            </Field>
            <Field label="Clutch Type">
              <input type="text" name="clutchType" placeholder="e.g. Wet multi-plate" className={inputClass} />
            </Field>
            <Field label="Final Drive">
              <select name="finalDrive" defaultValue="Chain" className={inputClass}>
                <option value="Chain">Chain</option>
                <option value="Belt">Belt</option>
                <option value="Shaft">Shaft</option>
              </select>
            </Field>

            <SectionHeader title="4. Fuel & Efficiency" color="amber" />

            <Field label="Fuel Type">
              <select name="fuelType" defaultValue="Petrol" className={inputClass}>
                <option value="Petrol">Petrol</option>
                <option value="Octane">Octane</option>
              </select>
            </Field>
            <Field label="Mileage (km/l)">
              <input type="number" step="0.1" name="mileageKmpl" className={inputClass} />
            </Field>
            <Field label="Fuel Tank (Liters)">
              <input type="number" step="0.1" name="fuelTankLiters" className={inputClass} />
            </Field>
            <Field label="Reserve Fuel Capacity">
              <input type="text" name="reserveFuelCapacity" placeholder="e.g. 1.5 L" className={inputClass} />
            </Field>
          </>
        ) : (
          <>
            <SectionHeader title="3. Battery" color="emerald" />

            <Field label="Battery Type">
              <select name="batteryType" defaultValue="Lithium-ion" className={inputClass}>
                <option value="Lithium-ion">Lithium-ion</option>
                <option value="LFP">LFP (LiFePO4)</option>
                <option value="Lead-acid">Lead-acid</option>
                <option value="NMC">NMC</option>
              </select>
            </Field>
            <Field label="Voltage (V)">
              <input type="number" step="0.1" name="voltageV" className={inputClass} />
            </Field>
            <Field label="Amp-Hours (Ah)">
              <input type="number" step="0.1" name="ampHours" className={inputClass} />
            </Field>
            <Field label="Battery Cycle Life">
              <input type="text" name="batteryCycleLife" placeholder="e.g. 800 – 1,000" className={inputClass} />
            </Field>

            <SectionHeader title="4. Charging" color="amber" />

            <Field label="Charging Time (0-100%)">
              <input type="text" name="chargingTime0100" placeholder="e.g. 6–8 hours" className={inputClass} />
            </Field>

            <SectionHeader title="5. Range & Efficiency" color="teal" />

            <Field label="Range (km)">
              <input type="number" step="0.1" name="rangeKm" className={inputClass} />
            </Field>

            <SectionHeader title="6. Controller & Electronics" color="purple" />

            <Field label="Riding Modes">
              <input type="text" name="ridingModes" placeholder="e.g. Eco, TTFR, Sports" className={inputClass} />
            </Field>
          </>
        )}

        <SectionHeader title={powertrain === 'ICE' ? '5. Dimensions & Weight' : '7. Dimensions & Weight'} color="purple" />

        <Field label="Kerb Weight (kg)">
          <input type="number" step="0.1" required name="weightKg" className={inputClass} />
        </Field>
        <Field label="Seat Height (mm)">
          <input type="number" step="0.1" required name="seatHeightMm" className={inputClass} />
        </Field>
        <Field label="Ground Clearance (mm)">
          <input type="number" step="0.1" required name="groundClearanceMm" className={inputClass} />
        </Field>
        <Field label="Wheelbase (mm)">
          <input type="number" step="0.1" required name="wheelbaseMm" className={inputClass} />
        </Field>
        <Field label="Length (mm)">
          <input type="number" step="0.1" name="lengthMm" className={inputClass} />
        </Field>
        <Field label="Width (mm)">
          <input type="number" step="0.1" name="widthMm" className={inputClass} />
        </Field>
        <Field label="Height (mm)">
          <input type="number" step="0.1" name="heightMm" className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <Field label="Underseat Storage">
            <input type="text" name="underseatStorage" placeholder="e.g. 32L" className={inputClass} />
          </Field>
        )}

        <SectionHeader title={powertrain === 'ICE' ? '6. Chassis & Suspension' : '8. Suspension'} color="cyan" />

        {powertrain === 'ICE' && (
          <Field label="Frame Type">
            <input type="text" name="frameType" placeholder="e.g. Diamond, Deltabox, Trellis" className={inputClass} />
          </Field>
        )}
        <Field label="Front Suspension">
          <input type="text" name="frontSuspension" placeholder={powertrain === 'ICE' ? 'e.g. Telescopic Fork' : 'e.g. Hydraulic Fork'} className={inputClass} />
        </Field>
        <Field label="Rear Suspension">
          <input type="text" name="rearSuspension" placeholder={powertrain === 'ICE' ? 'e.g. Mono-shock' : 'e.g. Dual Shock Absorber'} className={inputClass} />
        </Field>

        <SectionHeader title={powertrain === 'ICE' ? '7. Brakes & Wheels' : '9. Brakes & Wheels'} color="rose" />

        <Field label="Front Brake">
          <input type="text" name="frontBrake" placeholder="e.g. Disc 300 mm" className={inputClass} />
        </Field>
        <Field label="Rear Brake">
          <input type="text" name="rearBrake" placeholder="e.g. Drum 130 mm" className={inputClass} />
        </Field>
        <Field label="ABS">
          <select name="absType" defaultValue="None" className={inputClass}>
            <option value="None">None</option>
            <option value="Single Channel">Single Channel ABS</option>
            <option value="Dual Channel">Dual Channel ABS</option>
          </select>
        </Field>
        <Field label="Front Tyre Size">
          <input type="text" required name="frontTyre" className={inputClass} />
        </Field>
        <Field label="Rear Tyre Size">
          <input type="text" required name="rearTyre" className={inputClass} />
        </Field>
        <Field label="Wheel Type">
          <select name="wheelType" defaultValue="Alloy" className={inputClass}>
            <option value="Alloy">Alloy</option>
            <option value="Spoke">Spoke</option>
          </select>
        </Field>
        <Field label="Tyre Type">
          <select name="tyreType" defaultValue="Tubeless" className={inputClass}>
            <option value="Tubeless">Tubeless</option>
            <option value="Tube">Tube</option>
          </select>
        </Field>

        <SectionHeader title={powertrain === 'ICE' ? '8. Features & Electronics' : '10. Features & Smart Tech'} color="indigo" />

        <Field label="Display Type">
          <select name="displayType" defaultValue={powertrain === 'EV' ? 'LCD' : 'Digital'} className={inputClass}>
            <option value="LCD">LCD</option>
            <option value="TFT">TFT</option>
            <option value="LED">LED</option>
            <option value="Digital">Digital</option>
            <option value="Analog + Digital">Analog + Digital</option>
          </select>
        </Field>
        <Field label="Bluetooth Connectivity">
          <YesNoSelect name="bluetoothConnectivity" />
        </Field>
        <Field label="Navigation">
          <YesNoSelect name="navigation" />
        </Field>
        <Field label="Riding Modes">
          {powertrain === 'ICE' ? <YesNoSelect name="ridingModes" /> : <input type="text" name="ridingModes" placeholder="e.g. Eco, Normal, Sport" className={inputClass} />}
        </Field>
        <Field label="Traction Control">
          <YesNoSelect name="tractionControl" />
        </Field>
        <Field label="Cruise Control">
          <YesNoSelect name="cruiseControl" />
        </Field>
        <Field label="Quick Shifter">
          <YesNoSelect name="quickShifter" />
        </Field>
        <Field label="USB Charging Port">
          <YesNoSelect name="usbChargingPort" />
        </Field>
        <Field label="App Support">
          <input type="text" name="appSupport" placeholder="e.g. Yes (Y-Connect)" className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <>
            <Field label="GPS Tracking">
              <YesNoSelect name="gpsTracking" />
            </Field>
            <Field label="Keyless Start">
              <YesNoSelect name="keylessStart" />
            </Field>
            <Field label="OTA Updates">
              <YesNoSelect name="otaUpdates" />
            </Field>
          </>
        )}

        <SectionHeader title={powertrain === 'ICE' ? '9. Lighting' : '11. Lighting'} color="amber" />

        <Field label="Headlight Type">
          <select name="headlightType" defaultValue="LED" className={inputClass}>
            <option value="LED">LED</option>
            <option value="LED Projector">LED Projector</option>
            <option value="Projector LED">Projector LED</option>
            <option value="Halogen">Halogen</option>
          </select>
        </Field>
        <Field label="DRL (Daytime Running Light)">
          <YesNoSelect name="drl" />
        </Field>
        <Field label="Tail Light Type">
          <select name="tailLightType" defaultValue="LED" className={inputClass}>
            <option value="LED">LED</option>
            <option value="Bulb">Bulb</option>
          </select>
        </Field>
        <Field label="Turn Signal Type">
          <select name="turnSignalType" defaultValue="LED" className={inputClass}>
            <option value="LED">LED</option>
            <option value="Bulb">Bulb</option>
          </select>
        </Field>

        <SectionHeader title={powertrain === 'ICE' ? '10. Safety' : '12. Safety'} color="rose" />

        <Field label="CBS (Combined Braking)">
          <YesNoSelect name="cbs" />
        </Field>
        <Field label="Engine Kill Switch">
          <YesNoSelect name="engineKillSwitch" />
        </Field>
        <Field label="Side Stand Engine Cut-off">
          <YesNoSelect name="sideStandCutOff" />
        </Field>
        <Field label="Security Features">
          <input type="text" name="securityFeatures" placeholder={powertrain === 'EV' ? 'e.g. Geo-fencing, Anti-theft' : 'e.g. Anti-theft alarm'} className={inputClass} />
        </Field>

        {powertrain === 'EV' && (
          <>
            <Field label="Geo-fencing">
              <YesNoSelect name="geoFencing" />
            </Field>
            <Field label="Fall Sensor">
              <YesNoSelect name="fallSensor" />
            </Field>
            <Field label="IP Rating">
              <select name="ipRating" defaultValue="IP67" className={inputClass}>
                <option value="IP54">IP54</option>
                <option value="IP65">IP65</option>
                <option value="IP67">IP67</option>
                <option value="IP68">IP68</option>
              </select>
            </Field>
          </>
        )}

        <SectionHeader title={powertrain === 'ICE' ? '11. Images' : '13. Images'} color="orange" />

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
          <p className="text-xs text-slate-500">
            Add image URLs (local paths like <code>/bikes/image.webp</code> or external URLs). First image is used as the card thumbnail.
          </p>
        </div>

        <SectionHeader title="14. BikeHub 50-Point Inspection" color="teal" />

        <div className="space-y-6 md:col-span-3">
          <p className="text-sm text-slate-500">
            Each checkpoint counts as 1 point. Pass = 1, Fail = 0.
          </p>

          {inspectionSections.map((section) => (
            <div key={section.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-1.5 rounded-full bg-slate-900" />
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                  {section.title}
                </h4>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                  {section.points.length} points
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {section.points.map((point) => {
                  const answerLabels = inspectionAnswerLabels[point] ?? defaultInspectionAnswerLabels;

                  return (
                    <div
                      key={`${section.title}-${point}`}
                      className="rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="mb-2 text-sm font-medium text-slate-800">
                        {inspectionQuestions[point] ?? `${point}?`}
                      </div>
                      <InspectionCheckbox
                        name={inspectionFieldName(section.title, point)}
                        passLabel={answerLabels.passLabel}
                        failLabel={answerLabels.failLabel}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          disabled={loading}
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Add Used Vehicle'}
        </button>
      </div>
    </form>
  );
}

export function AddVehicleModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    try {
      const result = await createVehicle(formData);

      if (!result.success) {
        alert(result.error ?? 'Failed to add vehicle');
        return;
      }

      setOpen(false);
    } catch (error) {
      console.error(error);
      alert('Failed to add vehicle');
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
          Add Vehicle
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-slate-200 bg-white sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Add Used Vehicle</DialogTitle>
            <DialogDescription className="text-slate-500">
              Add a used vehicle listing with the same bike-spec structure as the catalog form, or auto-fill it from an existing catalog bike.
            </DialogDescription>
          </DialogHeader>
          <VehicleForm onSubmit={handleCreate} loading={loading} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
