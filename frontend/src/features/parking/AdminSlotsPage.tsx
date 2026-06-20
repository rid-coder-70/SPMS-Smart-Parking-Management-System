import React, { useEffect, useState } from 'react';
import { ParkingService } from './parking.service';
import type { ParkingSlot, VehicleType } from '../../common/types';
import { LotSelector } from './LotSelector';
import { PlusCircle, Trash2, Hash, AlertCircle, RefreshCw } from 'lucide-react';

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'STANDARD',   label: 'Standard Car' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'LARGE',      label: 'Large Vehicle (SUV / Van)' },
];

export const AdminSlotsPage: React.FC = () => {
  const [selectedLotId, setSelectedLotId] = useState<number | undefined>();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [slotNumber, setSlotNumber] = useState('');
  const [slotType, setSlotType] = useState<VehicleType | ''>('');
  
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchSlots = async (lotId: number) => {
    setLoading(true);
    try {
      const data = await ParkingService.getSlotsByLot(lotId);
      setSlots(data);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLotId) {
      fetchSlots(selectedLotId);
    } else {
      setSlots([]);
    }
  }, [selectedLotId]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId || !slotNumber || !slotType) return;
    
    setAdding(true);
    setAddError('');
    try {
      await ParkingService.createSlot(selectedLotId, {
        lotId: selectedLotId,
        slotNumber,
        slotType
      });
      setSlotNumber('');
      setSlotType('');
      fetchSlots(selectedLotId);
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add slot');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    try {
      await ParkingService.deleteSlot(id);
      if (selectedLotId) fetchSlots(selectedLotId);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete slot');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Parking Slots</h1>
          <p className="text-white/50 text-sm mt-1">Add slots to a parking lot and manage their status.</p>
        </div>
      </div>

      <div className="card mb-8 p-6">
        <label className="label">Select Parking Lot</label>
        <LotSelector 
          value={selectedLotId} 
          onChange={setSelectedLotId} 
          className="w-full max-w-md input"
        />
      </div>

      {selectedLotId && (
        <>
          {/* Add Slot Form */}
          <div className="card mb-8">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-brand-400" /> Add New Slot
            </h2>
            
            {addError && (
              <div className="alert-error mb-5">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p>{addError}</p>
              </div>
            )}
            
            <form onSubmit={handleAddSlot} className="grid sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-1">
                <label className="label">Slot Number</label>
                <input 
                  type="text" 
                  required
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  className="input"
                  placeholder="e.g. A-101"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Vehicle Type</label>
                <select
                  required
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value as VehicleType)}
                  className="input"
                >
                  <option value="" disabled>Select vehicle type</option>
                  {VEHICLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-1">
                <button type="submit" disabled={adding} className="btn-primary w-full">
                  {adding ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>

          {/* Slots Table */}
          <div className="card p-0 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center flex flex-col items-center">
                <RefreshCw className="h-8 w-8 text-brand-400 animate-spin mb-4" />
                <p className="text-white/50 text-sm">Loading slots...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-400">{error}</div>
            ) : slots.length === 0 ? (
              <div className="p-12 text-center text-white/50">No slots found in this lot.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-night-900 border-b border-night-700 text-white/50 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-medium">Slot Number</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-night-700">
                    {slots.map(slot => (
                      <tr key={slot.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-brand-400" />
                            {slot.slotNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white/70 text-sm">
                          {slot.slotType.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            slot.status === 'AVAILABLE' ? 'badge-active' :
                            slot.status === 'OCCUPIED' ? 'badge-locked' :
                            slot.status === 'RESERVED' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
                            'badge-inactive'
                          }`}>
                            {slot.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(slot.id)}
                            className="text-sm font-medium text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 ml-auto"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
