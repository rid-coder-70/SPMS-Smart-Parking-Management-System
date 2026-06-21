import React, { useEffect, useState } from 'react';
import api from '../../common/api';
import { ParkingSlot, VehicleType } from '../../common/types';
import { LotSelector } from './LotSelector';
import { Grid3X3, Plus, Wrench } from 'lucide-react';

export const AdminSlotsPage: React.FC = () => {
  const [selectedLotId, setSelectedLotId] = useState<number | undefined>();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [slotNumber, setSlotNumber] = useState('');
  const [slotType, setSlotType] = useState<VehicleType | ''>('');
  
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSlots = async (lotId: number) => {
    setLoading(true);
    try {
      const response = await api.get<ParkingSlot[]>(`/lots/${lotId}/slots`);
      setSlots(response.data);
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
    setSuccessMsg('');
    try {
      await api.post(`/lots/${selectedLotId}/slots`, {
        lotId: selectedLotId,
        slotNumber,
        slotType
      });
      setSlotNumber('');
      setSlotType('');
      setSuccessMsg(`Slot ${slotNumber} added successfully!`);
      fetchSlots(selectedLotId);
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add slot');
    } finally {
      setAdding(false);
    }
  };

  const handleMarkOutOfService = async (slotId: number) => {
    if (!window.confirm('Are you sure you want to mark this slot out of service?')) return;
    
    try {
      await api.put(`/slots/${slotId}/out-of-service`);
      setSuccessMsg('Slot marked as out of service.');
      if (selectedLotId) fetchSlots(selectedLotId);
    } catch (err: any) {
      alert(err?.message || 'Failed to update slot status');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      AVAILABLE: 'badge-active',
      RESERVED: 'badge-pending',
      OCCUPIED: 'badge-cancelled',
      OUT_OF_SERVICE: 'badge-inactive',
    };
    return map[status] || 'badge-inactive';
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Grid3X3 className="h-8 w-8 text-blue-400" />
          Manage Parking Slots
        </h1>
        <p className="text-white/50 mt-1">Select a lot to view and manage its slots.</p>
      </div>

      {/* Lot Selector */}
      <div className="card">
        <label className="label">Select Parking Lot</label>
        <LotSelector 
          value={selectedLotId} 
          onChange={setSelectedLotId} 
          className="w-full md:w-96"
        />
      </div>

      {selectedLotId && (
        <>
          {/* Add Slot Form */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-5 pb-4 border-b border-night-700">Add New Slot</h2>
            {addError && <div className="alert-error mb-4">{addError}</div>}
            {successMsg && <div className="alert-success mb-4">{successMsg}</div>}
            
            <form onSubmit={handleAddSlot} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
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
              <div className="flex-1 min-w-[200px]">
                <label className="label">Vehicle Type</label>
                <select 
                  required
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value as VehicleType)}
                  className="input appearance-none"
                >
                  <option value="" disabled className="bg-night-800 text-white/50">Select Type</option>
                  <option value="STANDARD" className="bg-night-800 text-white">Standard</option>
                  <option value="MOTORCYCLE" className="bg-night-800 text-white">Motorcycle</option>
                  <option value="LARGE" className="bg-night-800 text-white">Large</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={adding}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                {adding ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>

          {/* Slots Table */}
          <div className="card overflow-hidden p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-400 font-medium">{error}</div>
            ) : slots.length === 0 ? (
              <div className="p-12 text-center text-white/40">
                <Grid3X3 className="h-10 w-10 mx-auto mb-3 text-white/20" />
                <p>No slots found in this lot. Add one above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Slot Number</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map(slot => (
                      <tr key={slot.id} className="group">
                        <td className="text-white/40 text-sm">#{slot.id}</td>
                        <td className="font-semibold text-white">{slot.slotNumber}</td>
                        <td className="text-white/60 font-medium">{slot.slotType}</td>
                        <td>
                          <span className={getStatusBadge(slot.status)}>
                            {slot.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="text-right">
                          {slot.status !== 'OUT_OF_SERVICE' && (
                            <button 
                              onClick={() => handleMarkOutOfService(slot.id)}
                              className="btn-danger text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Wrench className="h-3 w-3 mr-1.5" />
                              Out of Service
                            </button>
                          )}
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
