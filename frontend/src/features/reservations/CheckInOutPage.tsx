import React, { useEffect, useState, useCallback } from 'react';
import { ReservationService } from './reservation.service';
import type { Reservation, CheckOutResponse } from '../../common/types';
import {
  LogIn, LogOut, Clock, CheckCircle, DollarSign,
  Receipt, AlertCircle, RotateCcw
} from 'lucide-react';

const CheckInOutPage: React.FC = () => {
  const [reservations,   setReservations]   = useState<Reservation[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [actionLoading,  setActionLoading]  = useState(false);
  const [actionError,    setActionError]    = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<CheckOutResponse | null>(null);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ReservationService.getMyReservations();
      setReservations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  // Find today's active reservation (PENDING or CONFIRMED)
  const activeReservation = reservations.find((r) => {
    const startDate = r.startTime.split('T')[0];
    const endDate   = r.endTime.split('T')[0];
    const isActive  = r.status === 'PENDING' || r.status === 'CONFIRMED';
    const isToday   = startDate === today || endDate === today;
    return isActive && isToday;
  }) ?? null;

  const handleCheckIn = async () => {
    if (!activeReservation) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const data = await ReservationService.checkIn(activeReservation.id);
      setReservations((prev) =>
        prev.map((r) => r.id === activeReservation.id ? data : r)
      );
    } catch (err: any) {
      setActionError(err.message || 'Check-in failed. Please ensure you are within the 30-minute window.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeReservation) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const data = await ReservationService.checkOut(activeReservation.id);
      setCheckoutResult(data);
      setReservations((prev) =>
        prev.map((r) => r.id === activeReservation.id ? data.reservation : r)
      );
    } catch (err: any) {
      setActionError(err.message || 'Check-out failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <RotateCcw className="h-8 w-8 text-brand-400 animate-spin" />
          <p className="text-white/50 text-sm">Loading today's reservation...</p>
        </div>
      </div>
    );
  }

  // ── Checkout Success Summary ─────────────────────────────────
  if (checkoutResult) {
    const { reservation, transaction } = checkoutResult;
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="card text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Checked Out!</h2>
            <p className="text-white/50 text-sm mt-1">Thank you for using SPMS.</p>
          </div>

          {/* Fee summary */}
          <div className="bg-night-900 border border-night-700 rounded-xl p-6 space-y-4 text-left">
            <div className="flex items-center gap-2 text-brand-400 font-semibold mb-2">
              <Receipt className="h-5 w-5" /> Session Summary
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Slot</span>
              <span className="text-white font-medium">#{reservation.slotId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Check-in</span>
              <span className="text-white font-medium">{reservation.checkInTime ? fmt(reservation.checkInTime) : '-'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Check-out</span>
              <span className="text-white font-medium">{fmt(reservation.endTime)}</span>
            </div>
            <div className="border-t border-night-700 pt-4 flex justify-between items-center">
              <span className="text-white/80 font-semibold flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-brand-400" /> Total Fee
              </span>
              <span className="text-2xl font-bold text-brand-400">
                ${Number(transaction.totalFee).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Receipt #</span>
              <span className="text-white/60 font-mono">{transaction.receiptId}</span>
            </div>
          </div>

          <button
            id="checkinout-done"
            onClick={() => { setCheckoutResult(null); fetchReservations(); }}
            className="btn-primary w-full"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── No active reservation today ──────────────────────────────
  if (!activeReservation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="card text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-night-900 border border-night-700 flex items-center justify-center">
            <Clock className="h-7 w-7 text-white/30" />
          </div>
          <h2 className="text-xl font-semibold text-white">No Active Reservation Today</h2>
          <p className="text-white/50 text-sm">You don't have a PENDING or CONFIRMED reservation for today.</p>
          <button
            id="checkinout-refresh"
            onClick={fetchReservations}
            className="btn-secondary flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>
    );
  }

  // ── Active reservation — Check In or Check Out ───────────────
  const isPending   = activeReservation.status === 'PENDING';
  const isConfirmed = activeReservation.status === 'CONFIRMED';

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Check In / Check Out</h1>
        <p className="text-white/50 text-sm mt-1">Manage your active parking session</p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert-error">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {actionError && (
        <div className="alert-error">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p>{actionError}</p>
        </div>
      )}

      {/* Reservation Card */}
      <div className="card space-y-5">
        {/* Status indicator */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Reservation #{activeReservation.id}</h2>
          <span className={`badge flex items-center gap-1.5 ${
            isPending ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
            'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}>
            {isPending ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
            {activeReservation.status}
          </span>
        </div>

        {/* Details */}
        <div className="bg-night-900 rounded-xl border border-night-700 divide-y divide-night-700">
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-white/50">Slot</span>
            <span className="text-white font-medium">#{activeReservation.slotId}</span>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-white/50">Start</span>
            <span className="text-white font-medium">{fmt(activeReservation.startTime)}</span>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-white/50">End</span>
            <span className="text-white font-medium">{fmt(activeReservation.endTime)}</span>
          </div>
          {activeReservation.checkInTime && (
            <div className="flex justify-between px-4 py-3 text-sm">
              <span className="text-white/50">Checked In</span>
              <span className="text-blue-300 font-medium">{fmt(activeReservation.checkInTime)}</span>
            </div>
          )}
        </div>

        {/* Check-in hint */}
        {isPending && (
          <p className="text-xs text-white/40 text-center">
            Check-in window opens at your start time and closes 30 minutes later.
          </p>
        )}

        {/* Action button */}
        {isPending && (
          <button
            id="check-in-btn"
            onClick={handleCheckIn}
            disabled={actionLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <span className="h-4 w-4 border-2 border-night-900/30 border-t-night-900 rounded-full animate-spin" />
            ) : <LogIn className="h-5 w-5" />}
            {actionLoading ? 'Checking In...' : 'Check In'}
          </button>
        )}

        {isConfirmed && (
          <button
            id="check-out-btn"
            onClick={handleCheckOut}
            disabled={actionLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500"
          >
            {actionLoading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <LogOut className="h-5 w-5" />}
            {actionLoading ? 'Processing...' : 'Check Out & Pay'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckInOutPage;
