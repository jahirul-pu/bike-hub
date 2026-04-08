import Link from "next/link";
import { ArrowRight, Gauge, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, formatBdt, headlineMetric } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

type BikeCardProps = {
  bike: Bike;
};

export function BikeCard({ bike }: BikeCardProps) {
  return (
    <Card className="border-slate-200 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="mb-3 flex items-center justify-between">
          <Badge className="bg-slate-900 text-white hover:bg-slate-900">{bike.category}</Badge>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            {bike.powertrain}
          </Badge>
        </div>
        <CardTitle className="font-heading text-3xl uppercase leading-none tracking-wide text-slate-900">
          {bike.brand} {bike.model}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">{bike.summary}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-slate-100 p-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
            <p className="font-semibold text-slate-900">{formatBdt(bike.priceBdt)}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {bike.powertrain === "ICE" ? "Engine CC" : "Motor Output"}
            </p>
            <p className="font-semibold text-slate-900">{headlineMetric(bike)}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">Top Speed</p>
            <p className="flex items-center gap-1 font-semibold text-slate-900">
              <Gauge className="h-3.5 w-3.5" />
              {bike.topSpeedKph} km/h
            </p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              {bike.powertrain === "ICE" ? "Mileage" : "Range"}
            </p>
            <p className="flex items-center gap-1 font-semibold text-slate-900">
              <Sparkles className="h-3.5 w-3.5" />
              {bike.powertrain === "ICE" ? `${bike.mileageKmpl} km/l` : `${bike.rangeKm} km`}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Link
          href={`/compare?bikes=${bike.slug}`}
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Compare
        </Link>
        <Link
          href={`/bikes/${bike.slug}`}
          className={cn(buttonVariants(), "w-full bg-slate-900 text-white hover:bg-slate-700")}
        >
          View Specs
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
