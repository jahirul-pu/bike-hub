import Link from "next/link";
import { Bike as BikeIcon, Megaphone, ShieldCheck, ShoppingBag, User, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bikes, Bike, formatBdt, headlineMetric } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

const spareParts = [
  {
    id: "part-001",
    name: "Chain & Sprocket Kit",
    fitment: "150cc - 200cc street bikes",
    condition: "New",
    priceBdt: 6500,
  },
  {
    id: "part-002",
    name: "Front Brake Pads",
    fitment: "Dual-piston caliper setup",
    condition: "New",
    priceBdt: 1800,
  },
  {
    id: "part-003",
    name: "LED Headlamp Assembly",
    fitment: "Universal 12V motorcycle",
    condition: "New",
    priceBdt: 4200,
  },
  {
    id: "part-004",
    name: "Rear Shock Absorber Pair",
    fitment: "Scooter 110cc - 125cc",
    condition: "Used - Excellent",
    priceBdt: 3000,
  },
  {
    id: "part-005",
    name: "Portable EV Charger",
    fitment: "72V electric bikes",
    condition: "Used - Good",
    priceBdt: 9800,
  },
  {
    id: "part-006",
    name: "Tubeless Tyre Pair",
    fitment: "Front 90/90-17 | Rear 120/80-17",
    condition: "New",
    priceBdt: 7600,
  },
];

const certifiedSlugs = new Set(["yamaha-r15-v4", "suzuki-vstrom-250", "ultraviolette-f77"]);
const promotedSlugs = new Set(["honda-cb350rs", "ather-450x-gen3", "revolt-rv400-brz"]);

function UsedBikeCard({ bike, badgeLabel }: { bike: Bike; badgeLabel: string }) {
  return (
    <Card className="border-slate-200 bg-white/90">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
            {bike.brand} {bike.model}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-slate-300 text-slate-700">
              {bike.powertrain}
            </Badge>
            <Badge className="bg-slate-900 text-white hover:bg-slate-900">{badgeLabel}</Badge>
          </div>
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
  );
}

export default function MarketplacePage() {
  const bikeHubCertified = bikes.filter((bike) => certifiedSlugs.has(bike.slug));
  const promoted = bikes.filter((bike) => promotedSlugs.has(bike.slug) && !certifiedSlugs.has(bike.slug));
  const userListed = bikes.filter(
    (bike) => !certifiedSlugs.has(bike.slug) && !promotedSlugs.has(bike.slug)
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Marketplace</p>
        <h1 className="mt-2 flex items-center gap-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          <ShoppingBag className="h-10 w-10" />
          Bike Marketplace
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Browse two dedicated sections for spare parts and used vehicles.
        </p>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-heading text-4xl uppercase tracking-wide text-slate-900">
            <Wrench className="h-7 w-7" />
            Spare Parts
          </h2>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            {spareParts.length} listings
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {spareParts.map((part) => (
            <Card key={part.id} className="border-slate-200 bg-white/90">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
                    {part.name}
                  </CardTitle>
                  <Badge variant="outline" className="border-slate-300 text-slate-700">
                    {part.condition}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <p>{part.fitment}</p>
                <p className="font-semibold text-slate-900">{formatBdt(part.priceBdt)}</p>
                <div className="flex gap-2">
                  <Link
                    href="/showrooms"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-slate-300")}
                  >
                    Check Availability
                  </Link>
                  <Link
                    href="/showrooms"
                    className={cn(buttonVariants({ size: "sm" }), "bg-slate-900 text-white hover:bg-slate-700")}
                  >
                    Contact Seller
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-heading text-4xl uppercase tracking-wide text-slate-900">
            <BikeIcon className="h-7 w-7" />
            Used Vehicles
          </h2>
          <Badge variant="outline" className="border-slate-300 text-slate-700">
            {bikes.length} listings
          </Badge>
        </div>

        <div className="space-y-8">
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-heading text-3xl uppercase tracking-wide text-slate-900">
                <ShieldCheck className="h-6 w-6" />
                BikeHub Certified
              </h3>
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                {bikeHubCertified.length} listings
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bikeHubCertified.map((bike) => (
                <UsedBikeCard key={bike.slug} bike={bike} badgeLabel="Certified" />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-heading text-3xl uppercase tracking-wide text-slate-900">
                <Megaphone className="h-6 w-6" />
                Promoted
              </h3>
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                {promoted.length} listings
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {promoted.map((bike) => (
                <UsedBikeCard key={bike.slug} bike={bike} badgeLabel="Promoted" />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-heading text-3xl uppercase tracking-wide text-slate-900">
                <User className="h-6 w-6" />
                User Listed
              </h3>
              <Badge variant="outline" className="border-slate-300 text-slate-700">
                {userListed.length} listings
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {userListed.map((bike) => (
                <UsedBikeCard key={bike.slug} bike={bike} badgeLabel="User Listed" />
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
