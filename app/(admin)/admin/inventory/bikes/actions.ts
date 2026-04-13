'use server';

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

function parseFormFields(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string) || undefined;
  const num = (key: string) => {
    const v = parseFloat(formData.get(key) as string);
    return Number.isNaN(v) ? undefined : v;
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
    displacementCc: num('displacementCc'),
    mileageKmpl: num('mileageKmpl'),
    fuelTankLiters: num('fuelTankLiters'),
    gearbox: str('gearbox'),
    motorPowerKw: num('motorPowerKw'),
    peakPowerKw: num('peakPowerKw'),
    rangeKm: num('rangeKm'),
    batteryType: str('batteryType'),
    voltageV: num('voltageV'),
    ampHours: num('ampHours'),
    chargingTime0100: str('chargingTime0100'),
    batteryCycleLife: str('batteryCycleLife'),
    ipRating: str('ipRating'),
    lengthMm: num('lengthMm'),
    widthMm: num('widthMm'),
    heightMm: num('heightMm'),
    underseatStorage: str('underseatStorage'),
    frontBrake: str('frontBrake'),
    rearBrake: str('rearBrake'),
    absType: str('absType'),
    frontSuspension: str('frontSuspension'),
    rearSuspension: str('rearSuspension'),
    ridingModes: str('ridingModes'),
    securityFeatures: str('securityFeatures'),
    appSupport: str('appSupport'),
  };
}

function buildBikeEntryString(slug: string, fields: ReturnType<typeof parseFormFields>): string {
  const lines: string[] = [
    `  {`,
    `    slug: "${slug}",`,
    `    brand: "${fields.brand}",`,
    `    model: "${fields.model}",`,
    `    category: "${fields.category}" as const,`,
    `    powertrain: "${fields.powertrain}" as const,`,
    `    priceBdt: ${fields.priceBdt},`,
    `    topSpeedKph: ${fields.topSpeedKph},`,
    `    torqueNm: ${fields.torqueNm},`,
    `    weightKg: ${fields.weightKg},`,
    `    seatHeightMm: ${fields.seatHeightMm},`,
    `    wheelbaseMm: ${fields.wheelbaseMm},`,
    `    groundClearanceMm: ${fields.groundClearanceMm},`,
    `    frontTyre: "${fields.frontTyre}",`,
    `    rearTyre: "${fields.rearTyre}",`,
    `    summary: "${fields.summary.replace(/"/g, '\\"').replace(/\n/g, ' ')}",`,
  ];

  if (fields.powertrain === 'ICE') {
    if (fields.displacementCc != null) lines.push(`    displacementCc: ${fields.displacementCc},`);
    if (fields.mileageKmpl != null) lines.push(`    mileageKmpl: ${fields.mileageKmpl},`);
    if (fields.fuelTankLiters != null) lines.push(`    fuelTankLiters: ${fields.fuelTankLiters},`);
    if (fields.gearbox) lines.push(`    gearbox: "${fields.gearbox}",`);
  }

  if (fields.powertrain === 'EV') {
    if (fields.motorPowerKw != null) lines.push(`    motorPowerKw: ${fields.motorPowerKw},`);
    if (fields.peakPowerKw != null) lines.push(`    peakPowerKw: ${fields.peakPowerKw},`);
    if (fields.rangeKm != null) lines.push(`    rangeKm: ${fields.rangeKm},`);
    if (fields.batteryType) lines.push(`    batteryType: "${fields.batteryType}",`);
    if (fields.voltageV != null) lines.push(`    voltageV: ${fields.voltageV},`);
    if (fields.ampHours != null) lines.push(`    ampHours: ${fields.ampHours},`);
    if (fields.chargingTime0100) lines.push(`    chargingTime0100: "${fields.chargingTime0100}",`);
    if (fields.batteryCycleLife) lines.push(`    batteryCycleLife: "${fields.batteryCycleLife}",`);
    if (fields.ipRating) lines.push(`    ipRating: "${fields.ipRating}",`);
    if (fields.lengthMm != null) lines.push(`    lengthMm: ${fields.lengthMm},`);
    if (fields.widthMm != null) lines.push(`    widthMm: ${fields.widthMm},`);
    if (fields.heightMm != null) lines.push(`    heightMm: ${fields.heightMm},`);
    if (fields.underseatStorage) lines.push(`    underseatStorage: "${fields.underseatStorage}",`);
    if (fields.frontBrake) lines.push(`    frontBrake: "${fields.frontBrake}",`);
    if (fields.rearBrake) lines.push(`    rearBrake: "${fields.rearBrake}",`);
    if (fields.absType) lines.push(`    absType: "${fields.absType}",`);
    if (fields.frontSuspension) lines.push(`    frontSuspension: "${fields.frontSuspension}",`);
    if (fields.rearSuspension) lines.push(`    rearSuspension: "${fields.rearSuspension}",`);
    if (fields.ridingModes) lines.push(`    ridingModes: "${fields.ridingModes}",`);
    if (fields.securityFeatures) lines.push(`    securityFeatures: "${fields.securityFeatures}",`);
    if (fields.appSupport) lines.push(`    appSupport: "${fields.appSupport}",`);
  }

  lines.push(`  },`);
  return lines.join('\n');
}

