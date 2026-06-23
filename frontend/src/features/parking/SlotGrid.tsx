import React, { useEffect, useState, useCallback } from 'react';
import { ParkingService } from './parking.service';
import type { ParkingSlot } from '../../common/types';
import { RefreshCw, AlertCircle, Car, Bike, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SlotGridProps {
  lotId:       number;
  onSlotClick?: (slot: ParkingSlot) => void;
  selectable?:  boolean;
}

const slotColors: Record<string, string> = {
  AVAILABLE:      'bg-green-50  border-green-300  text-green-700  hover:bg-green-100',
  RESERVED:       'bg-amber-50  border-amber-300  text-amber-700',
  OCCUPIED:       'bg-red-50    border-red-300    text-red-700',
  OUT_OF_SERVICE: 'bg-gray-50   border-gray-200   text-gray-400',
};

export const SlotGrid: React.FC<SlotGridProps> = ({ lotId, onSlotClick, selectable = false }) => {
  const [slots,   setSlots]   = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      const data = await ParkingService.getSlotsByLot(lotId);
      setSlots(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  }, [lotId]);

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 10_000);
    return () => clearInterval(interval);
  }, [fetchSlots]);

  if (loading && slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="spinner mb-3" />
        <p className="text-xs text-gray-400">Loading slots…</p>
      </div>
    );
  }

  if (error && slots.length === 0) {
    return (
      <div className="alert-error">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <p>{error}</p>
        <button onClick={fetchSlots} className="ml-auto">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-orange-200 rounded-xl">
        <p className="text-sm text-gray-400">No slots found for this lot.</p>
      </div>
    );
  }

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'MOTORCYCLE': return <Bike className="h-6 w-6 mb-2 opacity-80" />;
      case 'LARGE': return <Truck className="h-6 w-6 mb-2 opacity-80" />;
      case 'STANDARD':
      default: return <Car className="h-6 w-6 mb-2 opacity-80" />;
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05 }}
    >
      <AnimatePresence>
        {slots.map((slot, index) => {
          const isClickable = selectable && slot.status === 'AVAILABLE';
          return (
            <motion.div
              key={slot.id}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
              onClick={() => isClickable && onSlotClick && onSlotClick(slot)}
              className={`
                p-3 rounded-xl border flex flex-col items-center justify-center text-center
                transition-colors duration-150 select-none relative overflow-hidden
                ${slotColors[slot.status] ?? 'bg-gray-50 border-gray-200 text-gray-400'}
                ${isClickable
                  ? 'cursor-pointer hover:shadow-md hover:shadow-green-200/50'
                  : 'cursor-default'}
                ${selectable && slot.status !== 'AVAILABLE' ? 'opacity-60' : ''}
              `}
            >
              {/* Background glow for available slots */}
              {isClickable && (
                <div className="absolute inset-0 bg-green-100/0 hover:bg-green-100/40 transition-colors pointer-events-none" />
              )}
              
              {getVehicleIcon(slot.slotType)}
              <span className="font-bold text-base leading-none mb-1 z-10">{slot.slotNumber}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60 leading-none mb-1.5 z-10">
                {slot.slotType}
              </span>
              <span className="text-[8px] uppercase tracking-widest font-bold bg-white/60 border border-current/10 px-1.5 py-0.5 rounded-full z-10">
                {slot.status.replace(/_/g, ' ')}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
