import { bikes } from "@/lib/bikes-data";

export type UniversalSearchType = "Bike" | "Category" | "Spare" | "Showroom";

export type UniversalSearchItem = {
  id: string;
  type: UniversalSearchType;
  title: string;
  description: string;
  href: string;
  keywords: string[];
};

const bikeItems: UniversalSearchItem[] = bikes.map((bike) => ({
  id: `bike-${bike.slug}`,
  type: "Bike",
  title: `${bike.brand} ${bike.model}`,
  description: `${bike.powertrain} ${bike.category} | ${bike.summary}`,
  href: `/bikes/${bike.slug}`,
  keywords: [bike.brand, bike.model, bike.category, bike.powertrain, bike.slug],
}));

const categoryItems: UniversalSearchItem[] = Array.from(new Set(bikes.map((bike) => bike.category))).map(
  (category) => ({
    id: `category-${category.toLowerCase()}`,
    type: "Category",
    title: `${category} Bikes`,
    description: `Browse ${category.toLowerCase()} models and compare specs`,
    href: "/bikes",
    keywords: [category, "bike category", "segment", "bikes"],
  })
);

const spareItems: UniversalSearchItem[] = [
  {
    id: "spare-drivetrain",
    type: "Spare",
    title: "Chain & Sprocket Kit",
    description: "Parts > Drivetrain",
    href: "/marketplace",
    keywords: ["chain", "sprocket", "parts", "drivetrain", "spare"],
  },
  {
    id: "spare-brake-pads",
    type: "Spare",
    title: "Front Brake Pads",
    description: "Parts > Braking",
    href: "/marketplace",
    keywords: ["brake", "pads", "braking", "parts", "spare"],
  },
  {
    id: "spare-tyres",
    type: "Spare",
    title: "Tubeless Tyre Pair",
    description: "Parts > Tyres",
    href: "/marketplace",
    keywords: ["tyre", "tire", "tubeless", "parts", "spare"],
  },
  {
    id: "spare-accessories",
    type: "Spare",
    title: "Accessories",
    description: "Touring, electronics, and rider utility gear",
    href: "/marketplace",
    keywords: ["accessories", "mobile holder", "touring", "spare"],
  },
  {
    id: "spare-additives",
    type: "Spare",
    title: "Additives",
    description: "Engine oil, flush oil, octane booster, fuel cleaner",
    href: "/marketplace",
    keywords: ["additives", "engine oil", "octane", "fuel cleaner", "spare"],
  },
];

const showroomItems: UniversalSearchItem[] = [
  {
    id: "showroom-dhaka",
    type: "Showroom",
    title: "Bike Hub Motijheel",
    description: "Dhaka | 45 Outer Circular Rd",
    href: "/showrooms",
    keywords: ["dhaka", "motijheel", "dealer", "showroom"],
  },
  {
    id: "showroom-chattogram",
    type: "Showroom",
    title: "Bike Hub GEC",
    description: "Chattogram | 15 CDA Avenue",
    href: "/showrooms",
    keywords: ["chattogram", "gec", "dealer", "showroom"],
  },
  {
    id: "showroom-khulna",
    type: "Showroom",
    title: "Bike Hub Sonadanga",
    description: "Khulna | 71 Upper Jessore Rd",
    href: "/showrooms",
    keywords: ["khulna", "sonadanga", "dealer", "showroom"],
  },
  {
    id: "showroom-rajshahi",
    type: "Showroom",
    title: "Bike Hub Lakshmipur",
    description: "Rajshahi | 28 Greater Rd",
    href: "/showrooms",
    keywords: ["rajshahi", "lakshmipur", "dealer", "showroom"],
  },
  {
    id: "showroom-sylhet",
    type: "Showroom",
    title: "Bike Hub Zindabazar",
    description: "Sylhet | 11 Dargah Gate",
    href: "/showrooms",
    keywords: ["sylhet", "zindabazar", "dealer", "showroom"],
  },
  {
    id: "showroom-rangpur",
    type: "Showroom",
    title: "Bike Hub Modern Mor",
    description: "Rangpur | 9 Station Rd",
    href: "/showrooms",
    keywords: ["rangpur", "modern mor", "dealer", "showroom"],
  },
];

export const universalSearchIndex: UniversalSearchItem[] = [
  ...bikeItems,
  ...categoryItems,
  ...spareItems,
  ...showroomItems,
];
