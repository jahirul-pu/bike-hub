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

  let images: string[] = [];
  try {
    const raw = formData.get('images') as string;
    if (raw) images = JSON.parse(raw);
  } catch { /* ignore */ }

  const colors = ((formData.get('colors') as string) || '')
    .split(',')
    .map((color) => color.trim())
    .filter(Boolean);

  return {
    brand: formData.get('brand') as string,
    model: formData.get('model') as string,
    category: formData.get('category') as string,
    powertrain: formData.get('powertrain') as string,
    summary: formData.get('summary') as string,
    colors,
    priceBdt: num('priceBdt') ?? 0,
    topSpeedKph: num('topSpeedKph') ?? 0,
    torqueNm: num('torqueNm') ?? 0,
    weightKg: num('weightKg') ?? 0,
    seatHeightMm: num('seatHeightMm') ?? 0,
    wheelbaseMm: num('wheelbaseMm') ?? 0,
    groundClearanceMm: num('groundClearanceMm') ?? 0,
    frontTyre: str('frontTyre') ?? '',
    rearTyre: str('rearTyre') ?? '',
    images,
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
    displayType: str('displayType'),
    headlightType: str('headlightType'),
    bluetoothConnectivity: str('bluetoothConnectivity'),
    gpsTracking: str('gpsTracking'),
    navigation: str('navigation'),
    keylessStart: str('keylessStart'),
    usbChargingPort: str('usbChargingPort'),
    otaUpdates: str('otaUpdates'),
    tractionControl: str('tractionControl'),
    cruiseControl: str('cruiseControl'),
    // Safety
    cbs: str('cbs'),
    engineKillSwitch: str('engineKillSwitch'),
    sideStandCutOff: str('sideStandCutOff'),
    geoFencing: str('geoFencing'),
    fallSensor: str('fallSensor'),
    // Lighting extras
    drl: str('drl'),
    tailLightType: str('tailLightType'),
    turnSignalType: str('turnSignalType'),
    // Brakes & Wheels extras
    wheelType: str('wheelType'),
    tyreType: str('tyreType'),
    quickShifter: str('quickShifter'),
    // Chassis extras (ICE)
    frameType: str('frameType'),
    clutchType: str('clutchType'),
    finalDrive: str('finalDrive'),
    // Fuel extras (ICE)
    fuelType: str('fuelType'),
    reserveFuelCapacity: str('reserveFuelCapacity'),
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

  if (fields.images.length > 0) {
    const imgArr = fields.images.map((url) => `"${url}"`).join(', ');
    lines.push(`    images: [${imgArr}],`);
  }

  if (fields.colors.length > 0) {
    const colorArr = fields.colors.map((color) => `"${color.replace(/"/g, '\\"')}"`).join(', ');
    lines.push(`    colors: [${colorArr}],`);
  }

  // ICE-only fields
  if (fields.powertrain === 'ICE') {
    if (fields.displacementCc != null) lines.push(`    displacementCc: ${fields.displacementCc},`);
    if (fields.mileageKmpl != null) lines.push(`    mileageKmpl: ${fields.mileageKmpl},`);
    if (fields.fuelTankLiters != null) lines.push(`    fuelTankLiters: ${fields.fuelTankLiters},`);
    if (fields.gearbox) lines.push(`    gearbox: "${fields.gearbox}",`);
    if (fields.clutchType) lines.push(`    clutchType: "${fields.clutchType}",`);
    if (fields.finalDrive) lines.push(`    finalDrive: "${fields.finalDrive}",`);
    if (fields.fuelType) lines.push(`    fuelType: "${fields.fuelType}",`);
    if (fields.reserveFuelCapacity) lines.push(`    reserveFuelCapacity: "${fields.reserveFuelCapacity}",`);
    if (fields.frameType) lines.push(`    frameType: "${fields.frameType}",`);
  }

  // EV-only fields
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
    if (fields.underseatStorage) lines.push(`    underseatStorage: "${fields.underseatStorage}",`);
    if (fields.gpsTracking) lines.push(`    gpsTracking: "${fields.gpsTracking}",`);
    if (fields.keylessStart) lines.push(`    keylessStart: "${fields.keylessStart}",`);
    if (fields.otaUpdates) lines.push(`    otaUpdates: "${fields.otaUpdates}",`);
    if (fields.geoFencing) lines.push(`    geoFencing: "${fields.geoFencing}",`);
    if (fields.fallSensor) lines.push(`    fallSensor: "${fields.fallSensor}",`);
  }

  // Shared fields (both ICE and EV)
  if (fields.lengthMm != null) lines.push(`    lengthMm: ${fields.lengthMm},`);
  if (fields.widthMm != null) lines.push(`    widthMm: ${fields.widthMm},`);
  if (fields.heightMm != null) lines.push(`    heightMm: ${fields.heightMm},`);
  if (fields.frontBrake) lines.push(`    frontBrake: "${fields.frontBrake}",`);
  if (fields.rearBrake) lines.push(`    rearBrake: "${fields.rearBrake}",`);
  if (fields.absType) lines.push(`    absType: "${fields.absType}",`);
  if (fields.wheelType) lines.push(`    wheelType: "${fields.wheelType}",`);
  if (fields.tyreType) lines.push(`    tyreType: "${fields.tyreType}",`);
  if (fields.frontSuspension) lines.push(`    frontSuspension: "${fields.frontSuspension}",`);
  if (fields.rearSuspension) lines.push(`    rearSuspension: "${fields.rearSuspension}",`);
  if (fields.displayType) lines.push(`    displayType: "${fields.displayType}",`);
  if (fields.headlightType) lines.push(`    headlightType: "${fields.headlightType}",`);
  if (fields.drl) lines.push(`    drl: "${fields.drl}",`);
  if (fields.tailLightType) lines.push(`    tailLightType: "${fields.tailLightType}",`);
  if (fields.turnSignalType) lines.push(`    turnSignalType: "${fields.turnSignalType}",`);
  if (fields.bluetoothConnectivity) lines.push(`    bluetoothConnectivity: "${fields.bluetoothConnectivity}",`);
  if (fields.navigation) lines.push(`    navigation: "${fields.navigation}",`);
  if (fields.ridingModes) lines.push(`    ridingModes: "${fields.ridingModes}",`);
  if (fields.tractionControl) lines.push(`    tractionControl: "${fields.tractionControl}",`);
  if (fields.cruiseControl) lines.push(`    cruiseControl: "${fields.cruiseControl}",`);
  if (fields.quickShifter) lines.push(`    quickShifter: "${fields.quickShifter}",`);
  if (fields.usbChargingPort) lines.push(`    usbChargingPort: "${fields.usbChargingPort}",`);
  if (fields.appSupport) lines.push(`    appSupport: "${fields.appSupport}",`);
  if (fields.securityFeatures) lines.push(`    securityFeatures: "${fields.securityFeatures}",`);
  if (fields.cbs) lines.push(`    cbs: "${fields.cbs}",`);
  if (fields.engineKillSwitch) lines.push(`    engineKillSwitch: "${fields.engineKillSwitch}",`);
  if (fields.sideStandCutOff) lines.push(`    sideStandCutOff: "${fields.sideStandCutOff}",`);

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
