import React, { useEffect, useState, useCallback } from 'react';
import { ReservationService } from './reservation.service';
import type { Reservation, CancelResponse } from '../../common/types';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  RotateCcw, ChevronRight, Ban
} from 'lucide-react';

// ── Status badge styling ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  CONFIRMED: 'bg-blue-500/10  border-blue-500/30  text-blue-300',
  CANCELLED: 'bg-gray-500/10  border-gray-500/30  text-gray-400',
  COMPLETED: 'bg-green-500/10 border-green-500/30 text-green-300',
  NO_SHOW:   'bg-red-500/10   border-red-500/30   text-red-400',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING:   <Clock className="h-3.5 w-3.5" />,
  CONFIRMED: <CheckCircle className="h-3.5 w-3.5" />,
  CANCELLED: <Ban className="h-3.5 w-3.5" />,
  COMPLETED: <CheckCircle className="h-3.5 w-3.5" />,
  NO_SHOW:   <XCircle className="h-3.5 w-3.5" />,
};

// ── ReservationCard ────────────────────────────────────────────────────────────

interface ReservationCardProps {
  reservation: Reservation;
  onCancelled: (id: number, response: CancelResponse) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onCancelled }) => {
  const [cancelling, setCancelling] = useState(false);
  const [feeWarning,  setFeeWarning]  = useState<string | null>(null);

  const isActive = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    setCancelling(true);
    try {
      const cancelResp = await ReservationService.cancel(reservation.id);
      if (cancelResp.feeApplied) {
        setFeeWarning('A late-cancellation fee has been flagged and will be applied by our billing team.');
      }
      onCancelled(reservation.id, cancelResp);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation.');
    } finally {
      setCancelling(false);
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="card border-night-700 hover:border-night-600 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-night-900 border border-night-700 flex items-center justify-center group-hover:border-brand-500/30 transition-colors">
            <span className="text-brand-400 font-bold text-sm">#{reservation.slotId}</span>
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Slot {reservation.slotId}</p>
            <p className="text-xs text-white/40">Reservation #{reservation.id}</p>
          </div>
        </div>
        <span className={`badge flex items-center gap-1.5 ${STATUS_STYLES[reservation.status] ?? ''}`}>
          {STATUS_ICONS[reservation.status]}
          {reservation.status.replace('_', ' ')}
        </span>
      </div>

      {/* Time Window */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-night-900 rounded-lg p-3 border border-night-700">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-brand-400" /> Start
          </p>
          <p className="text-sm font-medium text-white">{fmt(reservation.startTime)}</p>
        </div>
        <div className="bg-night-900 rounded-lg p-3 border border-night-700">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-brand-400" /> End
          </p>
          <p className="text-sm font-medium text-white">{fmt(reservation.endTime)}</p>
        </div>
      </div>

      {/* Check-in time (if checked in) */}
      {reservation.checkInTime && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2 mb-4 text-xs text-blue-300">
          <span className="font-medium">Checked in:</span> {fmt(reservation.checkInTime)}
        </div>
      )}

      {/* Fee warning */}
      {feeWarning && (
        <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2 mb-4 text-xs text-yellow-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{feeWarning}</p>
        </div>
      )}

      {/* Cancel Button */}
      {isActive && (
        <button
          id={`cancel-reservation-${reservation.id}`}
          onClick={handleCancel}
          disabled={cancelling}
          className="btn-secondary w-full text-sm mt-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
        >
          {cancelling ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              Cancelling...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Cancel Reservation
            </span>
          )}
        </button>
      )}
    </div>
  );
};

// ── MyReservationsPage ────────────────────────────────────────────────────────

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
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

  const handleCancelled = (id: number) => {
    setReservations((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'CANCELLED' as const } : r)
    );
  };

  const upcoming = reservations.filter((r) => r.status === 'PENDING' || r.status === 'CONFIRMED');
  const history  = reservations.filter((r) => r.status !== 'PENDING' && r.status !== 'CONFIRMED');

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <RotateCcw className="h-8 w-8 text-brand-400 animate-spin" />
          <p className="text-white/50 text-sm">Loading your reservations…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error max-w-lg mx-auto mt-12">
        <XCircle className="h-5 w-5 text-red-400 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Reservations</h1>
          <p className="text-white/50 text-sm mt-1">{reservations.length} total reservation{reservations.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          id="refresh-reservations"
          onClick={fetchReservations}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RotateCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Upcoming */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Upcoming</h2>
          <span className="badge bg-brand-500/10 border-brand-500/20 text-brand-400">{upcoming.length}</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="card border-dashed border-night-700 text-center py-12">
            <Calendar className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No upcoming reservations.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {upcoming.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onCancelled={(id, resp) => handleCancelled(id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-white/40" />
          <h2 className="text-lg font-semibold text-white">History</h2>
          <span className="badge bg-gray-500/10 border-gray-500/20 text-gray-400">{history.length}</span>
        </div>
        {history.length === 0 ? (
          <div className="card border-dashed border-night-700 text-center py-12">
            <Clock className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No past reservations yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {history.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onCancelled={(id, resp) => handleCancelled(id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyReservationsPage;
