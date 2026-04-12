import type { UniversalSearchItem, UniversalSearchType } from "./universal-search";

export type SearchScope = {
  allowedTypes: UniversalSearchType[];
  itemPredicate?: (item: UniversalSearchItem) => boolean;
};

const bikeTypeTerms = ["bike", "bikes", "motorcycle", "motorcycles"];
const spareTypeTerms = ["spare", "spares", "part", "parts", "accessory", "accessories", "additive", "additives"];
const showroomTypeTerms = ["showroom", "showrooms", "dealer", "dealers"];

export function itemSearchText(item: UniversalSearchItem): string {
  return `${item.title} ${item.description} ${item.keywords.join(" ")}`.toLowerCase();
}

function bikeBrands(searchIndex: UniversalSearchItem[]): Set<string> {
  return new Set(
    searchIndex
      .filter((item) => item.type === "Bike")
      .map((item) => item.keywords[0]?.toLowerCase())
      .filter((keyword): keyword is string => Boolean(keyword))
  );
}

export function detectSearchScope(query: string, searchIndex: UniversalSearchItem[]): SearchScope {
  const normalizedQuery = query.trim().toLowerCase();
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const brands = bikeBrands(searchIndex);
  const brandTerm = terms.find((term) => brands.has(term));

  if (normalizedQuery.includes("engine oil")) {
    return {
      allowedTypes: ["Spare"],
      itemPredicate: (item) => itemSearchText(item).includes("engine oil"),
    };
  }

  if (brands.has(normalizedQuery)) {
    return {
      allowedTypes: ["Bike"],
      itemPredicate: (item) => itemSearchText(item).includes(normalizedQuery),
    };
  }

  if (brandTerm) {
    return {
      allowedTypes: ["Bike"],
      itemPredicate: (item) => itemSearchText(item).includes(brandTerm),
    };
  }

  if (terms.some((term) => bikeTypeTerms.includes(term))) {
    return { allowedTypes: ["Bike"] };
  }

  if (terms.some((term) => spareTypeTerms.includes(term))) {
    return { allowedTypes: ["Spare"] };
  }

  if (terms.some((term) => showroomTypeTerms.includes(term))) {
    return { allowedTypes: ["Showroom"] };
  }

  return {
    allowedTypes: ["Bike", "Category", "Spare", "Showroom"],
  };
}

export function filterSearchItemsByScope(query: string, searchIndex: UniversalSearchItem[]): UniversalSearchItem[] {
  const scope = detectSearchScope(query, searchIndex);
  return searchIndex.filter(
    (item) => scope.allowedTypes.includes(item.type) && (scope.itemPredicate ? scope.itemPredicate(item) : true)
  );
}
