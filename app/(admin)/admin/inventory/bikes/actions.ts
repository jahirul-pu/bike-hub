'use server';

import { revalidatePath } from 'next/cache';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

/* ─── Helper: parse all form fields ─── */
function parseFormFields(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string) || undefined;
  const num = (key: string) => {
    const v = parseFloat(formData.get(key) as string);
    return isNaN(v) ? undefined : v;
  };

  return {
    brand: formData.get('brand') as string,
    model: formData.get('model') as string,
    category: formData.get('category') as string,
    powertrain: formData.get('powertrain') as string,
    summary: formData.get('summary') as string,
    priceBdt: num('priceBdt') ?? 0,
    topSpeedKph: num('topSpeedKph') ?? 0,
    torqueNm: num('torqueNm') ?? 0,
    weightKg: num('weightKg') ?? 0,
    seatHeightMm: num('seatHeightMm') ?? 0,
    wheelbaseMm: num('wheelbaseMm') ?? 0,
    groundClearanceMm: num('groundClearanceMm') ?? 0,
    frontTyre: str('frontTyre') ?? '',
    rearTyre: str('rearTyre') ?? '',

    // ICE
    displacementCc: num('displacementCc'),
    mileageKmpl: num('mileageKmpl'),
    fuelTankLiters: num('fuelTankLiters'),
    gearbox: str('gearbox'),

    // EV - motor
    motorPowerKw: num('motorPowerKw'),
    peakPowerKw: num('peakPowerKw'),
    rangeKm: num('rangeKm'),

    // EV - battery
    batteryType: str('batteryType'),
    voltageV: num('voltageV'),
    ampHours: num('ampHours'),
    chargingTime0100: str('chargingTime0100'),
    batteryCycleLife: str('batteryCycleLife'),
    ipRating: str('ipRating'),

    // EV - dimensions
    lengthMm: num('lengthMm'),
    widthMm: num('widthMm'),
    heightMm: num('heightMm'),
    underseatStorage: str('underseatStorage'),

    // EV - brakes/suspension
    frontBrake: str('frontBrake'),
    rearBrake: str('rearBrake'),
    absType: str('absType'),
    frontSuspension: str('frontSuspension'),
    rearSuspension: str('rearSuspension'),

    // EV - smart
    ridingModes: str('ridingModes'),
    securityFeatures: str('securityFeatures'),
    appSupport: str('appSupport'),
  };
}

/* ─── Helper: build a TS object literal string from fields ─── */
function buildBikeEntryString(slug: string, f: ReturnType<typeof parseFormFields>): string {
  const lines: string[] = [
    `  {`,
    `    slug: "${slug}",`,
    `    brand: "${f.brand}",`,
    `    model: "${f.model}",`,
    `    category: "${f.category}" as const,`,
    `    powertrain: "${f.powertrain}" as const,`,
    `    priceBdt: ${f.priceBdt},`,
    `    topSpeedKph: ${f.topSpeedKph},`,
    `    torqueNm: ${f.torqueNm},`,
    `    weightKg: ${f.weightKg},`,
    `    seatHeightMm: ${f.seatHeightMm},`,
    `    wheelbaseMm: ${f.wheelbaseMm},`,
    `    groundClearanceMm: ${f.groundClearanceMm},`,
    `    frontTyre: "${f.frontTyre}",`,
    `    rearTyre: "${f.rearTyre}",`,
    `    summary: "${f.summary.replace(/"/g, '\\"').replace(/\n/g, ' ')}",`,
  ];

  // ICE fields
  if (f.powertrain === 'ICE') {
    if (f.displacementCc != null) lines.push(`    displacementCc: ${f.displacementCc},`);
    if (f.mileageKmpl != null) lines.push(`    mileageKmpl: ${f.mileageKmpl},`);
    if (f.fuelTankLiters != null) lines.push(`    fuelTankLiters: ${f.fuelTankLiters},`);
    if (f.gearbox) lines.push(`    gearbox: "${f.gearbox}",`);
  }

  // EV fields
  if (f.powertrain === 'EV') {
    if (f.motorPowerKw != null) lines.push(`    motorPowerKw: ${f.motorPowerKw},`);
    if (f.peakPowerKw != null) lines.push(`    peakPowerKw: ${f.peakPowerKw},`);
    if (f.rangeKm != null) lines.push(`    rangeKm: ${f.rangeKm},`);
    if (f.batteryType) lines.push(`    batteryType: "${f.batteryType}",`);
    if (f.voltageV != null) lines.push(`    voltageV: ${f.voltageV},`);
    if (f.ampHours != null) lines.push(`    ampHours: ${f.ampHours},`);
    if (f.chargingTime0100) lines.push(`    chargingTime0100: "${f.chargingTime0100}",`);
    if (f.batteryCycleLife) lines.push(`    batteryCycleLife: "${f.batteryCycleLife}",`);
    if (f.ipRating) lines.push(`    ipRating: "${f.ipRating}",`);
    if (f.lengthMm != null) lines.push(`    lengthMm: ${f.lengthMm},`);
    if (f.widthMm != null) lines.push(`    widthMm: ${f.widthMm},`);
    if (f.heightMm != null) lines.push(`    heightMm: ${f.heightMm},`);
    if (f.underseatStorage) lines.push(`    underseatStorage: "${f.underseatStorage}",`);
    if (f.frontBrake) lines.push(`    frontBrake: "${f.frontBrake}",`);
    if (f.rearBrake) lines.push(`    rearBrake: "${f.rearBrake}",`);
    if (f.absType) lines.push(`    absType: "${f.absType}",`);
    if (f.frontSuspension) lines.push(`    frontSuspension: "${f.frontSuspension}",`);
    if (f.rearSuspension) lines.push(`    rearSuspension: "${f.rearSuspension}",`);
    if (f.ridingModes) lines.push(`    ridingModes: "${f.ridingModes}",`);
    if (f.securityFeatures) lines.push(`    securityFeatures: "${f.securityFeatures}",`);
    if (f.appSupport) lines.push(`    appSupport: "${f.appSupport}",`);
  }

  lines.push(`  },`);
  return lines.join('\n');
}

