/**
 * 50-Point Inspection Checklist for Used Vehicles.
 *
 * Each category has a set of checkpoints. Each checkpoint is scored
 * as Pass (1) / Fail (0) / N/A (excluded from total).
 * Final score = (passes / applicable items) × 50, displayed as "XX / 50".
 */

export type CheckpointScore = 'pass' | 'fail' | 'na';

export type InspectionCheckpoint = {
  key: string;
  label: string;
};

export type InspectionCategory = {
  title: string;
  color: string;
  items: InspectionCheckpoint[];
};

export const inspectionCategories: InspectionCategory[] = [
  {
    title: 'Engine & Drivetrain',
    color: 'rose',
    items: [
      { key: 'engine_start', label: 'Engine starts smoothly' },
      { key: 'engine_idle', label: 'Stable idle (no stalling)' },
      { key: 'engine_noise', label: 'No abnormal engine noise' },
      { key: 'engine_smoke', label: 'No excessive exhaust smoke' },
      { key: 'engine_oil', label: 'Engine oil level & condition OK' },
      { key: 'coolant', label: 'Coolant level & no leaks' },
      { key: 'clutch', label: 'Clutch engagement smooth' },
      { key: 'gearbox', label: 'All gears shift cleanly' },
      { key: 'chain_belt', label: 'Chain/belt condition & tension' },
      { key: 'throttle', label: 'Throttle response smooth' },
    ],
  },
  {
    title: 'Brakes & Suspension',
    color: 'amber',
    items: [
      { key: 'front_brake_pad', label: 'Front brake pad thickness OK' },
      { key: 'rear_brake_pad', label: 'Rear brake pad thickness OK' },
      { key: 'brake_disc', label: 'Brake disc(s) not warped' },
      { key: 'brake_fluid', label: 'Brake fluid level & condition' },
      { key: 'abs_function', label: 'ABS functioning (if equipped)' },
      { key: 'front_fork', label: 'Front fork seals & travel OK' },
      { key: 'rear_shock', label: 'Rear shock absorber OK' },
      { key: 'swingarm', label: 'Swingarm bearings tight' },
      { key: 'steering_head', label: 'Steering head bearing smooth' },
      { key: 'handlebar', label: 'Handlebars aligned & tight' },
    ],
  },
  {
    title: 'Wheels & Tyres',
    color: 'cyan',
    items: [
      { key: 'front_tyre_tread', label: 'Front tyre tread depth OK' },
      { key: 'rear_tyre_tread', label: 'Rear tyre tread depth OK' },
      { key: 'tyre_sidewall', label: 'No tyre sidewall cracks/bulges' },
      { key: 'wheel_spoke', label: 'Wheels/spokes straight & true' },
      { key: 'wheel_bearing', label: 'Wheel bearings smooth' },
    ],
  },
  {
    title: 'Electrical & Lighting',
    color: 'purple',
    items: [
      { key: 'headlight', label: 'Headlight (low & high beam)' },
      { key: 'taillight', label: 'Taillight & brake light' },
      { key: 'indicators', label: 'All indicators working' },
      { key: 'horn', label: 'Horn functioning' },
      { key: 'battery', label: 'Battery health & charge' },
      { key: 'wiring', label: 'Wiring harness condition' },
      { key: 'instrument', label: 'Instrument cluster working' },
      { key: 'switches', label: 'Kill switch & starter button' },
    ],
  },
  {
    title: 'Frame & Body',
    color: 'emerald',
    items: [
      { key: 'frame_crack', label: 'No frame cracks or bends' },
      { key: 'paint', label: 'Paint/bodywork condition' },
      { key: 'seat', label: 'Seat condition & latch' },
      { key: 'mirrors', label: 'Both mirrors intact' },
      { key: 'footpegs', label: 'Footpegs & stands secure' },
      { key: 'exhaust', label: 'Exhaust system secure, no leaks' },
      { key: 'fender', label: 'Fenders & mudguards intact' },
      { key: 'fuel_tank', label: 'Fuel tank — no dents/rust/leaks' },
    ],
  },
  {
    title: 'Fluids & Consumables',
    color: 'blue',
    items: [
      { key: 'air_filter', label: 'Air filter clean/replaced' },
      { key: 'spark_plug', label: 'Spark plug condition' },
      { key: 'fuel_line', label: 'Fuel lines & no leaks' },
      { key: 'cable_condition', label: 'Cables (clutch/throttle/brake)' },
    ],
  },
  {
    title: 'Road Test',
    color: 'orange',
    items: [
      { key: 'acceleration', label: 'Acceleration smooth' },
      { key: 'braking_test', label: 'Braking effective & straight' },
      { key: 'vibration', label: 'No abnormal vibrations' },
      { key: 'handling', label: 'Stable handling & cornering' },
      { key: 'noise_test', label: 'No unusual noises at speed' },
    ],
  },
];

/** Total number of checkpoints across all categories = 50 */
export const totalCheckpoints = inspectionCategories.reduce(
  (sum, cat) => sum + cat.items.length,
  0
);

/**
 * Compute the inspection score from a map of checkpoint key → score.
 * Returns { passed, applicable, score50 } where score50 is the 0–50 rating.
 */
export function computeInspectionScore(scores: Record<string, CheckpointScore>) {
  let passed = 0;
  let applicable = 0;

  for (const category of inspectionCategories) {
    for (const item of category.items) {
      const value = scores[item.key];
      if (value === 'pass') {
        passed++;
        applicable++;
      } else if (value === 'fail') {
        applicable++;
      }
      // 'na' or undefined → excluded
    }
  }

  const score50 = applicable > 0 ? Math.round((passed / applicable) * 50) : 0;

  return { passed, applicable, score50 };
}

/**
 * Serialize inspection scores into a compact string for storage.
 * Format: "50P:engine_start=pass,engine_idle=fail,...|Score:42/50"
 */
export function serializeInspection(scores: Record<string, CheckpointScore>): string {
  const { score50 } = computeInspectionScore(scores);
  const entries = Object.entries(scores)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join(',');
  return `50P:${entries}|Score:${score50}/50`;
}

/**
 * Deserialize an inspection string back into a scores map.
 */
export function deserializeInspection(value: string | null | undefined): Record<string, CheckpointScore> {
  const scores: Record<string, CheckpointScore> = {};
  if (!value) return scores;

  // Try the "50P:..." format
  const match = /^50P:(.+?)(?:\|Score:.+)?$/.exec(value);
  if (!match) return scores;

  const entries = match[1].split(',');
  for (const entry of entries) {
    const [key, val] = entry.split('=');
    if (key && (val === 'pass' || val === 'fail' || val === 'na')) {
      scores[key] = val;
    }
  }

  return scores;
}

/**
 * Extract the /50 score from the stored inspection status string.
 * Returns null if no 50-point score is found.
 */
export function extractInspectionScore(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /Score:(\d+)\/50/.exec(value);
  return match ? Number(match[1]) : null;
}
