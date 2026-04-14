import Link from "next/link";
import { ArrowRight, Bike as BikeIcon, Gauge, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, formatBdt, headlineMetric, powertrainBadgeClass } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

type BikeCardProps = {
  bike: Bike;
};

export function BikeCard({ bike }: BikeCardProps) {
  const hasImage = bike.images && bike.images.length > 0;

  return (
    <Card className="overflow-hidden border-slate-200 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* ─── Image / Placeholder ─── */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
        {hasImage ? (
          <img
            src={bike.images![0]}
            alt={`${bike.brand} ${bike.model}`}
            className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
            <BikeIcon className="h-12 w-12" />
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">No Image</span>
          </div>
        )}
        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className="bg-slate-900/80 text-white backdrop-blur-sm hover:bg-slate-900/80">{bike.category}</Badge>
        </div>
        <div className="absolute right-3 top-3">
          <Badge variant="outline" className={cn(powertrainBadgeClass(bike.powertrain), "backdrop-blur-sm")}>
            {bike.powertrain}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3 pt-4">
        <CardTitle className="font-heading text-3xl uppercase leading-none tracking-wide text-slate-900">
          {bike.brand} {bike.model}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
