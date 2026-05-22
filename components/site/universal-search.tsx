"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Key, Loader2, Search, Sparkles, X } from "lucide-react";
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
  const [isAiMode, setIsAiMode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiMatches, setAiMatches] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleAiSearch = async (overrideQuery?: string) => {
    const activeQuery = (overrideQuery !== undefined ? overrideQuery : query).trim();
    if (!activeQuery) return;
    setIsAiMode(true);
    setAiLoading(true);
    setAiError(null);
    setApiKeyMissing(false);
    setAiSummary(null);
    setAiMatches([]);

    try {
      const res = await fetch(`/api/search/ai?q=${encodeURIComponent(activeQuery)}`);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData.error === "API_KEY_MISSING") {
          setApiKeyMissing(true);
          return;
        }
        throw new Error(errData.message || errData.error || "Failed to fetch AI results");
      }

      const data = await res.json();
      setAiSummary(data.summary || "No description provided by AI.");
      setAiMatches(data.matches || []);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const matchedItems = useMemo(() => {
    if (!isAiMode) return [];
    return universalSearchIndex.filter((item) => aiMatches.includes(item.id));
  }, [isAiMode, aiMatches]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (isAiMode) {
      setAiSummary(null);
      setAiMatches([]);
    }
  };

  const handleClear = () => {
    setQuery("");
    setAiSummary(null);
    setAiMatches([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleAiSearch(suggestion);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute top-1/2 left-5 -translate-y-1/2 pointer-events-none">
          {isAiMode ? (
            <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
          ) : (
            <Search className="h-6 w-6 text-slate-400" />
          )}
        </div>
        <Input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={
            isAiMode
              ? "Ask Gemini AI (e.g. 'find a bike worth more than 2 lac')"
              : "Search bikes, categories, spares, showrooms"
          }
          className={cn(
            "h-14 rounded-2xl border-slate-300 bg-white pl-14 text-lg sm:text-xl text-slate-800 shadow-sm focus-visible:ring-2 focus-visible:ring-slate-400/50 transition-all duration-300",
            isAiMode 
              ? "focus-visible:ring-orange-400/50 border-orange-200 bg-gradient-to-r from-orange-50/10 to-amber-50/10" 
              : "",
            hasQuery ? "pr-[116px] sm:pr-[192px]" : "pr-[74px] sm:pr-[144px]"
          )}
          aria-label="Universal site search"
          onKeyDown={(event) => {
            if (event.key === "Enter" && isAiMode && trimmedQuery) {
              handleAiSearch();
            }
          }}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1.5">
          {hasQuery ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X className="h-6 w-6" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const nextMode = !isAiMode;
              setIsAiMode(nextMode);
              if (nextMode && trimmedQuery) {
                handleAiSearch();
              } else if (!nextMode) {
                setAiSummary(null);
                setAiMatches([]);
              }
            }}
            className={cn(
              "flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border",
              isAiMode
                ? "bg-gradient-to-r from-amber-500 to-orange-600 border-transparent text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:from-amber-400 hover:to-orange-500"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border-slate-200"
            )}
            title={isAiMode ? "Switch to traditional search" : "Switch to Gemini AI search"}
          >
            <Sparkles className={cn("h-4 w-4", isAiMode ? "animate-pulse" : "text-orange-500")} />
            <span className="hidden sm:inline">AI Search</span>
          </button>
        </div>
      </div>

      {(hasQuery || (isAiMode && isFocused)) ? (
        <div className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-200">
          {!isAiMode ? (
            <>
              {/* AI Search Banner Trigger */}
              <button
                type="button"
                onClick={() => handleAiSearch()}
                className="flex w-full items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 text-left transition-all hover:from-amber-100 hover:to-orange-100"
              >
                <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                    Ask AI Search
                  </p>
                  <p className="truncate text-sm text-slate-600 mt-1">
                    Get smart specifications summary and recommendations for "{trimmedQuery}"
                  </p>
                </div>
              </button>

              {results.length > 0 ? (
                <ScrollArea className="max-h-96">
                  <div className="p-2">
                    {results.map((result) => (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={handleClear}
                        className="flex items-start justify-between gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-slate-900">{result.title}</p>
                          <p className="truncate text-sm text-slate-600">{result.description}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs tracking-[0.08em] uppercase", typeBadgeClass[result.type])}
                        >
                          {result.type}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="px-5 py-5 text-base text-slate-600">No results found for {trimmedQuery}</p>
              )}
            </>
          ) : (
            /* AI SEARCH MODE DISPLAY */
            <div className="flex flex-col max-h-[520px]">
              {/* AI Mode Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAiMode(false)}
                  className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Local Search
                </button>
                <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Gemini AI
                </span>
              </div>

              {/* AI Loading State */}
              {aiLoading && (
                <div className="flex flex-col items-center justify-center py-16 px-8 text-center shrink-0">
                  <Loader2 className="h-9 w-9 animate-spin text-orange-500" />
                  <p className="mt-3 text-base font-extrabold text-slate-800 animate-pulse">
                    Gemini is scanning specifications...
                  </p>
                  <p className="text-sm text-slate-500 mt-1.5">Comparing prices, category specs & location</p>
                </div>
              )}

              {/* API Key Missing State */}
              {apiKeyMissing && (
                <div className="py-10 px-6 text-center shrink-0">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Key className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-base font-extrabold text-slate-900">Gemini API Key Required</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-xs mx-auto">
                    Please configure <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs border border-slate-200">GEMINI_API_KEY</code> in your local <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs border border-slate-200">.env.local</code> file.
                  </p>
                </div>
              )}

              {/* Error State */}
              {aiError && (
                <div className="py-10 px-6 text-center shrink-0">
                  <p className="text-base font-extrabold text-red-600">Failed to Retrieve AI Results</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">{aiError}</p>
                  <button
                    type="button"
                    onClick={() => handleAiSearch()}
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Welcome / Instruction State when no search executed yet */}
              {!aiLoading && !apiKeyMissing && !aiError && !aiSummary && (
                <div className="flex flex-col items-center justify-center py-10 px-8 text-center shrink-0">
                  <div className="rounded-2xl bg-orange-50 p-4 text-orange-500 mb-4 animate-bounce">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-extrabold text-slate-800">
                    Ask Gemini AI Search
                  </p>
                  <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                    Type a query (e.g. <span className="font-semibold text-slate-700">"find me a bike worth more than 2 lac"</span> or <span className="font-semibold text-slate-700">"scooter under 1.5 lac"</span>) and press <kbd className="rounded bg-slate-100 px-1.5 py-0.5 border border-slate-200 font-mono text-xs text-slate-600">Enter</kbd> to search.
                  </p>
                  <div className="mt-5 flex flex-col gap-2 w-full max-w-xs">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 text-left">Suggestions:</p>
                    {[
                      "find me a bike worth more than 2 lac",
                      "fuel efficient daily commuter",
                      "show me EV scooters with long range"
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-left text-sm bg-slate-50 hover:bg-orange-50 hover:text-orange-850 text-slate-600 px-4 py-3 rounded-xl border border-slate-100 hover:border-orange-200/40 transition-all font-semibold"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Successful Results */}
              {!aiLoading && !apiKeyMissing && !aiError && aiSummary && (
                <ScrollArea className="flex-grow overflow-y-auto">
                  {/* AI Summary Card */}
                  <div className="p-4 bg-gradient-to-b from-orange-50/40 to-transparent">
                    <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Sparkles className="h-5 w-5 text-orange-500" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange-700">AI Assistant Response</h4>
                      </div>
                      <p className="text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                        {aiSummary}
                      </p>
                    </div>
                  </div>

                  {/* AI Matches List */}
                  <div className="px-4 pb-4">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2">
                      Matched items ({matchedItems.length})
                    </h5>
                    {matchedItems.length > 0 ? (
                      <div className="space-y-1">
                        {matchedItems.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={handleClear}
                            className="flex items-start justify-between gap-3 rounded-lg border border-transparent bg-slate-50/50 hover:bg-orange-50/30 hover:border-orange-200/40 px-4 py-3 transition-all"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm sm:text-base font-extrabold text-slate-900">{item.title}</p>
                              <p className="truncate text-xs sm:text-sm text-slate-500 mt-1">{item.description}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 rounded-full px-2 py-0.5 text-xs tracking-[0.06em] uppercase",
                                typeBadgeClass[item.type]
                              )}
                            >
                              {item.type}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 px-1 py-1 italic">
                        No specific directory matches found.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

