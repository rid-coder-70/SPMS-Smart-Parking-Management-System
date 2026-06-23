import React, { useEffect, useState, useCallback } from 'react';
import { ReservationService } from './reservation.service';
import type { Reservation, CancelResponse } from '../../common/types';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  RotateCcw, ChevronRight, Ban
} from 'lucide-react';


const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-50  border-yellow-200  text-yellow-700',
  CONFIRMED: 'bg-blue-50    border-blue-200    text-blue-700',
  CANCELLED: 'bg-gray-50    border-gray-200    text-gray-500',
  COMPLETED: 'bg-green-50   border-green-200   text-green-700',
  NO_SHOW:   'bg-red-50     border-red-200     text-red-600',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING:   <Clock className="h-3.5 w-3.5" />,
  CONFIRMED: <CheckCircle className="h-3.5 w-3.5" />,
  CANCELLED: <Ban className="h-3.5 w-3.5" />,
  COMPLETED: <CheckCircle className="h-3.5 w-3.5" />,
  NO_SHOW:   <XCircle className="h-3.5 w-3.5" />,
};


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
    <div className="card hover:border-orange-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center group-hover:border-orange-300 transition-colors">
            <span className="text-orange-500 font-bold text-sm">#{reservation.slotId}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Slot {reservation.slotId}</p>
            <p className="text-xs text-gray-400">Reservation #{reservation.id}</p>
          </div>
        </div>
        <span className={`badge flex items-center gap-1.5 ${STATUS_STYLES[reservation.status] ?? ''}`}>
          {STATUS_ICONS[reservation.status]}
          {reservation.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-orange-50/60 rounded-lg p-3 border border-orange-100">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-orange-400" /> Start
          </p>
          <p className="text-sm font-medium text-gray-800">{fmt(reservation.startTime)}</p>
        </div>
        <div className="bg-orange-50/60 rounded-lg p-3 border border-orange-100">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-orange-400" /> End
          </p>
          <p className="text-sm font-medium text-gray-800">{fmt(reservation.endTime)}</p>
        </div>
      </div>

      {reservation.checkInTime && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4 text-xs text-blue-700">
          <span className="font-medium">Checked in:</span> {fmt(reservation.checkInTime)}
        </div>
      )}

      {feeWarning && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-4 text-xs text-yellow-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{feeWarning}</p>
        </div>
      )}

      {isActive && (
        <button
          id={`cancel-reservation-${reservation.id}`}
          onClick={handleCancel}
          disabled={cancelling}
          className="btn-secondary w-full text-sm mt-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
        >
          {cancelling ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
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


  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <RotateCcw className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-gray-500 text-sm">Loading your reservations…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error max-w-lg mx-auto mt-12">
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-500 text-sm mt-1">{reservations.length} total reservation{reservations.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          id="refresh-reservations"
          onClick={fetchReservations}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RotateCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Upcoming</h2>
          <span className="badge bg-orange-50 border-orange-200 text-orange-600">{upcoming.length}</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="card border-dashed text-center py-12">
            <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No upcoming reservations.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {upcoming.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onCancelled={(id) => handleCancelled(id)}
              />
            ))}
          </div>
        )}
      </section>
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">History</h2>
          <span className="badge bg-gray-50 border-gray-200 text-gray-500">{history.length}</span>
        </div>
        {history.length === 0 ? (
          <div className="card border-dashed text-center py-12">
            <Clock className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No past reservations yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {history.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onCancelled={(id) => handleCancelled(id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyReservationsPage;
