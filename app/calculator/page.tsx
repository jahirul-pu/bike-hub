import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import { EvSavingsCalculator } from "@/components/site/ev-savings-calculator";
import BikeLoanCalculator from "@/components/site/bike-loan-calculator";

export const metadata: Metadata = {
  title: "Fuel vs. EV Savings Calculator | Bike Hub",
  description:
    "Calculate how much you can save by switching from a petrol bike to an electric bike. Compare monthly fuel, maintenance, and break-even costs.",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Calculator
        </p>
        <h1 className="mt-2 flex items-center gap-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          <Calculator className="h-10 w-10" />
          EV Savings
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Estimate how much you could save each month and year by going
          electric — and how long it takes to break even.
        </p>
      </section>

      <EvSavingsCalculator />
      <div className="mt-10">
        <BikeLoanCalculator />
      </div>
    </div>
  );
}
