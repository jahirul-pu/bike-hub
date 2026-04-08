import Link from "next/link";
import { Calculator } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CalculatorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Calculator</p>
        <h1 className="mt-2 flex items-center gap-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          <Calculator className="h-10 w-10" />
          Bike Cost Calculator
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Estimate ownership costs using down payment, fuel or charging, and yearly maintenance assumptions.
        </p>
      </section>

      <Card className="mt-6 border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
            Calculator Module
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            The full calculator experience can be added next as interactive form controls with EMI, energy, and service cost charts.
          </p>
          <Link
            href="/compare"
            className={cn(buttonVariants({ variant: "outline" }), "border-slate-300 bg-white")}
          >
            Open Compare Page
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
