'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const optionalNumber = z.preprocess(
  (value) => (value === '' || value == null ? undefined : value),
  z.coerce.number().optional()
);

const VehicleInputSchema = z.object({
  model: z.string().min(1),
  brand: z.string().optional(),
  make: z.string().optional(),
  category: z.string().optional(),
  powertrain: z.string().optional(),
  powerSource: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  priceBdt: optionalNumber,
  askingPrice: optionalNumber,
  registrationStatus: z.enum(['Registered', 'On Test']).optional(),
  registrationNumber: z.string().optional(),
  registrationValidityPeriod: z.string().optional(),
  images: z.string().optional(),
  displacementCc: optionalNumber,
  engineDisplacement: optionalNumber,
  motorPowerKw: optionalNumber,
  peakPowerKw: optionalNumber,
  topSpeedKph: optionalNumber,
  mileageKmpl: optionalNumber,
  rangeKm: optionalNumber,
  maxRangeKm: optionalNumber,
  fuelTankLiters: optionalNumber,
  chargingTime0100: z.string().optional(),
  batteryCycleLife: z.string().optional(),
  ipRating: z.string().optional(),
  gearbox: z.string().optional(),
  torqueNm: optionalNumber,
  weightKg: optionalNumber,
  seatHeightMm: optionalNumber,
  wheelbaseMm: optionalNumber,
  groundClearanceMm: optionalNumber,
  frontTyre: z.string().optional(),
  rearTyre: z.string().optional(),
  batteryType: z.string().optional(),
  voltageV: optionalNumber,
  ampHours: optionalNumber,
  lengthMm: optionalNumber,
  widthMm: optionalNumber,
  heightMm: optionalNumber,
  underseatStorage: z.string().optional(),
  frontBrake: z.string().optional(),
  rearBrake: z.string().optional(),
  absType: z.string().optional(),
  frontSuspension: z.string().optional(),
  rearSuspension: z.string().optional(),
  ridingModes: z.string().optional(),
  securityFeatures: z.string().optional(),
  appSupport: z.string().optional(),
  displayType: z.string().optional(),
  headlightType: z.string().optional(),
  bluetoothConnectivity: z.string().optional(),
  gpsTracking: z.string().optional(),
  navigation: z.string().optional(),
  keylessStart: z.string().optional(),
  usbChargingPort: z.string().optional(),
  otaUpdates: z.string().optional(),
  tractionControl: z.string().optional(),
  cruiseControl: z.string().optional(),
}).passthrough();

