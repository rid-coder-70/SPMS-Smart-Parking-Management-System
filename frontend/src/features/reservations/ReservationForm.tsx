import React, { useState } from 'react';
import { LotSelector } from '../parking/LotSelector';
import { SlotGrid } from '../parking/SlotGrid';
import { ReservationService } from './reservation.service';
import type { ParkingSlot, CreateReservationPayload, Reservation } from '../../common/types';
import { CalendarDays, Clock, Timer, CheckCircle, AlertCircle } from 'lucide-react';

const DURATION_OPTIONS = [
  { label: '30 min',   value: 30 },
  { label: '1 hr',     value: 60 },
  { label: '1.5 hrs',  value: 90 },
  { label: '2 hrs',    value: 120 },
  { label: '3 hrs',    value: 180 },
  { label: '4 hrs',    value: 240 },
];

interface ReservationFormProps {
  onSuccess?: (reservation: Reservation) => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ onSuccess }) => {
  const [lotId,          setLotId]          = useState<number | null>(null);
  const [selectedSlot,   setSelectedSlot]   = useState<ParkingSlot | null>(null);
  const [date,           setDate]           = useState<string>('');
  const [startTime,      setStartTime]      = useState<string>('');
  const [durationMinutes,setDurationMinutes]= useState<number>(60);
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);
  const [success,        setSuccess]        = useState<Reservation | null>(null);

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.status !== 'AVAILABLE') return;
    setSelectedSlot(slot);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSlot) { setError('Please select a parking slot.'); return; }
    if (!date)          { setError('Please pick a date.');           return; }
    if (!startTime)     { setError('Please pick a start time.');     return; }

    const startISO = `${date}T${startTime}:00`;
    const startObj = new Date(startISO);
    startObj.setMinutes(startObj.getMinutes() + durationMinutes);
    const pad = (n: number) => String(n).padStart(2, '0');
    const endISO = `${startObj.getFullYear()}-${pad(startObj.getMonth() + 1)}-${pad(startObj.getDate())}T${pad(startObj.getHours())}:${pad(startObj.getMinutes())}:00`;

    const payload: CreateReservationPayload = {
      slotId:    selectedSlot.id,
      startTime: startISO,
      endTime:   endISO,
    };

    setSubmitting(true);
    try {
      const data = await ReservationService.create(payload);
      setSuccess(data);
      setSelectedSlot(null);
      setDate('');
      setStartTime('');
      onSuccess?.(data);
    } catch (err: any) {
      if (err.status === 409) {
        setError('⚠️ This slot is already taken for that time window. Please choose a different slot or time.');
      } else if (err.status === 400) {
        setError(err.message || 'Invalid request. Check your inputs.');
      } else {
        setError(err.message || 'Failed to create reservation. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {success && (
        <div className="alert-success animate-fade-in">
          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-700">Reservation Created!</p>
            <p className="text-xs mt-0.5 text-green-600">
              Slot #{success.slotId} · {new Date(success.startTime).toLocaleString()} →{' '}
              {new Date(success.endTime).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-error animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm">1</div>
            <h3 className="font-semibold text-gray-900">Select a Parking Lot</h3>
          </div>
          <LotSelector
            value={lotId ?? undefined}
            onChange={(id) => { setLotId(id); setSelectedSlot(null); setError(null); }}
            className="w-full"
          />
        </div>

        {lotId && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm">2</div>
              <h3 className="font-semibold text-gray-900">Choose a Slot</h3>
              {selectedSlot && (
                <span className="ml-auto badge bg-orange-50 border-orange-200 text-orange-600">
                  ✓ Slot {selectedSlot.slotNumber} selected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">Click an <span className="text-green-600 font-medium">AVAILABLE</span> slot to select it.</p>
            <SlotGrid
              lotId={lotId}
              selectable
              onSlotClick={handleSlotClick}
            />
          </div>
        )}

        {selectedSlot && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm">3</div>
              <h3 className="font-semibold text-gray-900">Set Date, Time & Duration</h3>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-orange-500" /> Date
                </label>
                <input
                  id="reservation-date"
                  type="date"
                  className="input"
                  value={date}
                  min={minDate}
                  max={maxDate}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-orange-500" /> Start Time
                </label>
                <input
                  id="reservation-start-time"
                  type="time"
                  className="input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Timer className="h-4 w-4 text-orange-500" /> Duration
                </label>
                <select
                  id="reservation-duration"
                  className="input"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="reservation-submit"
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-6"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Booking...
                </span>
              ) : 'Confirm Reservation'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ReservationForm;
