import React, { useEffect, useState } from 'react';
import api from '../../common/api';
import { ParkingSlot } from '../../common/types';

export interface SlotGridProps {
  lotId: number;
  onSlotClick?: (slot: ParkingSlot) => void;
  selectable?: boolean;
}

export const SlotGrid: React.FC<SlotGridProps> = ({ lotId, onSlotClick, selectable = false }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      const response = await api.get<ParkingSlot[]>(`/lots/${lotId}/slots`);
      setSlots(response.data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(() => {
      fetchSlots();
    }, 10000);

    return () => clearInterval(interval);
  }, [lotId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'RESERVED':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'OCCUPIED':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'OUT_OF_SERVICE':
        return 'bg-gray-100 border-gray-400 text-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  if (loading && slots.length === 0) {
    return <div className="p-6 text-center text-gray-500 animate-pulse">Loading slots...</div>;
  }

  if (error && slots.length === 0) {
    return <div className="p-6 text-center text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {slots.map((slot) => (
        <div
          key={slot.id}
          onClick={() => selectable && onSlotClick && onSlotClick(slot)}
          className={`
            relative p-4 rounded-xl border-2 shadow-sm transition-all duration-200 flex flex-col items-center justify-center min-h-[120px]
            ${getStatusColor(slot.status)}
            ${selectable ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : 'cursor-default'}
          `}
        >
          <span className="font-bold text-xl">{slot.slotNumber}</span>
          <span className="text-xs font-medium uppercase tracking-wider opacity-75 mt-1">
            {slot.slotType}
          </span>
          <span className="text-xs font-bold mt-3 px-2 py-1 rounded bg-white/50 border border-white/40 shadow-sm backdrop-blur-sm">
            {slot.status.replace(/_/g, ' ')}
          </span>
        </div>
      ))}
      
      {slots.length === 0 && !loading && !error && (
        <div className="col-span-full text-center text-gray-500 py-12 border-2 border-dashed border-gray-300 rounded-xl">
          No parking slots found for this lot.
        </div>
      )}
    </div>
  );
};
