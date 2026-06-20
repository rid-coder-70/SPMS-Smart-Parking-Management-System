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
      <select disabled className={`border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-2.5 text-sm ${className}`}>
        <option>Loading lots...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled className={`border border-red-200 bg-red-50 text-red-500 rounded-lg px-4 py-2.5 text-sm ${className}`}>
        <option>Error loading lots</option>
      </select>
    );
  }

  if (lots.length === 0) {
    return (
      <select disabled className={`border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-4 py-2.5 text-sm ${className}`}>
        <option>No active lots available</option>
      </select>
    );
  }

  return (
    <select
      className={`border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-colors ${className}`}
      value={value || ''}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="" disabled>Select a parking lot</option>
      {lots.map((lot) => (
        <option key={lot.id} value={lot.id}>
          {lot.lotName} - {lot.location} (Capacity: {lot.totalCapacity})
        </option>
      ))}
    </select>
  );
};
