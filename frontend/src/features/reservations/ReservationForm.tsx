import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/common/api';
import { LotSelector } from '@/features/parking/LotSelector';
import { SlotGrid } from '@/features/parking/SlotGrid';
import type { ParkingSlot } from '@/common/types';

export default function ReservationForm() {
  const [lotId, setLotId] = useState<number | undefined>();
  const [slot, setSlot] = useState<ParkingSlot | null>(null);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60'); // 1 hour
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!slot || !startDate || !startTime) return;
    setError(null);
    try {
      // Start time formatting: YYYY-MM-DDTHH:mm:ss
      const startIso = `${startDate}T${startTime}:00`;
      await api.post('/reservations', {
        slotId: slot.id,
        startTime: startIso,
        durationMinutes: parseInt(duration)
      });
      navigate('/reservations/me');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError("Slot is already reserved for this time. Please pick another.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to create reservation");
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Make a Reservation</h1>
      
      {error && <div className="alert-error">{error}</div>}

      <div className="card">
        <label className="label">1. Select Parking Lot</label>
        <LotSelector value={lotId} onChange={setLotId} className="max-w-md" />
      </div>

      {lotId && (
        <div className="card">
          <label className="label">2. Select an Available Slot</label>
          <SlotGrid lotId={lotId} selectable onSlotClick={s => setSlot(s)} />
          {slot && <div className="mt-4 text-green-400 text-sm">Selected Slot: {slot.slotNumber}</div>}
        </div>
      )}

      {slot && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <label className="label">3. Choose Time & Duration</label>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="label text-xs">Date</label>
              <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label className="label text-xs">Start Time</label>
              <input type="time" className="input" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label className="label text-xs">Duration</label>
              <select className="input" value={duration} onChange={e => setDuration(e.target.value)}>
                <option value="30">30 min</option>
                <option value="60">1 hr</option>
                <option value="90">1.5 hr</option>
                <option value="120">2 hr</option>
                <option value="180">3 hr</option>
                <option value="240">4 hr</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-4">Confirm Booking</button>
        </form>
      )}
    </div>
  );
}
