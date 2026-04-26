'use client';

import * as React from 'react';
import { useState } from 'react';
import { updateVehicleStatus, deleteVehicle } from './actions';

const statusOptions = [
  { value: 'APPROVED' as const, label: 'User Listed', bg: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' },
  { value: 'PROMOTED' as const, label: '⭐ Promoted', bg: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'CERTIFIED' as const, label: '✓ Certified', bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200' },
] as const;

export function VehicleStatusActions({
  vehicleId,
  currentStatus,
}: {
  vehicleId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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

  return (
    <>
      {statusOptions
        .filter((option) => option.value !== currentStatus)
        .map((option) => (
          <button
            key={option.value}
            disabled={loading}
            onClick={() => handleStatusChange(option.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${option.bg}`}
          >
            {option.label}
          </button>
        ))}
      {!showConfirmDelete ? (
        <button
          disabled={loading}
          onClick={() => setShowConfirmDelete(true)}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          Delete
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <button
            disabled={loading}
            onClick={handleDelete}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Confirm'}
          </button>
          <button
            disabled={loading}
            onClick={() => setShowConfirmDelete(false)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
