export type Accessory = {
  id: string;
  name: string;
  priceBdt: number;
  category: "Exhaust" | "Protection" | "Luggage" | "Electronics" | "Cosmetics" | "Maintenance";
  compatibleBikes: string[]; // array of bike slugs or "Universal"
  rating: number;
  reviews: number;
  image: string;
};

export const ACCESSORIES: Accessory[] = [
  { 
    id: "a1", 
    name: "Akrapovič Carbon Slip-on Full System", 
    priceBdt: 45000, 
    category: "Exhaust", 
    compatibleBikes: ["r15-v4", "mt-15-v2", "cbr-150r"], 
    rating: 4.8, 
    reviews: 12,
    image: "https://images.unsplash.com/photo-1599824675549-74d320be2162?w=800&q=80" 
  },
  { 
    id: "a2", 
    name: "Motowolf M6 Heavy Duty Frame Sliders", 
    priceBdt: 3500, 
    category: "Protection", 
    compatibleBikes: ["r15-v4", "mt-15-v2", "gixxer-sf-fi", "pulsar-n160"], 
    rating: 4.5, 
    reviews: 34,
    image: "https://images.unsplash.com/photo-1621252178229-450f3b9c7cf7?w=800&q=80"
  },
  { 
    id: "a3", 
    name: "Universal Bubble Visor (Dark Smoke)", 
    priceBdt: 1200, 
    category: "Cosmetics", 
    compatibleBikes: ["r15-v4", "cbr-150r", "gixxer-sf-fi"], 
    rating: 4.2, 
    reviews: 105,
    image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80"
  },
  { 
    id: "a4", 
    name: "Bobo BM1 Universal Phone Mount with Fast Charging", 
    priceBdt: 1800, 
    category: "Electronics", 
    compatibleBikes: ["Universal"], 
    rating: 4.9, 
    reviews: 540,
    image: "https://images.unsplash.com/photo-1596767571343-4dc975bfe98b?w=800&q=80"
  },
  { 
    id: "a5", 
    name: "RK Chain Lube + Cleaner Combo kit", 
    priceBdt: 2200, 
    category: "Maintenance", 
    compatibleBikes: ["Universal"], 
    rating: 4.7, 
    reviews: 200,
    image: "https://images.unsplash.com/photo-1589345283737-147b3fb5b060?w=800&q=80"
  },
  { 
    id: "a6", 
    name: "Steelbird Ignyte IG-1 Series Helmet", 
    priceBdt: 4500, 
    category: "Protection", 
    compatibleBikes: ["Universal"], 
    rating: 4.6, 
    reviews: 320,
    image: "https://images.unsplash.com/photo-1558227092-2b22ec6f43e3?w=800&q=80"
  },
  { 
    id: "a7", 
    name: "SC Project CR-T Replica Exhaust", 
    priceBdt: 8500, 
    category: "Exhaust", 
    compatibleBikes: ["mt-15-v2", "pulsar-n160"], 
    rating: 4.1, 
    reviews: 45,
    image: "https://images.unsplash.com/photo-1599824675549-74d320be2162?w=800&q=80"
  },
  { 
    id: "a8", 
    name: "K&N High Flow Performance Air Filter", 
    priceBdt: 5500, 
    category: "Maintenance", 
    compatibleBikes: ["r15-v4", "mt-15-v2", "cbr-150r"], 
    rating: 4.9, 
    reviews: 89,
    image: "https://images.unsplash.com/photo-1621252178229-450f3b9c7cf7?w=800&q=80"
  },
];