function getBikesDataPath() {
  return path.join(process.cwd(), 'lib', 'bikes-data.ts');
}

/* ════════════════════════════════════════════════════════════════
   CREATE — appends a new bike entry to bikes-data.ts
   ════════════════════════════════════════════════════════════════ */
export async function createBikeCatalogEntry(formData: FormData) {
  const f = parseFormFields(formData);

  if (!f.brand || !f.model) {
    throw new Error('Brand and Model are required.');
  }

  const slug = `${f.brand}-${f.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const entry = buildBikeEntryString(slug, f);

  const bikesDataPath = getBikesDataPath();
  let content = readFileSync(bikesDataPath, 'utf-8');

  const closingBracketIndex = content.lastIndexOf('];');
  if (closingBracketIndex === -1) {
    throw new Error('Could not find bikes array in bikes-data.ts');
  }

  content = content.slice(0, closingBracketIndex) + entry + '\n' + content.slice(closingBracketIndex);
  writeFileSync(bikesDataPath, content, 'utf-8');

  revalidatePath('/bikes');
  revalidatePath('/admin/inventory/bikes');
  revalidatePath('/');
}

/* ════════════════════════════════════════════════════════════════
   UPDATE — finds the existing entry by slug and replaces it
   ════════════════════════════════════════════════════════════════ */
export async function updateBikeCatalogEntry(formData: FormData) {
  const originalSlug = formData.get('originalSlug') as string;
  const f = parseFormFields(formData);

  if (!f.brand || !f.model || !originalSlug) {
    throw new Error('Brand, Model, and original slug are required.');
  }

  // Keep the same slug so URLs don't break
  const slug = originalSlug;
  const entry = buildBikeEntryString(slug, f);

  const bikesDataPath = getBikesDataPath();
  let content = readFileSync(bikesDataPath, 'utf-8');

  // Find the existing entry block by its slug line
  const slugLine = `slug: "${originalSlug}"`;
  const slugIndex = content.indexOf(slugLine);
  if (slugIndex === -1) {
    throw new Error(`Could not find bike with slug "${originalSlug}" in bikes-data.ts`);
  }

  // Walk backward from slugIndex to find the opening `  {`
  let blockStart = content.lastIndexOf('\n  {', slugIndex);
  if (blockStart === -1) {
    // Could be the very first entry
    blockStart = content.lastIndexOf('  {', slugIndex);
  } else {
    blockStart += 1; // skip the newline
  }

  // Walk forward from slugIndex to find the closing `  },`
  let blockEnd = content.indexOf('\n  },', slugIndex);
  if (blockEnd === -1) {
    throw new Error('Could not find closing bracket for bike entry');
  }
  blockEnd += '\n  },'.length;

  content = content.slice(0, blockStart) + entry + content.slice(blockEnd);
  writeFileSync(bikesDataPath, content, 'utf-8');

  revalidatePath('/bikes');
  revalidatePath(`/bikes/${slug}`);
  revalidatePath('/admin/inventory/bikes');
  revalidatePath('/');
}
