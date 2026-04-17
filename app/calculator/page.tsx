import type { Metadata } from "next";
import { Calculator, Zap, FileText } from "lucide-react";
import { EvSavingsCalculator } from "@/components/site/ev-savings-calculator";
import BikeLoanCalculator from "@/components/site/bike-loan-calculator";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Calculators | Bike Hub",
  description:
    "Calculate your financial options: compare fuel vs EV savings, or estimate your bike loan EMIs.",
};

export default async function CalculatorPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab === "loan" ? "loan" : "ev";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Financial Tools
        </p>
        <h1 className="mt-2 flex items-center gap-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          <Calculator className="h-10 w-10" />
          {currentTab === "ev" ? "EV Savings" : "Loan EMIs"}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {currentTab === "ev" 
            ? "Estimate how much you could save each month and year by going electric — and how long it takes to break even."
            : "Estimate your monthly loan installments based on down payment, interest rate, and duration."}
        </p>
      </section>

      {/* TABS MENU */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        <Link 
          href="?tab=ev" 
          className={cn(
            "flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors",
            currentTab === "ev" 
              ? "border-amber-500 text-slate-900" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <Zap className={cn("h-4 w-4", currentTab === "ev" ? "text-amber-500" : "")} />
          EV Savings Calculator
        </Link>
        <Link 
          href="?tab=loan" 
          className={cn(
            "flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors",
            currentTab === "loan" 
              ? "border-amber-500 text-slate-900" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <FileText className={cn("h-4 w-4", currentTab === "loan" ? "text-amber-500" : "")} />
          Bike Loan Calculator
        </Link>
      </div>

      <div className="tab-content transition-all duration-300">
        {currentTab === "ev" ? (
          <EvSavingsCalculator />
        ) : (
          <BikeLoanCalculator />
        )}
      </div>
    </div>
  );
}
