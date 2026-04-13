"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { saveInspectionReport } from "@/app/(admin)/admin/certification/actions";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Define points and steps
const STEPS = [
  { id: "documentation", label: "Documentation", keys: [
    "doc_blue_book", "doc_tax_token", "doc_insurance", "doc_vin_match"
  ] },
  { id: "chassis", label: "Chassis", keys: [
    "chassis_frame_integrity", "chassis_swingarm", "chassis_paint", "chassis_stand", "chassis_fasteners"
  ] },
  { id: "wheels", label: "Wheels & Brakes", keys: [
    "front_tire_tread","rear_tire_tread","front_tire_pressure","rear_tire_pressure",
    "front_brake_pads","rear_brake_pads","brake_fluid_level","brake_rotor_condition"
  ] },
  { id: "electrical", label: "Electrical", keys: [
    "lights_headlight","lights_tail_light","indicators","horn","console_display","wiring_harness"
  ] },
  { id: "powercore", label: "Power Core", keys: [
    "powercore_a","powercore_b","powercore_c","powercore_d" // will be mapped to ICE/EV labels client-side
  ] },
  { id: "suspension", label: "Suspension", keys: [
    "front_forks_seals","rear_shock_linkage","suspension_seals","suspension_play"
  ] },
  { id: "drivetrain", label: "Drivetrain", keys: [
    "chain_belt_tension","sprockets_condition","clutch_play_generic","gearbox_operation"
  ] },
  { id: "cooling", label: "Cooling & Fluids", keys: [
    "engine_oil_level","coolant_level","leak_check"
  ] },
  { id: "safety", label: "Safety", keys: [
    "abs_tcs_function","immobilizer","side_stand_sensor"
  ] },
  { id: "controls", label: "Controls & Accessories", keys: [
    "mirrors","foot_controls","throttle_response","dashboard_buttons"
  ] },
  { id: "final", label: "Final Sign-off", keys: [
    "test_ride_stability","braking_performance","acceleration_check","noise_vibration","founder_signature"
  ] },
];

const ALL_KEYS = STEPS.flatMap(s => s.keys);

const ICE_POWERCORE_LABELS: Record<string, string> = {
  powercore_a: "Engine Oil",
  powercore_b: "Spark Plug",
  powercore_c: "Clutch Play",
  powercore_d: "Exhaust",
};

const EV_POWERCORE_LABELS: Record<string, string> = {
  powercore_a: "Battery SoH",
  powercore_b: "BMS Status",
  powercore_c: "Charging Port",
  powercore_d: "Motor Controller",
};

const pointStatusOptions = ["Pass", "Warning", "Fail"] as const;


