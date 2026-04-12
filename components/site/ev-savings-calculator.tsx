"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Fuel,
  Zap,
  TrendingDown,
  Calendar,
  Clock,
  Bike,
  Gauge,
  Wrench,
  Leaf,
  ArrowRight,
  BatteryCharging,
  CircleDollarSign,
  Tag,
  Battery,
} from "lucide-react";


/* ─── Constants (2026 Bangladesh rates) ─────────────────────────── */
const DEFAULT_OCTANE_RATE = 122; // Tk/L
const DEFAULT_ELECTRICITY_RATE = 8.5; // Tk/kWh
const DEFAULT_EV_RANGE = 80; // km per full charge (typical EV bike)
const DEFAULT_BATTERY_CAPACITY = 2.4; // kWh (typical EV bike battery)
// Note: Battery, fuel & electricity are now all user-editable

/* ─── Animated Number ───────────────────────────────────────────── */
function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  duration = 600,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = to;
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString("en-BD", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ─── Input Row ─────────────────────────────────────────────────── */
function InputRow({
  icon: Icon,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const [localValue, setLocalValue] = useState(String(value));
  const prevValueRef = useRef(value);

  // Sync local text when the parent value changes externally
  useEffect(() => {
    if (value !== prevValueRef.current) {
      setLocalValue(String(value));
      prevValueRef.current = value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);
    // Push valid numbers to parent immediately (no clamping while typing)
    const num = Number(raw);
    if (raw !== "" && !Number.isNaN(num)) {
      onChange(num);
      prevValueRef.current = num;
    }
  };

  const commit = () => {
    const num = Number(localValue);
    if (localValue === "" || Number.isNaN(num)) {
      // Reset to current value
      setLocalValue(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, num));
    onChange(clamped);
    setLocalValue(String(clamped));
    prevValueRef.current = clamped;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      commit();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-2 transition-all focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 hover:border-slate-300 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {label}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={localValue}
              min={min}
              max={max}
              step={step}
              onChange={handleChange}
              onBlur={commit}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm font-semibold tabular-nums text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="shrink-0 pr-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Pill ─────────────────────────────────────────────────── */
function StatPill({
  icon: Icon,
  label,
  value,
  prefix = "৳",
  suffix = "",
  isMoney = true,
  decimals = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isMoney?: boolean;
  decimals?: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <AnimatedNumber
        value={value}
        prefix={isMoney ? prefix : ""}
        suffix={suffix}
        decimals={decimals}
        className="text-3xl font-extrabold tracking-tight text-slate-900"
      />
    </div>
  );
}

function CostCard({
  type,
  icon: Icon,
  monthlyFuel,
  monthlyMaintenance,
}: {
  type: string;
  icon: React.ElementType;
  monthlyFuel: number;
  monthlyMaintenance?: number;
}) {
  const total = monthlyFuel + (monthlyMaintenance ?? 0);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {type}
          </p>
          <p className="text-sm font-medium text-slate-700">Cost Breakdown</p>
        </div>
      </div>

      {/* Cost rows */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 rounded-lg bg-slate-50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700 mb-1">
            {type === "ICE Bike" ? "Fuel (Octane)" : "Electricity"}
          </span>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-slate-500">Daily</span>
            <AnimatedNumber
              value={monthlyFuel / 30}
              prefix="৳"
              className="font-mono text-sm font-semibold text-slate-800"
            />
          </div>
          <div className="flex items-center justify-between">
             <span className="text-xs uppercase tracking-wide text-slate-500">Monthly</span>
             <AnimatedNumber
               value={monthlyFuel}
               prefix="৳"
               className="font-mono text-sm font-semibold text-slate-800"
             />
          </div>
          <div className="flex items-center justify-between">
             <span className="text-xs uppercase tracking-wide text-slate-500">Yearly</span>
             <AnimatedNumber
               value={monthlyFuel * 12}
               prefix="৳"
               className="font-mono text-sm font-semibold text-slate-800"
             />
          </div>
        </div>
        {monthlyMaintenance != null && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">Maintenance</span>
            <AnimatedNumber
              value={monthlyMaintenance}
              prefix="৳"
              className="font-mono text-sm font-semibold text-slate-800"
            />
          </div>
        )}
        <div className="h-px bg-slate-200" />
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-bold uppercase tracking-wide text-slate-700">Total / Month</span>
          <AnimatedNumber
            value={total}
            prefix="৳"
            className="font-mono text-xl font-extrabold text-slate-900"
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export function EvSavingsCalculator() {
  const [dailyKm, setDailyKm] = useState(20);
  const [mileage, setMileage] = useState(40);
  const [iceMaintenance, setIceMaintenance] = useState(1500);
  const [fuelPrice, setFuelPrice] = useState(DEFAULT_OCTANE_RATE);
  const [electricityPrice, setElectricityPrice] = useState(DEFAULT_ELECTRICITY_RATE);
  const [evRange, setEvRange] = useState(DEFAULT_EV_RANGE);
  const [batteryVoltage, setBatteryVoltage] = useState(60);
  const [batteryAh, setBatteryAh] = useState(40);
  const [icePrice, setIcePrice] = useState(150_000);
  const [evPrice, setEvPrice] = useState(270_000);

  // Derived: kWh from V × Ah
  const batteryCapacity = (batteryVoltage * batteryAh) / 1000;

  /* ─── Derived calculations ─────────────────────────────────── */
  const calc = useCallback(() => {
    const monthlyKm = dailyKm * 30;

    // ICE costs
    const iceFuelLitres = monthlyKm / mileage;
    const iceMonthlyFuel = iceFuelLitres * fuelPrice;
    const iceMonthlyTotal = iceMonthlyFuel + iceMaintenance;

    // EV costs — derive kWh/km from range & battery capacity
    const evEfficiency = evRange > 0 ? batteryCapacity / evRange : 0.03;
    const evMonthlyElectricity = monthlyKm * evEfficiency * electricityPrice;
    const evMonthlyTotal = evMonthlyElectricity;

    // Savings
    const monthlySavings = iceMonthlyTotal - evMonthlyTotal;
    const annualSavings = monthlySavings * 12;
    const priceDiff = Math.max(0, evPrice - icePrice);
    const breakEvenMonths =
      monthlySavings > 0 && priceDiff > 0
        ? Math.ceil(priceDiff / monthlySavings)
        : monthlySavings > 0 && priceDiff === 0
          ? 0
          : Infinity;

    // CO₂ saved (avg ICE bike ~70g/km, EV ~0)
    const annualCO2Saved = (monthlyKm * 12 * 70) / 1000; // kg

    return {
      monthlyKm,
      iceMonthlyFuel,
      iceMonthlyTotal,
      evMonthlyElectricity,
      evMonthlyTotal,
      monthlySavings,
      annualSavings,
      breakEvenMonths,
      annualCO2Saved,
    };
  }, [dailyKm, mileage, iceMaintenance, fuelPrice, electricityPrice, evRange, batteryCapacity, icePrice, evPrice]);

  const data = calc();

  const breakEvenText =
    data.breakEvenMonths === Infinity
      ? "N/A"
      : data.breakEvenMonths <= 12
        ? `${data.breakEvenMonths} month${data.breakEvenMonths !== 1 ? "s" : ""}`
        : `${(data.breakEvenMonths / 12).toFixed(1)} years`;

  return (
    <div className="space-y-8">
      {/* ── Title area ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 shadow-sm text-white">
                <Zap className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Savings Calculator
              </p>
            </div>
            <h2 className="font-heading text-4xl uppercase tracking-wide text-slate-900 sm:text-5xl">
              Fuel <span className="text-slate-400">vs.</span> EV
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              See how much you can save by switching from an ICE bike to an
              electric bike. Based on real-world local rates.
            </p>
          </div>

          {/* Quick stat badge */}
          <div className="flex w-fit items-center gap-3 rounded-lg bg-slate-100 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="text-sm leading-tight text-slate-500">
              <p className="uppercase tracking-wide text-xs">CO₂ Saved Avg</p>
              <p className="font-semibold text-slate-900">
                <AnimatedNumber value={data.annualCO2Saved} decimals={0} suffix=" kg / yr" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Configuration ─────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* ICE Column */}
        <div className="space-y-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">
            ICE Parameters
          </p>
          <InputRow
            icon={Tag}
            label="ICE Bike Price"
            value={icePrice}
            min={0}
            max={1_000_000}
            step={5000}
            unit="Tk"
            onChange={setIcePrice}
          />
          <InputRow
            icon={Gauge}
            label="Current Mileage"
            value={mileage}
            min={5}
            max={120}
            step={1}
            unit="km/L"
            onChange={setMileage}
          />
          <InputRow
            icon={Fuel}
            label="Fuel Price (Octane)"
            value={fuelPrice}
            min={50}
            max={300}
            step={1}
            unit="Tk/L"
            onChange={setFuelPrice}
          />
          <InputRow
            icon={Wrench}
            label="Monthly Maintenance"
            value={iceMaintenance}
            min={0}
            max={10000}
            step={100}
            unit="Tk"
            onChange={setIceMaintenance}
          />
        </div>

        {/* Common Column */}
        <div className="space-y-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">
            Common
          </p>
          <InputRow
            icon={Bike}
            label="Daily Commute"
            value={dailyKm}
            min={1}
            max={500}
            step={1}
            unit="km"
            onChange={setDailyKm}
          />
        </div>

        {/* EV Column */}
        <div className="space-y-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">
            EV Parameters
          </p>
          <InputRow
            icon={Tag}
            label="EV Bike Price"
            value={evPrice}
            min={0}
            max={1_000_000}
            step={5000}
            unit="Tk"
            onChange={setEvPrice}
          />
          <InputRow
            icon={BatteryCharging}
            label="EV Range (per charge)"
            value={evRange}
            min={20}
            max={200}
            step={5}
            unit="km"
            onChange={setEvRange}
          />
          <InputRow
            icon={CircleDollarSign}
            label="Electricity Price"
            value={electricityPrice}
            min={1}
            max={30}
            step={0.5}
            unit="Tk/kWh"
            onChange={setElectricityPrice}
          />
          <InputRow
            icon={Battery}
            label="Battery Voltage"
            value={batteryVoltage}
            min={12}
            max={120}
            step={12}
            unit="V"
            onChange={setBatteryVoltage}
          />
          <div>
            <InputRow
              icon={Battery}
              label="Battery Capacity"
              value={batteryAh}
              min={5}
              max={100}
              step={1}
              unit="Ah"
              onChange={setBatteryAh}
            />
            <p className="mt-2 text-right text-xs text-slate-400">
              Calculated: <strong className="text-slate-600">{batteryCapacity.toFixed(2)} kWh</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── Comparison: ICE vs EV cards ─────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* ICE Card */}
        <CostCard
          type="ICE Bike"
          icon={Fuel}
          monthlyFuel={data.iceMonthlyFuel}
          monthlyMaintenance={iceMaintenance}
        />

        {/* Arrow / vs separator */}
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
            <ArrowRight className="h-5 w-5 text-slate-400 max-lg:rotate-90" />
          </div>
        </div>

        {/* EV Card */}
        <CostCard
          type="EV Bike"
          icon={Zap}
          monthlyFuel={data.evMonthlyElectricity}
        />
      </div>

      {/* ── Results: Savings + Break-even ────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatPill
          icon={TrendingDown}
          label="Monthly Savings"
          value={data.monthlySavings}
        />
        <StatPill
          icon={Calendar}
          label="Annual Savings"
          value={data.annualSavings}
        />

        {/* Break-even is special — can be text */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Clock className="h-4 w-4" />
            Time to Break Even
          </div>
          {data.breakEvenMonths !== Infinity ? (
            <AnimatedNumber
              value={data.breakEvenMonths}
              suffix={data.breakEvenMonths <= 12 ? " months" : ""}
              decimals={0}
              className="text-3xl font-extrabold tracking-tight text-slate-900"
            />
          ) : (
            <span className="text-3xl font-extrabold tracking-tight text-slate-400">
              N/A
            </span>
          )}
          {data.breakEvenMonths !== Infinity && data.breakEvenMonths > 12 && (
            <p className="mt-1 text-sm font-semibold text-slate-500">
              ≈ {breakEvenText}
            </p>
          )}
        </div>
      </div>

      {/* ── Note footer ─────────────────────────────────────── */}
      <p className="text-center text-xs text-slate-400">
        CO₂ estimate uses ~70 g/km for ICE bikes. All other values are user-configurable above.
      </p>
    </div>
  );
}
