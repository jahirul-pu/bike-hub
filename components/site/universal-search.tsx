"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { universalSearchIndex, UniversalSearchItem, UniversalSearchType } from "@/lib/universal-search";
import { detectSearchScope } from "@/lib/universal-search-intent";
import { cn } from "@/lib/utils";

const typeBadgeClass: Record<UniversalSearchType, string> = {
  Bike: "border-slate-300 bg-slate-100 text-slate-800",
  Category: "border-indigo-200 bg-indigo-100 text-indigo-900",
  Spare: "border-amber-200 bg-amber-100 text-amber-900",
  Showroom: "border-emerald-200 bg-emerald-100 text-emerald-900",
};

const typeWeight: Record<UniversalSearchType, number> = {
  Bike: 4,
  Category: 3,
  Spare: 2,
  Showroom: 1,
};

function scoreItem(item: UniversalSearchItem, query: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return 0;

  const title = item.title.toLowerCase();
  const description = item.description.toLowerCase();
  const keywords = item.keywords.map((keyword) => keyword.toLowerCase());

  let score = 0;

  if (title.startsWith(normalizedQuery)) score += 7;
  if (title.includes(normalizedQuery)) score += 5;
  if (description.includes(normalizedQuery)) score += 2;
  if (keywords.some((keyword) => keyword.startsWith(normalizedQuery))) score += 4;
  if (keywords.some((keyword) => keyword.includes(normalizedQuery))) score += 2;
  if (item.type.toLowerCase().includes(normalizedQuery)) score += 2;

  return score + typeWeight[item.type];
}

export function UniversalSearch() {
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const scope = useMemo(() => detectSearchScope(trimmedQuery, universalSearchIndex), [trimmedQuery]);

  const results = useMemo(() => {
    if (!hasQuery) return [];

    return universalSearchIndex
      .filter(
        (item) => scope.allowedTypes.includes(item.type) && (scope.itemPredicate ? scope.itemPredicate(item) : true)
      )
      .map((item) => ({ item, score: scoreItem(item, trimmedQuery) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => entry.item);
  }, [hasQuery, scope, trimmedQuery]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search bikes, categories, spares, showrooms"
          className="h-10 rounded-xl border-slate-300 bg-white pl-9 pr-10 text-sm text-slate-800 shadow-sm"
          aria-label="Universal site search"
        />
        {hasQuery ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {hasQuery ? (
        <div className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {results.length > 0 ? (
            <ScrollArea className="max-h-80">
              <div className="p-1.5">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={result.href}
                    onClick={() => setQuery("")}
                    className="flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{result.title}</p>
                      <p className="truncate text-xs text-slate-600">{result.description}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 rounded-full px-2 text-[10px] tracking-[0.08em] uppercase", typeBadgeClass[result.type])}
                    >
                      {result.type}
                    </Badge>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="px-3 py-3 text-sm text-slate-600">No results found for {trimmedQuery}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
