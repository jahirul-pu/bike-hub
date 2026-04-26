'use client';

import * as React from 'react';
import { useState } from 'react';
import { ChevronDown, ShieldCheck, Megaphone, User, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { updateVehicleStatus, deleteVehicle } from './actions';

const statusOptions = [
  { value: 'APPROVED' as const, label: 'User Listed', icon: User, color: 'text-slate-600' },
  { value: 'PROMOTED' as const, label: 'Promoted', icon: Megaphone, color: 'text-amber-600' },
  { value: 'CERTIFIED' as const, label: 'Certified', icon: ShieldCheck, color: 'text-emerald-600' },
] as const;

const statusBadge: Record<string, { label: string; bg: string }> = {
  APPROVED: { label: 'User Listed', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  PROMOTED: { label: '⭐ Promoted', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  CERTIFIED: { label: '✓ Certified', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

export function VehicleStatusActions({
  vehicleId,
  currentStatus,
}: {
  vehicleId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const current = statusBadge[currentStatus] ?? statusBadge.APPROVED;

  async function handleStatusChange(status: 'APPROVED' | 'PROMOTED' | 'CERTIFIED') {
    if (status === currentStatus) return;
    setLoading(true);
    try {
      const result = await updateVehicleStatus(vehicleId, status);
      if (!result.success) {
        alert(result.error ?? 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const result = await deleteVehicle(vehicleId);
      if (!result.success) {
        alert(result.error ?? 'Failed to delete vehicle');
      }
      setShowConfirmDelete(false);
    } catch (error) {
      console.error(error);
      alert('Failed to delete vehicle');
    } finally {
      setLoading(false);
    }
  }

  if (showConfirmDelete) {
    return (
      <div className="flex items-center gap-1">
        <button
          disabled={loading}
          onClick={handleDelete}
          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button
          disabled={loading}
          onClick={() => setShowConfirmDelete(false)}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${current.bg}`}
      >
        {current.label}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === currentStatus;

          return (
            <DropdownMenuItem
              key={option.value}
              disabled={isActive}
              onClick={() => handleStatusChange(option.value)}
              className={isActive ? 'font-bold bg-slate-50' : ''}
            >
              <Icon className={`h-4 w-4 mr-2 ${option.color}`} />
              {option.label}
              {isActive && <span className="ml-auto text-[10px] text-slate-400">current</span>}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowConfirmDelete(true)}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