function normalizeInput(input: FormData | Record<string, unknown>) {
  if (input instanceof FormData) {
    return Object.fromEntries(input.entries());
  }

  return input;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function summarizeInspection(input: Record<string, unknown>) {
  const inspectionEntries = Object.entries(input).filter(([key]) => key.startsWith('inspection__'));
  const passedCount = inspectionEntries.filter(([, value]) => value === 'pass').length;
  const totalCount = inspectionEntries.length;

  return {
    passedCount,
    totalCount,
    statusLabel:
      totalCount > 0 ? `Processing (${passedCount}/${totalCount} checks passed)` : 'Processing',
  };
}

export async function createVehicle(input: FormData | Record<string, unknown>) {
  try {
    const normalizedInput = normalizeInput(input);
    const parsed = VehicleInputSchema.parse(normalizedInput);
    const brandName = parsed.brand || parsed.make;
    const inspectionSummary = summarizeInspection(normalizedInput);
    const registrationStatus = parsed.registrationStatus || 'On Test';
    const registrationNumber = parsed.registrationNumber?.trim();
    const registrationValidityPeriod = parsed.registrationValidityPeriod?.trim();

    if (!brandName) {
      return { success: false, error: 'Brand or make is required.' };
    }

    if (registrationStatus === 'Registered' && (!registrationNumber || !registrationValidityPeriod)) {
      return {
        success: false,
        error: 'Registered vehicles need both a registration number and validity period.',
      };
    }

    const powertrain = parsed.powertrain || parsed.powerSource || 'ICE';
    const baseSlug = slugify(`${brandName}-${parsed.model}`);
    const slugSuffix = slugify(registrationNumber || `${registrationStatus}-${Date.now().toString(36)}`).slice(0, 18);
    const generatedSlug = `${baseSlug}-${slugSuffix || Date.now().toString(36)}`;
    const registrationSummary = [
      `Registration Status: ${registrationStatus}`,
      registrationNumber ? `Registration Number: ${registrationNumber}` : null,
      registrationValidityPeriod ? `Registration Validity: ${registrationValidityPeriod}` : null,
    ]
      .filter((value): value is string => Boolean(value))
      .join(' | ');
    const listingSummary = [parsed.summary, parsed.description, registrationSummary]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .join(' | ');

    await db.vehicle.create({
      data: {
        slug: generatedSlug,
        brand: {
          connectOrCreate: {
            where: { slug: slugify(brandName) },
            create: {
              name: brandName,
              slug: slugify(brandName),
              powertrain: powertrain === 'EV' ? 'EV' : 'ICE',
            },
          },
        },
        model: parsed.model,
        name: parsed.model,
        category: parsed.category || 'Commuter',
        powertrain,
        summary: listingSummary || null,
        priceBdt: parsed.priceBdt ?? parsed.askingPrice ?? 0,
        displacementCc: parsed.displacementCc ?? parsed.engineDisplacement ?? null,
        motorPowerKw: parsed.motorPowerKw ?? null,
        peakPowerKw: parsed.peakPowerKw ?? null,
        topSpeedKph: parsed.topSpeedKph ?? null,
        mileageKmpl: parsed.mileageKmpl ?? null,
        rangeKm: parsed.rangeKm ?? parsed.maxRangeKm ?? null,
        fuelTankLiters: parsed.fuelTankLiters ?? null,
        chargingTime0100: parsed.chargingTime0100 || null,
        batteryCycleLife: parsed.batteryCycleLife || null,
        ipRating: parsed.ipRating || null,
        gearbox: parsed.gearbox || null,
        torqueNm: parsed.torqueNm ?? null,
        weightKg: parsed.weightKg ?? null,
        seatHeightMm: parsed.seatHeightMm ?? null,
        wheelbaseMm: parsed.wheelbaseMm ?? null,
        groundClearanceMm: parsed.groundClearanceMm ?? null,
        frontTyre: parsed.frontTyre || null,
        rearTyre: parsed.rearTyre || null,
        images: parsed.images || null,
        batteryType: parsed.batteryType || null,
        voltageV: parsed.voltageV ?? null,
        ampHours: parsed.ampHours ?? null,
        lengthMm: parsed.lengthMm ?? null,
        widthMm: parsed.widthMm ?? null,
        heightMm: parsed.heightMm ?? null,
        underseatStorage: parsed.underseatStorage || null,
        frontBrake: parsed.frontBrake || null,
        rearBrake: parsed.rearBrake || null,
        absType: parsed.absType || null,
        frontSuspension: parsed.frontSuspension || null,
        rearSuspension: parsed.rearSuspension || null,
        ridingModes: parsed.ridingModes || null,
        securityFeatures: parsed.securityFeatures || null,
        appSupport: parsed.appSupport || null,
        displayType: parsed.displayType || null,
        headlightType: parsed.headlightType || null,
        bluetoothConnectivity: parsed.bluetoothConnectivity || null,
        gpsTracking: parsed.gpsTracking || null,
        navigation: parsed.navigation || null,
        keylessStart: parsed.keylessStart || null,
        usbChargingPort: parsed.usbChargingPort || null,
        otaUpdates: parsed.otaUpdates || null,
        tractionControl: parsed.tractionControl || null,
        cruiseControl: parsed.cruiseControl || null,
        vin: null,
        chassis: null,
        askingPrice: parsed.askingPrice ?? 0,
        certificationStatus: 'PENDING_APPROVAL',
        inspection: {
          create: {
            status: inspectionSummary.statusLabel,
          },
        },
      },
    });

    revalidatePath('/admin/inventory/vehicles');
    revalidatePath('/admin/marketplace/used-vehicles');
    revalidatePath('/admin');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Vehicle creation failed:', error);
    return { success: false, error: 'Failed to create vehicle' };
  }
}