export default function CertificationPage() {
  const params = useParams();
  const vehicleId = String(params?.id ?? "");

  const defaultPoints = useMemo(() => {
    const obj: Record<string, { status?: string; note?: string }> = {};
    for (const k of ALL_KEYS) obj[k] = { status: undefined, note: "" };
    return obj;
  }, []);

  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues: { vehicleId, powerSource: "ICE", points: defaultPoints },
  });

  const { isSubmitting } = formState;
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  // Load from localStorage
  useEffect(() => {
    const key = `inspection:${vehicleId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        reset(parsed);
      } catch (e) {
        // ignore
      }
    } else {
      reset({ vehicleId, powerSource: "ICE", points: defaultPoints });
    }
  }, [vehicleId, reset, defaultPoints]);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    const subscription = watch((val) => {
      const key = `inspection:${vehicleId}`;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
      }, 600);
    });
    return () => subscription.unsubscribe?.();
  }, [watch, vehicleId]);
  // watch all values so component re-renders on change
  const watched = watch();

  const filledCount = useMemo(() => {
    const vals = watched ?? {};
    let count = 0;
    const pts = vals.points ?? {};
    for (const k of ALL_KEYS) {
      if (pts?.[k]?.status) count++;
    }
    return count;
  }, [watched]);

  const progress = Math.round((filledCount / 50) * 100);

  const next = () => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setCurrentStep((s) => Math.max(0, s - 1));

  const onSubmit = async (values: any) => {
    // derive server-expected powerCore shape from the powercore entries in points
    const pts = values.points ?? {};
    const ps = values.powerSource ?? "ICE";

    let powerCore: any;
    if (ps === "ICE") {
      powerCore = {
        engineOil: pts.powercore_a,
        sparkPlug: pts.powercore_b,
        clutchPlay: pts.powercore_c,
        exhaust: pts.powercore_d,
      };
    } else {
      powerCore = {
        batterySoh: pts.powercore_a,
        bmsStatus: pts.powercore_b,
        chargingPort: pts.powercore_c,
        motorController: pts.powercore_d,
      };
    }

    const payload = { vehicleId, powerSource: ps, points: pts, powerCore };
    const res = await saveInspectionReport(payload);
    if (res?.success) {
      setMessage("Inspection saved and vehicle marked PENDING_APPROVAL");
      localStorage.removeItem(`inspection:${vehicleId}`);
      reset({ vehicleId, powerSource: "ICE", points: defaultPoints });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage(res.error || "Failed to save report");
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // helper to render label for a key
  const labelFor = (key: string, powerSource: string) => {
    if (key.startsWith("doc_")) return key.replace("doc_", "").split("_").map(w => w[0].toUpperCase()+w.slice(1)).join(' ');
    if (key.startsWith("chassis_")) return key.replace("chassis_", "").split("_").map(w => w[0].toUpperCase()+w.slice(1)).join(' ');
    if (key.startsWith("front_") || key.startsWith("rear_") || key.startsWith("brake_") || key.startsWith("lights_") || key.startsWith("suspension_") ) return key.split('_').map(w => w[0].toUpperCase()+w.slice(1)).join(' ');
    if (key.startsWith("powercore_")) return powerSource === "ICE" ? ICE_POWERCORE_LABELS[key] || key : EV_POWERCORE_LABELS[key] || key;
    return key.split('_').map(w => w[0].toUpperCase()+w.slice(1)).join(' ');
  };

  const powerSource = watch("powerSource") ?? "ICE";

  return (
    <div className="p-4 md:p-8 ml-0 md:ml-64">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Vehicle Inspection</h1>
        <p className="text-sm text-slate-500 mb-4">Vehicle ID: {vehicleId}</p>

        <div className="w-full bg-slate-100 rounded h-3 overflow-hidden mb-4">
          <div className="h-full bg-emerald-600" style={{ width: `${progress}%` }} />
        </div>
        <div className="mb-4 text-sm">Progress: {filledCount}/50 ({progress}%)</div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <h2 className="font-semibold text-lg">{STEPS[currentStep].label}</h2>
            <div className="mt-3 space-y-3">
              {STEPS[currentStep].keys.map((key) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start border-b pb-2">
                  <div className="md:col-span-1">
                    <div className="font-medium">{labelFor(key, powerSource)}</div>
                  </div>
                  <div className="md:col-span-2 flex gap-2 items-center">
                    <select {...register(`points.${key}.status`)} className="border p-2 rounded-md w-40">
                      <option value="">Select status</option>
                      {pointStatusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                    <input {...register(`points.${key}.note`)} placeholder="Note (optional)" className="flex-1 border p-2 rounded-md" />
                  </div>
                </div>
              ))}

              {/* powercore values are captured in `points.powercore_*` and mapped on submit */}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-6">
            <button type="button" onClick={prev} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-100">
              <ArrowLeft /> Previous
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="inline-flex items-center gap-2 px-3 py-2 rounded bg-slate-900 text-white">
                Next <ArrowRight />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white">
                {isSubmitting ? "Submitting..." : "Submit Inspection"}
              </button>
            )}
          </div>
        </form>

        {message && <div className="mt-4 p-3 rounded bg-emerald-100 text-emerald-800">{message}</div>}
      </div>
    </div>
  );
}
