import React, { useEffect, useState, useCallback } from 'react';
import { ReservationService } from './reservation.service';
import type { Reservation, CancelResponse, CheckOutResponse } from '../../common/types';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  RotateCcw, ChevronRight, Ban, LogIn, LogOut, Receipt, X
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

interface ReceiptModalProps {
  receipt: CheckOutResponse;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-orange-100 space-y-5 animate-scale-up">
      <div className="flex items-center justify-between border-b border-orange-100 pb-4">
        <div className="flex items-center gap-2 text-orange-600 font-bold">
          <Receipt className="h-5 w-5" />
          <span>Digital Payment Receipt</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-orange-50">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Receipt ID</span>
          <span className="font-mono font-semibold text-gray-800">#TXN-{receipt.transactionId}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Parking Lot / Slot</span>
          <span className="font-semibold text-gray-800">{receipt.lotName} (Slot {receipt.slotNumber})</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Vehicle Type</span>
          <span className="font-semibold text-gray-800">{receipt.vehicleType}</span>
        </div>

        <div className="border-t border-dashed border-gray-200 my-2 pt-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Check-In</span>
            <span>{new Date(receipt.checkInTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Check-Out</span>
            <span>{new Date(receipt.checkOutTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Billed Duration</span>
            <span>{receipt.durationMinutes} min ({receipt.billedHours} hr{receipt.billedHours > 1 ? 's' : ''})</span>
          </div>
        </div>

        <div className="bg-orange-50/70 p-3.5 rounded-xl border border-orange-100 space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Base Hourly Rate</span>
            <span>৳{receipt.baseRate.toFixed(2)}/hr</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Extended Rate</span>
            <span>৳{receipt.extendedRate.toFixed(2)}/hr</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Vehicle Multiplier</span>
            <span>{receipt.vehicleMultiplier}x</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>৳{receipt.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Daily Max Cap</span>
            <span>৳{receipt.dailyCap.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-orange-200">
            <span>Total Paid</span>
            <span className="text-orange-600">৳{receipt.totalFee.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full btn-primary py-2.5 text-sm"
      >
        Close Receipt
      </button>
    </div>
  </div>
);

interface ReservationCardProps {
  reservation: Reservation;
  onCancelled: (id: number, response: CancelResponse) => void;
  onUpdated: () => void;
  onReceipt: (receipt: CheckOutResponse) => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation, onCancelled, onUpdated, onReceipt
}) => {
  const [loading, setLoading] = useState(false);
  const [feeWarning, setFeeWarning] = useState<string | null>(null);

  const isActive = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
  const canCheckIn = reservation.status === 'PENDING' && !reservation.checkInTime;
  const canCheckOut = reservation.status === 'CONFIRMED' && !!reservation.checkInTime;

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await ReservationService.checkIn(reservation.id);
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to check in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const resp = await ReservationService.checkOut(reservation.id);
      onReceipt(resp);
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to check out.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    setLoading(true);
    try {
      const cancelResp = await ReservationService.cancel(reservation.id);
      if (cancelResp.feeApplied) {
        setFeeWarning('A 50% cancellation fee has been applied per policy.');
      }
      onCancelled(reservation.id, cancelResp);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="card hover:border-orange-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center group-hover:border-orange-300 transition-colors">
            <span className="text-orange-500 font-bold text-sm">#{reservation.slotNumber}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Slot {reservation.slotNumber} ({reservation.lotName})</p>
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3 text-xs text-blue-700 flex items-center justify-between">
          <span><span className="font-medium">Checked in:</span> {fmt(reservation.checkInTime)}</span>
          {reservation.checkOutTime && <span><span className="font-medium">Out:</span> {fmt(reservation.checkOutTime)}</span>}
        </div>
      )}

      {reservation.totalFee !== null && reservation.totalFee !== undefined && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3 text-xs text-green-700 font-semibold flex justify-between items-center">
          <span>Total Paid</span>
          <span className="text-sm font-bold">৳{Number(reservation.totalFee).toFixed(2)}</span>
        </div>
      )}

      {feeWarning && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-4 text-xs text-yellow-700">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{feeWarning}</p>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        {canCheckIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="btn-primary flex-1 text-xs py-2 gap-1.5"
          >
            <LogIn className="h-3.5 w-3.5" /> Check In
          </button>
        )}

        {canCheckOut && (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="btn-primary flex-1 text-xs py-2 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          >
            <LogOut className="h-3.5 w-3.5" /> Check Out & Pay
          </button>
        )}

        {isActive && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="btn-secondary text-xs border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
          >
            <XCircle className="h-3.5 w-3.5" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<CheckOutResponse | null>(null);

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

      {activeReceipt && (
        <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-500 text-sm mt-1">{reservations.length} total reservation{reservations.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchReservations}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RotateCcw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Active / Upcoming</h2>
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
                onCancelled={handleCancelled}
                onUpdated={fetchReservations}
                onReceipt={setActiveReceipt}
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
                onCancelled={handleCancelled}
                onUpdated={fetchReservations}
                onReceipt={setActiveReceipt}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyReservationsPage;
