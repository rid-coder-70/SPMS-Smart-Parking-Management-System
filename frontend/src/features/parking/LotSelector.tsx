import React, { useEffect, useState } from 'react';
import { ParkingService } from './parking.service';
import type { ParkingLot } from '../../common/types';

export interface LotSelectorProps {
  value?: number;
  onChange: (lotId: number) => void;
  className?: string;
}

export const LotSelector: React.FC<LotSelectorProps> = ({ value, onChange, className = '' }) => {
  const [lots,    setLots]    = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    ParkingService.getAllLots()
      .then(data => setLots(data))
      .catch((e: any) => setError(e?.message ?? 'Failed to fetch lots'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <select disabled className={`input opacity-50 cursor-not-allowed ${className}`}>
        <option>Loading lots…</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled className={`input border-red-200 text-red-500 ${className}`}>
        <option>Error: {error}</option>
      </select>
    );
  }

  if (lots.length === 0) {
    return (
      <select disabled className={`input opacity-50 cursor-not-allowed ${className}`}>
        <option>No active lots available</option>
      </select>
    );
  }

  return (
    <select
      className={`input ${className}`}
      value={value ?? ''}
      onChange={e => onChange(Number(e.target.value))}
    >
      <option value="" disabled>Select a parking lot…</option>
      {lots.map(lot => (
        <option key={lot.id} value={lot.id}>
          {lot.lotName} — {lot.location} (Capacity: {lot.totalCapacity})
        </option>
      ))}
    </select>
  );
};
