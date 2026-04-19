"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, Check, Loader2 } from "lucide-react";
import { deletePart, updatePartStock } from "./actions";

export function DeletePartButton({ partId, partName }: { partId: string; partName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const res = await deletePart(partId);
              if (res.success) {
                router.refresh();
              } else {
                alert(res.error);
              }
              setConfirming(false);
            });
          }}
          className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
      title={`Delete ${partName}`}
    >
      Delete
    </button>
  );
}

export function QuickStockEditor({ partId, currentStock }: { partId: string; currentStock: number }) {
  const [editing, setEditing] = useState(false);
  const [stock, setStock] = useState(currentStock);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    if (stock === currentStock) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await updatePartStock(partId, stock);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error);
        setStock(currentStock);
      }
      setEditing(false);
    });
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setStock(Math.max(0, stock - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Minus size={12} />
        </button>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-14 h-7 rounded-lg border border-slate-200 px-2 text-center text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") { setStock(currentStock); setEditing(false); }
          }}
          autoFocus
        />
        <button
          type="button"
          onClick={() => setStock(stock + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Plus size={12} />
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`font-bold text-sm tabular-nums cursor-pointer px-2 py-1 rounded-lg transition-colors hover:bg-slate-100 ${
        currentStock === 0
          ? "text-red-600"
          : currentStock < 10
            ? "text-amber-600"
            : "text-slate-900"
      }`}
      title="Click to edit stock"
    >
      {currentStock}
    </button>
  );
}
