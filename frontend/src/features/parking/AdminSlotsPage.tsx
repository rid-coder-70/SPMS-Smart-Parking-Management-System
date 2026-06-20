import { useState, FormEvent, useEffect } from 'react';
import api from '@/common/api';
import type { ParkingSlot, VehicleType } from '@/common/types';
import { LotSelector } from './LotSelector';
import { SlotGrid } from './SlotGrid';

export default function AdminSlotsPage() {
  const [lotId, setLotId] = useState<number | undefined>();
  const [slotNumber, setSlotNumber] = useState('');
  const [slotType, setSlotType] = useState<VehicleType>('STANDARD');
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = () => {
    if (!lotId) return;
    api.get<ParkingSlot[]>(`/lots/${lotId}/slots`)
      .then(res => setSlots(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchSlots();
  }, [lotId]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!lotId || !slotNumber) return;
    setError(null);
    try {
      await api.post(`/lots/${lotId}/slots`, { slotNumber, slotType });
      setSlotNumber('');
      fetchSlots();
    } catch (err: any) {
      setError(err.message || "Failed to add slot");
    }
  };

  const handleOutOfService = async (id: number) => {
    try {
      await api.put(`/slots/${id}/out-of-service`);
      fetchSlots();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Manage Parking Slots</h1>

      <div className="card">
        <label className="label">Select Parking Lot</label>
        <LotSelector value={lotId} onChange={setLotId} className="max-w-md" />
      </div>

      {lotId && (
        <>
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4">Add New Slot</h2>
            {error && <div className="alert-error mb-4">{error}</div>}
            <form onSubmit={handleAdd} className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="label">Slot Number (e.g. A1)</label>
                <input type="text" className="input" value={slotNumber} onChange={e => setSlotNumber(e.target.value)} required />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="label">Slot Type</label>
                <select className="input" value={slotType} onChange={e => setSlotType(e.target.value as VehicleType)}>
                  <option value="STANDARD">Standard</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="LARGE">Large</option>
                </select>
              </div>
              <button type="submit" className="btn-primary py-3">Add Slot</button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4">Current Slots Overview</h2>
            <SlotGrid lotId={lotId} />
            
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="border-b border-white/10 text-white font-semibold">
                  <tr>
                    <th className="pb-3 px-4">ID</th>
                    <th className="pb-3 px-4">Number</th>
                    <th className="pb-3 px-4">Type</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">{slot.id}</td>
                      <td className="py-3 px-4 font-medium text-white">{slot.slotNumber}</td>
                      <td className="py-3 px-4">{slot.slotType}</td>
                      <td className="py-3 px-4">{slot.status}</td>
                      <td className="py-3 px-4">
                        {slot.status !== 'OUT_OF_SERVICE' && (
                          <button onClick={() => handleOutOfService(slot.id)} className="text-gray-400 hover:text-white text-xs font-semibold">Mark Out of Service</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {slots.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-center opacity-50">No slots found in this lot.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
