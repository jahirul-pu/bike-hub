import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { BikeCard } from "@/components/site/bike-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bikes } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

export default function Home() {
  const featured = bikes.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
        <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">Built for riders, not spreadsheets</Badge>
        <h1 className="mt-4 max-w-4xl font-heading text-6xl uppercase leading-[0.92] tracking-wide text-slate-900 sm:text-7xl lg:text-8xl">
          Bike Information and Comparison, One Fast Workflow
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600 sm:text-lg">
          Discover specs, compare real purchase options, and check local showroom pricing for both ICE and EV bikes.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/bikes"
            className={cn(buttonVariants(), "bg-slate-900 text-white hover:bg-slate-700")}
          >
            Explore Bikes
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/compare"
            className={cn(buttonVariants({ variant: "outline" }), "border-slate-300 bg-white")}
          >
            Start Comparison
          </Link>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <Card className="border-slate-200 bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Zap className="h-4 w-4 text-amber-600" />
                EV and ICE Logic
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Auto-adaptive specs for fuel bikes and electric bikes.
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                High Density Specs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Compact category grids tuned for faster purchase decisions.
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <ArrowRight className="h-4 w-4 text-sky-600" />
                Local Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Showroom directory for city-level price discovery.
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8 bg-slate-300/60" />

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Featured Bikes</p>
            <h2 className="mt-2 font-heading text-5xl uppercase tracking-wide text-slate-900">Popular Picks</h2>
          </div>
          <Link
            href="/bikes"
            className={cn(buttonVariants({ variant: "outline" }), "border-slate-300 bg-white")}
          >
            View All Bikes
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((bike) => (
            <BikeCard key={bike.slug} bike={bike} />
          ))}
        </div>
      </section>
    </div>
  );
}
