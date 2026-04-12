import { describe, expect, it } from "vitest";
import type { UniversalSearchItem } from "./universal-search";
import { detectSearchScope, filterSearchItemsByScope, itemSearchText } from "./universal-search-intent";

const indexFixture: UniversalSearchItem[] = [
  {
    id: "bike-honda-cb350rs",
    type: "Bike",
    title: "Honda CB350RS",
    description: "ICE Commuter",
    href: "/bikes/honda-cb350rs",
    keywords: ["Honda", "CB350RS", "Commuter", "ICE", "honda-cb350rs"],
  },
  {
    id: "bike-yamaha-r15",
    type: "Bike",
    title: "Yamaha R15 V4",
    description: "ICE Sport",
    href: "/bikes/yamaha-r15-v4",
    keywords: ["Yamaha", "R15 V4", "Sport", "ICE", "yamaha-r15-v4"],
  },
  {
    id: "spare-chain-kit",
    type: "Spare",
    title: "Chain & Sprocket Kit",
    description: "Parts > Drivetrain",
    href: "/marketplace",
    keywords: ["chain", "sprocket", "parts", "drivetrain", "spare", "spares"],
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
    id: "showroom-dhaka",
    type: "Showroom",
    title: "Bike Hub Motijheel",
    description: "Dhaka | 45 Outer Circular Rd",
    href: "/showrooms",
    keywords: ["dhaka", "motijheel", "dealer", "showroom"],
  },
];

describe("detectSearchScope", () => {
  it("scopes Bike query to Bike type", () => {
    const scope = detectSearchScope("Bike", indexFixture);
    expect(scope.allowedTypes).toEqual(["Bike"]);
  });

  it("scopes Honda query to Bike type with brand predicate", () => {
    const scope = detectSearchScope("Honda", indexFixture);
    expect(scope.allowedTypes).toEqual(["Bike"]);
    expect(scope.itemPredicate).toBeDefined();
  });

  it("scopes Spares query to Spare type", () => {
    const scope = detectSearchScope("Spares", indexFixture);
    expect(scope.allowedTypes).toEqual(["Spare"]);
  });

  it("scopes Engine oil query to Spare type with engine oil predicate", () => {
    const scope = detectSearchScope("Engine oil", indexFixture);
    expect(scope.allowedTypes).toEqual(["Spare"]);
    expect(scope.itemPredicate).toBeDefined();
  });
});

describe("filterSearchItemsByScope", () => {
  it("returns only bikes for Bike query", () => {
    const results = filterSearchItemsByScope("Bike", indexFixture);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.type === "Bike")).toBe(true);
  });

  it("returns only Honda bikes for Honda query", () => {
    const results = filterSearchItemsByScope("Honda", indexFixture);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.type === "Bike")).toBe(true);
    expect(results.every((item) => itemSearchText(item).includes("honda"))).toBe(true);
  });

  it("returns only spare parts for Spares query", () => {
    const results = filterSearchItemsByScope("Spares", indexFixture);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.type === "Spare")).toBe(true);
  });

  it("returns only engine oil products for Engine oil query", () => {
    const results = filterSearchItemsByScope("Engine oil", indexFixture);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.type === "Spare")).toBe(true);
    expect(results.every((item) => itemSearchText(item).includes("engine oil"))).toBe(true);
  });
});
