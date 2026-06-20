import { useState, useEffect } from 'react';
import api from '@/common/api';
import type { ParkingSlot } from '@/common/types';

export interface SlotGridProps {
  lotId: number;
  onSlotClick?: (slot: ParkingSlot) => void;
  selectable?: boolean;
}

export function SlotGrid({ lotId, onSlotClick, selectable = false }: SlotGridProps) {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lotId) return;
    
    const fetchSlots = () => {
      api.get<ParkingSlot[]>(`/lots/${lotId}/slots`)
        .then(res => setSlots(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchSlots();
    const interval = setInterval(fetchSlots, 10000);
    return () => clearInterval(interval);
  }, [lotId]);

  if (loading) return <div className="text-white/50 text-sm">Loading slots...</div>;
  if (!slots.length) return <div className="text-white/50 text-sm">No slots found in this lot.</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {slots.map(slot => {
        let bgColor = "bg-night-700";
        if (slot.status === 'AVAILABLE') bgColor = "bg-green-500/20 border-green-500/30 text-green-400";
        else if (slot.status === 'RESERVED') bgColor = "bg-yellow-500/20 border-yellow-500/30 text-yellow-400";
        else if (slot.status === 'OCCUPIED') bgColor = "bg-red-500/20 border-red-500/30 text-red-400";
        else if (slot.status === 'OUT_OF_SERVICE') bgColor = "bg-gray-500/20 border-gray-500/30 text-gray-400";

        return (
          <div 
            key={slot.id}
            onClick={() => selectable && onSlotClick?.(slot)}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${bgColor} ${selectable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
          >
            <span className="font-bold text-lg mb-1">{slot.slotNumber}</span>
            <span className="text-xs uppercase opacity-70">{slot.slotType}</span>
            <span className="text-[10px] uppercase font-semibold mt-2 px-2 py-0.5 rounded-full bg-black/20">{slot.status}</span>
          </div>
        );
      })}
    </div>
  );
}
