'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { CheckCircle, XCircle, MinusCircle, RotateCcw } from 'lucide-react';
import {
  inspectionCategories,
  computeInspectionScore,
  type CheckpointScore,
} from '@/lib/inspection';

const scoreButtonClass = (active: boolean, variant: 'pass' | 'fail' | 'na') => {
  const base = 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-all border';
  if (!active) return `${base} border-slate-200 bg-white text-slate-400 hover:bg-slate-50`;

  const variants = {
    pass: 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100',
    fail: 'border-red-300 bg-red-50 text-red-700 shadow-sm shadow-red-100',
    na: 'border-slate-300 bg-slate-100 text-slate-600 shadow-sm',
  };
  return `${base} ${variants[variant]}`;
};

const colorMap: Record<string, { ring: string; dot: string; bg: string }> = {
  rose: { ring: 'ring-rose-200', dot: 'bg-rose-500', bg: 'bg-rose-50/50' },
  amber: { ring: 'ring-amber-200', dot: 'bg-amber-500', bg: 'bg-amber-50/50' },
  cyan: { ring: 'ring-cyan-200', dot: 'bg-cyan-500', bg: 'bg-cyan-50/50' },
  purple: { ring: 'ring-purple-200', dot: 'bg-purple-500', bg: 'bg-purple-50/50' },
  emerald: { ring: 'ring-emerald-200', dot: 'bg-emerald-500', bg: 'bg-emerald-50/50' },
  blue: { ring: 'ring-blue-200', dot: 'bg-blue-500', bg: 'bg-blue-50/50' },
  orange: { ring: 'ring-orange-200', dot: 'bg-orange-500', bg: 'bg-orange-50/50' },
};

export function InspectionChecklist({
  initialScores = {},
  onChange,
}: {
  initialScores?: Record<string, CheckpointScore>;
  onChange?: (scores: Record<string, CheckpointScore>) => void;
}) {
  const [scores, setScores] = useState<Record<string, CheckpointScore>>(initialScores);

  const updateScore = useCallback((key: string, value: CheckpointScore) => {
    setScores((prev) => {
      const next = { ...prev, [key]: value };
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  const resetAll = useCallback(() => {
    setScores({});
    onChange?.({});
  }, [onChange]);

  const markAllPass = useCallback(() => {
    const allPass: Record<string, CheckpointScore> = {};
    for (const cat of inspectionCategories) {
      for (const item of cat.items) {
        allPass[item.key] = 'pass';
      }
    }
    setScores(allPass);
    onChange?.(allPass);
  }, [onChange]);

  const { passed, applicable, score50 } = useMemo(
    () => computeInspectionScore(scores),
    [scores]
  );

  const scored = Object.keys(scores).length;
  const total = inspectionCategories.reduce((s, c) => s + c.items.length, 0);
  const pct = total > 0 ? Math.round((score50 / 50) * 100) : 0;
  const barColor =
    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : pct >= 40 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="space-y-4">
      {/* Score Summary */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Inspection Score
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {score50}<span className="text-lg text-slate-400"> / 50</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {passed} passed · {applicable - passed} failed · {total - applicable} N/A · {total - scored} unanswered
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={markAllPass}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              All Pass
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="inline-block mr-1 h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Hidden inputs to send scores via FormData */}
      <input type="hidden" name="inspectionScores" value={JSON.stringify(scores)} />

      {/* Categories */}
      {inspectionCategories.map((category) => {
        const tone = colorMap[category.color] ?? colorMap.blue;

        return (
          <div
            key={category.title}
            className={`rounded-xl border border-slate-200 ${tone.bg} overflow-hidden`}
          >
            <div className="flex items-center gap-2 border-b border-slate-200/80 px-4 py-2.5">
              <div className={`h-3 w-3 rounded-full ${tone.dot}`} />
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                {category.title}
              </h4>
              <span className="ml-auto text-[10px] font-semibold text-slate-400">
                {category.items.filter((i) => scores[i.key] === 'pass').length}/
                {category.items.length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {category.items.map((item) => {
                const current = scores[item.key];
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-2 px-4 py-2"
                  >
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => updateScore(item.key, 'pass')}
                        className={scoreButtonClass(current === 'pass', 'pass')}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => updateScore(item.key, 'fail')}
                        className={scoreButtonClass(current === 'fail', 'fail')}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Fail
                      </button>
                      <button
                        type="button"
                        onClick={() => updateScore(item.key, 'na')}
                        className={scoreButtonClass(current === 'na', 'na')}
                      >
                        <MinusCircle className="h-3.5 w-3.5" />
                        N/A
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
