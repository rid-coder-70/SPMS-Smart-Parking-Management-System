import React, { useEffect, useState } from 'react';
import api from '../../common/api';
import { ParkingLot } from '../../common/types';

export interface LotSelectorProps {
  value?: number;
  onChange: (lotId: number) => void;
  className?: string;
}

export const LotSelector: React.FC<LotSelectorProps> = ({ value, onChange, className = '' }) => {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await api.get<ParkingLot[]>('/lots');
        setLots(response.data);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch parking lots');
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, []);

  if (loading) {
    return (
      <select disabled className={`input appearance-none opacity-50 ${className}`}>
        <option>Loading lots...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled className={`input appearance-none border-red-500/30 text-red-400 ${className}`}>
        <option>Error loading lots</option>
      </select>
    );
  }

  if (lots.length === 0) {
    return (
      <select disabled className={`input appearance-none opacity-50 ${className}`}>
        <option>No active lots available</option>
      </select>
    );
  }

  return (
    <select
      className={`input appearance-none ${className}`}
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="" disabled className="bg-night-800 text-white/50">Select a parking lot</option>
      {lots.map((lot) => (
        <option key={lot.id} value={lot.id} className="bg-night-800 text-white">
          {lot.lotName} — {lot.location} (Capacity: {lot.totalCapacity})
        </option>
      ))}
    </select>
  );
};
