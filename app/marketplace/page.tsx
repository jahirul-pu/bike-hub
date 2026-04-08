import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bikes, formatBdt, headlineMetric } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

export default function MarketplacePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Marketplace</p>
        <h1 className="mt-2 flex items-center gap-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          <ShoppingBag className="h-10 w-10" />
          Bike Marketplace
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Browse listed bikes and jump directly to detailed specs and comparison views.
        </p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bikes.map((bike) => (
          <Card key={bike.slug} className="border-slate-200 bg-white/90">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
                  {bike.brand} {bike.model}
                </CardTitle>
                <Badge variant="outline" className="border-slate-300 text-slate-700">
                  {bike.powertrain}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>{bike.summary}</p>
              <p className="font-semibold text-slate-900">{formatBdt(bike.priceBdt)}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{headlineMetric(bike)}</p>
              <div className="flex gap-2">
                <Link
                  href={`/bikes/${bike.slug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-slate-300")}
                >
                  View Specs
                </Link>
                <Link
                  href={`/compare?bikes=${bike.slug}`}
                  className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 text-white hover:bg-slate-700")}
                >
                  Compare
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
