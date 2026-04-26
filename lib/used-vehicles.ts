import type { Bike } from '@/lib/bikes-data';
import { extractInspectionScore } from '@/lib/inspection';

export type RegistrationStatus = 'Registered' | 'On Test';

export type UsedVehicleFrontendListing = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  category: Bike['category'];
  powertrain: Bike['powertrain'];
  priceBdt: number;
  askingPrice: number;
  displacementCc: number | null;
  motorPowerKw: number | null;
  topSpeedKph: number;
  mileageKmpl: number | null;
  rangeKm: number | null;
  odometerKm: number | null;
  images: string[];
  summary: string;
  inspectionStatus: string | null;
  inspectionScore: number | null;
  registrationStatus: RegistrationStatus;
  registrationNumber: string | null;
  registrationValidityPeriod: string | null;
  purchaseDate: string | null;
  createdAt: string;
  certificationStatus: string;
};

type UsedVehicleRecord = {
  id: string;
  slug: string | null;
  model: string | null;
  name: string | null;
  category: string | null;
  powertrain: string | null;
  priceBdt: number | null;
  askingPrice: number | null;
  displacementCc: number | null;
  motorPowerKw: number | null;
  topSpeedKph: number | null;
  mileageKmpl: number | null;
  rangeKm: number | null;
  images: string | null;
  summary: string | null;
  createdAt: Date | string;
  brand?: { name: string | null } | null;
  inspection?: { status: string | null } | null;
  certificationStatus?: string | null;
};

const registrationStatusPrefix = 'Registration Status:';
const registrationNumberPrefix = 'Registration Number:';
const registrationValidityPrefix = 'Registration Validity:';
const purchaseDatePrefix = 'Purchase Date:';
const odometerPrefix = 'Odometer:';

function normalizeCategory(category: string | null | undefined): Bike['category'] {
  if (category === 'Sport' || category === 'Adventure' || category === 'Scooter' || category === 'Commuter') {
    return category;
  }

  if (category?.toLowerCase() === 'scooter') {
    return 'Scooter';
  }

  return 'Commuter';
}

function normalizePowertrain(powertrain: string | null | undefined): Bike['powertrain'] {
  return powertrain === 'EV' ? 'EV' : 'ICE';
}

export function parseUsedVehicleImages(images: string | null | undefined): string[] {
  if (!images?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
    }
  } catch {
    // Fall back to treating the stored value as a single URL string.
  }

  return [images.trim()];
}

export function extractUsedVehicleRegistration(summary: string | null | undefined) {
  const parts = (summary ?? '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  let registrationStatus: RegistrationStatus = 'On Test';
  let registrationNumber: string | null = null;
  let registrationValidityPeriod: string | null = null;
  let purchaseDate: string | null = null;
  let odometerKm: number | null = null;
  const remainingSummaryParts: string[] = [];

  for (const part of parts) {
    if (part.startsWith(registrationStatusPrefix)) {
      registrationStatus = part.slice(registrationStatusPrefix.length).trim() === 'Registered' ? 'Registered' : 'On Test';
      continue;
    }

    if (part.startsWith(registrationNumberPrefix)) {
      registrationNumber = part.slice(registrationNumberPrefix.length).trim() || null;
      continue;
    }

    if (part.startsWith(registrationValidityPrefix)) {
      registrationValidityPeriod = part.slice(registrationValidityPrefix.length).trim() || null;
      continue;
    }

    if (part.startsWith(purchaseDatePrefix)) {
      purchaseDate = part.slice(purchaseDatePrefix.length).trim() || null;
      continue;
    }

    if (part.startsWith(odometerPrefix)) {
      const value = Number(part.slice(odometerPrefix.length).replace(/[^0-9.]/g, ''));
      odometerKm = Number.isFinite(value) ? value : null;
      continue;
    }

    const legacyOdometerMatch = /^(?:Odometer Reading|Used|Kilometers Used):\s*([\d,.]+)\s*km$/i.exec(part);
    if (legacyOdometerMatch) {
      const value = Number(legacyOdometerMatch[1]?.replace(/,/g, ''));
      odometerKm = Number.isFinite(value) ? value : null;
      continue;
    }

    const legacyRegisteredMatch = /^Registration:\s*Registered\s*\((.+?),\s*(.+)\)$/i.exec(part);
    if (legacyRegisteredMatch) {
      registrationStatus = 'Registered';
      registrationNumber = legacyRegisteredMatch[1]?.trim() || null;
      registrationValidityPeriod = legacyRegisteredMatch[2]?.trim() || null;
      continue;
    }

    if (/^Registration:\s*On Test$/i.test(part)) {
      registrationStatus = 'On Test';
      continue;
    }

    remainingSummaryParts.push(part);
  }

  return {
    registrationStatus,
    registrationNumber,
    registrationValidityPeriod,
    purchaseDate,
    odometerKm,
    listingSummary: remainingSummaryParts.join(' | '),
  };
}

export function formatUsedVehicleDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function parseUsedVehicleRating(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const directMatch = /(?:rating:\s*)?(\d+(?:\.\d+)?)\s*\/\s*5/i.exec(value);
  if (directMatch) {
    const rating = Number(directMatch[1]);
    return Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : null;
  }

  const legacyInspectionMatch = /(\d+)\s*\/\s*(\d+)\s*checks?\s+passed/i.exec(value);
  if (legacyInspectionMatch) {
    const passed = Number(legacyInspectionMatch[1]);
    const total = Number(legacyInspectionMatch[2]);

    if (Number.isFinite(passed) && Number.isFinite(total) && total > 0) {
      return Math.max(0, Math.min(5, Number(((passed / total) * 5).toFixed(1))));
    }
  }

  return null;
}

export function formatUsedVehicleRating(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return 'Not rated';
  }

  return `${value.toFixed(1)}/5`;
}

export function serializeUsedVehicle(record: UsedVehicleRecord): UsedVehicleFrontendListing {
  const registration = extractUsedVehicleRegistration(record.summary);
  const brandName = record.brand?.name?.trim() || 'BikeHub';
  const modelName = record.model?.trim() || record.name?.trim() || 'Used Vehicle';
  const safeSlug =
    record.slug?.trim() ||
    `${brandName}-${modelName}-${record.id}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  return {
    id: record.id,
    slug: safeSlug,
    brand: brandName,
    model: modelName,
    category: normalizeCategory(record.category),
    powertrain: normalizePowertrain(record.powertrain),
    priceBdt: record.priceBdt ?? record.askingPrice ?? 0,
    askingPrice: record.askingPrice ?? record.priceBdt ?? 0,
    displacementCc: record.displacementCc ?? null,
    motorPowerKw: record.motorPowerKw ?? null,
    topSpeedKph: record.topSpeedKph ?? 0,
    mileageKmpl: record.mileageKmpl ?? null,
    rangeKm: record.rangeKm ?? null,
    odometerKm: registration.odometerKm,
    images: parseUsedVehicleImages(record.images),
    summary: registration.listingSummary || 'BikeHub marketplace user listing.',
    inspectionStatus: record.inspection?.status ?? null,
    inspectionScore: extractInspectionScore(record.inspection?.status),
    registrationStatus: registration.registrationStatus,
    registrationNumber: registration.registrationNumber,
    registrationValidityPeriod: registration.registrationValidityPeriod,
    purchaseDate: registration.purchaseDate,
    createdAt:
      record.createdAt instanceof Date ? record.createdAt.toISOString() : new Date(record.createdAt).toISOString(),
    certificationStatus: record.certificationStatus ?? 'APPROVED',
  };
}