function getBikesDataPath() {
  return path.join(process.cwd(), 'lib', 'bikes-data.ts');
}

export async function createBikeCatalogEntry(formData: FormData) {
  const fields = parseFormFields(formData);

  if (!fields.brand || !fields.model) {
    throw new Error('Brand and Model are required.');
  }

  const slug = `${fields.brand}-${fields.model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const entry = buildBikeEntryString(slug, fields);

  const bikesDataPath = getBikesDataPath();
  let content = readFileSync(bikesDataPath, 'utf-8');
  const closingBracketIndex = content.lastIndexOf('];');

  if (closingBracketIndex === -1) {
    throw new Error('Could not find bikes array in bikes-data.ts');
  }

  content = `${content.slice(0, closingBracketIndex)}${entry}\n${content.slice(closingBracketIndex)}`;
  writeFileSync(bikesDataPath, content, 'utf-8');

  revalidatePath('/bikes');
  revalidatePath('/admin/inventory/bikes');
  revalidatePath('/');
}

export async function updateBikeCatalogEntry(formData: FormData) {
  const originalSlug = formData.get('originalSlug') as string;
  const fields = parseFormFields(formData);

  if (!fields.brand || !fields.model || !originalSlug) {
    throw new Error('Brand, Model, and original slug are required.');
  }

  const entry = buildBikeEntryString(originalSlug, fields);
  const bikesDataPath = getBikesDataPath();
  let content = readFileSync(bikesDataPath, 'utf-8');

  const slugLine = `slug: "${originalSlug}"`;
  const slugIndex = content.indexOf(slugLine);
  if (slugIndex === -1) {
    throw new Error(`Could not find bike with slug "${originalSlug}" in bikes-data.ts`);
  }

  let blockStart = content.lastIndexOf('\n  {', slugIndex);
  if (blockStart === -1) {
    blockStart = content.lastIndexOf('  {', slugIndex);
  } else {
    blockStart += 1;
  }

  let blockEnd = content.indexOf('\n  },', slugIndex);
  if (blockEnd === -1) {
    throw new Error('Could not find closing bracket for bike entry');
  }
  blockEnd += '\n  },'.length;

  content = `${content.slice(0, blockStart)}${entry}${content.slice(blockEnd)}`;
  writeFileSync(bikesDataPath, content, 'utf-8');

  revalidatePath('/bikes');
  revalidatePath(`/bikes/${originalSlug}`);
  revalidatePath('/admin/inventory/bikes');
  revalidatePath('/');
}

export async function deleteBikeCatalogEntry(slug: string) {
  if (!slug) {
    throw new Error('Slug is required.');
  }

  const bikesDataPath = getBikesDataPath();
  let content = readFileSync(bikesDataPath, 'utf-8');

  const slugLine = `slug: "${slug}"`;
  const slugIndex = content.indexOf(slugLine);
  if (slugIndex === -1) {
    throw new Error(`Could not find bike with slug "${slug}" in bikes-data.ts`);
  }

  let blockStart = content.lastIndexOf('\n  {', slugIndex);
  if (blockStart === -1) {
    blockStart = content.lastIndexOf('  {', slugIndex);
  } else {
    blockStart += 1;
  }

  let blockEnd = content.indexOf('\n  },', slugIndex);
  if (blockEnd === -1) {
    throw new Error('Could not find closing bracket for bike entry');
  }
  blockEnd += '\n  },'.length;

  let nextContent = `${content.slice(0, blockStart)}${content.slice(blockEnd)}`;
  nextContent = nextContent.replace(/\n{3,}/g, '\n\n');
  writeFileSync(bikesDataPath, nextContent, 'utf-8');

  revalidatePath('/bikes');
  revalidatePath(`/bikes/${slug}`);
  revalidatePath('/admin/inventory/bikes');
  revalidatePath('/');
}
