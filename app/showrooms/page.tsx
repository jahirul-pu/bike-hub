import { MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const showrooms = [
  { city: "Dhaka", name: "Bike Hub Motijheel", phone: "+880 1711-000001", address: "45 Outer Circular Rd" },
  { city: "Chattogram", name: "Bike Hub GEC", phone: "+880 1711-000002", address: "15 CDA Avenue" },
  { city: "Khulna", name: "Bike Hub Sonadanga", phone: "+880 1711-000003", address: "71 Upper Jessore Rd" },
  { city: "Rajshahi", name: "Bike Hub Lakshmipur", phone: "+880 1711-000004", address: "28 Greater Rd" },
  { city: "Sylhet", name: "Bike Hub Zindabazar", phone: "+880 1711-000005", address: "11 Dargah Gate" },
  { city: "Rangpur", name: "Bike Hub Modern Mor", phone: "+880 1711-000006", address: "9 Station Rd" },
];

export default function ShowroomsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dealer Network</p>
        <h1 className="mt-2 font-heading text-5xl uppercase tracking-wide text-slate-900 sm:text-6xl">
          Showroom Directory
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Check local stock and final on-road pricing with your nearest authorized bike hub showroom.
        </p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {showrooms.map((showroom) => (
          <Card key={showroom.phone} className="border-slate-200 bg-white/90">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{showroom.city}</p>
              <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
                {showroom.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>{showroom.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{showroom.phone}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
