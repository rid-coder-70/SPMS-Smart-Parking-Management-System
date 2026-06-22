import React, { useEffect, useState, useCallback } from 'react';
import { ParkingService } from './parking.service';
import type { ParkingSlot } from '../../common/types';
import { RefreshCw, AlertCircle } from 'lucide-react';

export interface SlotGridProps {
  lotId: number;
  onSlotClick?: (slot: ParkingSlot) => void;
  selectable?: boolean;
}

export const SlotGrid: React.FC<SlotGridProps> = ({ lotId, onSlotClick, selectable = false }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      const data = await ParkingService.getSlotsByLot(lotId);
      setSlots(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  }, [lotId]);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchSlots]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500/10 border-green-500/40 text-green-300 hover:bg-green-500/20';
      case 'RESERVED':
        return 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300';
      case 'OCCUPIED':
        return 'bg-red-500/10 border-red-500/40 text-red-300';
      case 'OUT_OF_SERVICE':
        return 'bg-white/5 border-white/10 text-white/40';
      default:
        return 'bg-white/5 border-white/10 text-white/40';
    }
  };

  if (loading && slots.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'RESERVED':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
      case 'OCCUPIED':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'OUT_OF_SERVICE':
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
      default:
        return 'bg-gray-800 border-gray-700 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 text-brand-400 animate-spin mb-2" />
        <p className="text-white/50 text-sm">Loading slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error">
        <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
        <p>{error}</p>
      </div>
    );
  }

  if (error && slots.length === 0) {
    return <div className="p-6 text-center text-red-400 font-medium">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          onClick={() => selectable && slot.status === 'AVAILABLE' && onSlotClick && onSlotClick(slot)}
          className={`
            relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center min-h-[110px]
            ${getStatusColor(slot.status)}
            ${selectable && slot.status === 'AVAILABLE' ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-green-400' : 'cursor-default'}
            ${selectable && slot.status !== 'AVAILABLE' ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        >
          <span className="font-bold text-lg">{slot.slotNumber}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mt-1">
            {slot.slotType}
          </span>
          <span className="text-[10px] font-bold mt-2 px-2 py-0.5 rounded bg-black/20 border border-white/10">
            {slot.status.replace(/_/g, ' ')}
          </span>
        </div>
      ))}
      
      {slots.length === 0 && !loading && !error && (
        <div className="col-span-full text-center text-white/30 py-12 border-2 border-dashed border-night-700 rounded-xl">
          No parking slots found for this lot.
        </div>
      )}
  if (slots.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-night-700 rounded-xl">
        <p className="text-white/40 text-sm">No slots found for this lot.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {slots.map((slot) => {
        const isClickable = selectable && slot.status === 'AVAILABLE';
        
        return (
          <div
            key={slot.id}
            onClick={() => isClickable && onSlotClick && onSlotClick(slot)}
            className={`
              relative p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all
              ${getStatusColor(slot.status)}
              ${isClickable ? 'cursor-pointer hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5' : 'cursor-default opacity-80'}
            `}
          >
            <span className="font-bold text-lg mb-1">{slot.slotNumber}</span>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
              {slot.slotType.replace('_', ' ')}
            </span>
            <span className="text-[10px] uppercase tracking-widest mt-2 font-bold bg-black/20 px-2 py-0.5 rounded-full">
              {slot.status}
            </span>
          </div>
        );
      })}
    </div>
  );
};
