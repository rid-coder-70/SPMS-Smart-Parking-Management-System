import { useState } from 'react';
import { LotSelector } from '@/features/parking/LotSelector';
import { SlotGrid } from '@/features/parking/SlotGrid';
import api from '@/common/api';
import { useAuth } from '@/features/auth/AuthContext';
import type { ParkingSlot, CreateReservationPayload } from '@/common/types';
import { MapPin, CalendarCheck, X, Info } from 'lucide-react';

export default function ParkingMapPage() {
  const { user } = useAuth();
  const [selectedLotId, setSelectedLotId] = useState<number | undefined>();

  // Reservation modal state
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || '');
  const [reserving, setReserving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status !== 'AVAILABLE') return;
    setSelectedSlot(slot);
    setMsg(null);

    // Default: start now, end in 2 hours
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const end = new Date(now);
    end.setHours(end.getHours() + 2);

    setStartTime(formatDateTimeLocal(now));
    setEndTime(formatDateTimeLocal(end));
  };

  const formatDateTimeLocal = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setReserving(true);
    setMsg(null);
    try {
      const payload: CreateReservationPayload = {
        slotId: selectedSlot.id,
        startTime: startTime.length === 16 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 16 ? `${endTime}:00` : endTime,
        vehicleNumber: vehicleNumber || undefined,
      };
      await api.post('/reservations', payload);
      setMsg({ type: 'ok', text: `Slot ${selectedSlot.slotNumber} reserved successfully! View it in My Reservations.` });
      setTimeout(() => setSelectedSlot(null), 2000);
    } catch (err: any) {
      setMsg({ type: 'err', text: err?.message || 'Failed to reserve slot' });
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MapPin className="h-8 w-8 text-orange-500" />
          Parking Map
        </h1>
        <p className="text-gray-500 mt-1">Browse available lots and click a slot to reserve it.</p>
      </div>
      <div className="card flex flex-wrap gap-4 items-center">
        <span className="text-sm font-medium text-gray-500">Status:</span>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-100 border border-green-400"></span>
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-400"></span>
          <span className="text-sm text-gray-600">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-100 border border-red-400"></span>
          <span className="text-sm text-gray-600">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></span>
          <span className="text-sm text-gray-600">Maintenance</span>
        </div>
      </div>
      <div className="card">
        <label className="label">Select a Parking Lot</label>
        <LotSelector
          value={selectedLotId}
          onChange={setSelectedLotId}
          className="w-full md:w-96"
        />
      </div>

      {selectedLotId ? (
        <div className="card p-4">
          <div className="flex items-center gap-2 px-4 pt-2 pb-4">
            <Info className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-500">Click on a <span className="text-green-600 font-medium">green slot</span> to make a reservation</span>
          </div>
          <SlotGrid
            lotId={selectedLotId}
            onSlotClick={handleSlotClick}
            selectable={true}
          />
        </div>
      ) : (
        <div className="card text-center py-16">
          <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Select a parking lot to view available slots</p>
        </div>
      )}

      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedSlot(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reserve Slot {selectedSlot.slotNumber}</h3>
                <p className="text-sm text-gray-500">{selectedSlot.slotType} slot</p>
              </div>
            </div>

            {msg && (
              <div className={msg.type === 'ok' ? 'alert-success mb-4' : 'alert-error mb-4'}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleReserve} className="space-y-4">
              <div>
                <label className="label">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Vehicle Number (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DHA-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={reserving} className="btn-primary flex-1">
                  {reserving ? 'Reserving…' : 'Confirm Reservation'}
                </button>
                <button type="button" onClick={() => setSelectedSlot(null)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
