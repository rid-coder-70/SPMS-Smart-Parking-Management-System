import { useState, useEffect } from 'react';
import api from '@/common/api';
import type { ParkingLot } from '@/common/types';

interface LotSelectorProps {
  value?: number;
  onChange: (lotId: number) => void;
  className?: string;
}

export function LotSelector({ value, onChange, className = "" }: LotSelectorProps) {
  const [lots, setLots] = useState<ParkingLot[]>([]);

  useEffect(() => {
    api.get<ParkingLot[]>('/lots')
      .then(res => setLots(res.data))
      .catch(console.error);
  }, []);

  return (
    <select 
      className={`input ${className}`}
      value={value || ""} 
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="" disabled>Select a parking lot...</option>
      {lots.map(lot => (
        <option key={lot.id} value={lot.id}>
          {lot.lotName} - {lot.location} ({lot.totalCapacity} capacity)
        </option>
      ))}
    </select>
  );
}
