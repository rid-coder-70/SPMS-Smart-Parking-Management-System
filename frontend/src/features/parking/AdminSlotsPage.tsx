import React, { useEffect, useState } from 'react';
import api from '../../common/api';
import { ParkingSlot, VehicleType } from '../../common/types';
import { LotSelector } from './LotSelector';

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
    try {
      await api.post(`/lots/${selectedLotId}/slots`, {
        lotId: selectedLotId,
        slotNumber,
        slotType
      });
      setSlotNumber('');
      setSlotType('');
      fetchSlots(selectedLotId); // Refresh list after adding
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
      if (selectedLotId) fetchSlots(selectedLotId);
    } catch (err: any) {
      alert(err?.message || 'Failed to update slot status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Parking Slots</h1>
          <p className="text-gray-500 mt-1">Select a lot to view and manage its slots.</p>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Parking Lot</label>
        <LotSelector 
          value={selectedLotId} 
          onChange={setSelectedLotId} 
          className="w-full md:w-96"
        />
      </div>

      {selectedLotId && (
        <>
          {/* Add Slot Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 transition-shadow hover:shadow-md">
            <h2 className="text-lg font-semibold mb-5 text-gray-800">Add New Slot</h2>
            {addError && <div className="mb-5 text-sm text-red-600 bg-red-50/80 border border-red-100 p-3 rounded-lg">{addError}</div>}
            
            <form onSubmit={handleAddSlot} className="flex flex-wrap gap-5 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slot Number</label>
                <input 
                  type="text" 
                  required
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all bg-gray-50/50 hover:bg-white"
                  placeholder="e.g. A-101"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Type</label>
                <select 
                  required
                  value={slotType}
                  onChange={(e) => setSlotType(e.target.value as VehicleType)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all bg-gray-50/50 hover:bg-white"
                >
                  <option value="" disabled>Select Type</option>
                  <option value="STANDARD">Standard</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="LARGE">Large</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={adding}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 hover:shadow disabled:opacity-50 transition-all"
              >
                {adding ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>

          {/* Slots Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500 animate-pulse font-medium">Loading slots...</div>
            ) : error ? (
              <div className="p-12 text-center text-red-500 font-medium">{error}</div>
            ) : slots.length === 0 ? (
              <div className="p-12 text-center text-gray-500 font-medium">No slots found in this lot. Add one above.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest font-semibold">
                      <th className="p-5">ID</th>
                      <th className="p-5">Slot Number</th>
                      <th className="p-5">Type</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {slots.map(slot => (
                      <tr key={slot.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-5 text-gray-500 text-sm">#{slot.id}</td>
                        <td className="p-5 font-semibold text-gray-800">{slot.slotNumber}</td>
                        <td className="p-5 text-gray-600 font-medium">{slot.slotType}</td>
                        <td className="p-5">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full shadow-sm
                            ${slot.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : ''}
                            ${slot.status === 'RESERVED' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${slot.status === 'OCCUPIED' ? 'bg-red-100 text-red-700' : ''}
                            ${slot.status === 'OUT_OF_SERVICE' ? 'bg-gray-200 text-gray-700' : ''}
                          `}>
                            {slot.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          {slot.status !== 'OUT_OF_SERVICE' && (
                            <button 
                              onClick={() => handleMarkOutOfService(slot.id)}
                              className="text-sm text-gray-500 hover:text-red-700 font-semibold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all focus:opacity-100"
                            >
                              Mark Out of Service
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
