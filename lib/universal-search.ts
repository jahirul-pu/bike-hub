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
    keywords: ["chain", "sprocket", "parts", "drivetrain", "spare", "spares"],
  },
  {
    id: "spare-brake-pads",
    type: "Spare",
    title: "Front Brake Pads",
    description: "Parts > Braking",
    href: "/marketplace",
    keywords: ["brake", "pads", "braking", "parts", "spare", "spares"],
  },
  {
    id: "spare-touring-windshield",
    type: "Spare",
    title: "Touring Windshield",
    description: "Accessories > Touring",
    href: "/marketplace",
    keywords: ["windshield", "touring", "accessories", "spare", "spares"],
  },
  {
    id: "spare-phone-mount",
    type: "Spare",
    title: "Phone Mount with USB",
    description: "Accessories > Electronics",
    href: "/marketplace",
    keywords: ["phone mount", "mobile holder", "usb", "accessories", "spare", "spares"],
  },
  {
    id: "spare-engine-oil",
    type: "Spare",
    title: "10W40 Semi-Synthetic Engine Oil",
    description: "Additives > Engine Oil",
    href: "/marketplace",
    keywords: ["engine oil", "10w40", "semi synthetic", "additives", "spare", "spares"],
  },
  {
    id: "spare-engine-flush",
    type: "Spare",
    title: "Engine Flush Oil Treatment",
    description: "Additives > Engine Flush Oil",
    href: "/marketplace",
    keywords: ["flush oil", "engine flush", "additives", "spare", "spares"],
  },
  {
    id: "spare-octane-booster",
    type: "Spare",
    title: "Octane Booster Concentrate",
    description: "Additives > Octane Booster",
    href: "/marketplace",
    keywords: ["octane", "booster", "additives", "spare", "spares"],
  },
  {
    id: "spare-fuel-cleaner",
    type: "Spare",
    title: "Fuel System Cleaner",
    description: "Additives > Fuel Cleaner",
    href: "/marketplace",
    keywords: ["fuel cleaner", "injector cleaner", "additives", "spare", "spares"],
  },
  {
    id: "spare-brake-fluid",
    type: "Spare",
    title: "DOT 4 Brake Fluid",
    description: "Additives > Brake Fluid",
    href: "/marketplace",
    keywords: ["dot 4", "brake fluid", "additives", "spare", "spares"],
  },
  {
    id: "spare-tyres",
    type: "Spare",
    title: "Tubeless Tyre Pair",
    description: "Parts > Tyres",
    href: "/marketplace",
    keywords: ["tyre", "tire", "tubeless", "parts", "spare", "spares"],
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
