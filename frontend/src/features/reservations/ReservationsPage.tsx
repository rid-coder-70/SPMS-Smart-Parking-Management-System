import { useEffect, useState } from 'react';
import api from '@/common/api';
import type { Reservation } from '@/common/types';
import { CalendarCheck, X, Clock, MapPin, Car, AlertCircle } from 'lucide-react';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchReservations = async () => {
    try {
      const res = await api.get<Reservation[]>('/reservations/my');
      setReservations(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setActionMsg(null);
    try {
      await api.delete(`/reservations/${id}`);
      setActionMsg({ type: 'ok', text: 'Reservation cancelled successfully.' });
      fetchReservations();
    } catch (err: any) {
      setActionMsg({ type: 'err', text: err?.message || 'Failed to cancel reservation' });
    }
  };

  const handleCheckIn = async (reservationId: number) => {
    setActionMsg(null);
    try {
      await api.post(`/billing/check-in/${reservationId}`);
      setActionMsg({ type: 'ok', text: 'Checked in successfully! View your transaction in My Billing.' });
      fetchReservations();
    } catch (err: any) {
      setActionMsg({ type: 'err', text: err?.message || 'Failed to check in' });
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
      CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed',
      NO_SHOW: 'badge-no-show',
    };
    return map[status] || 'badge-inactive';
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CalendarCheck className="h-8 w-8 text-blue-400" />
          My Reservations
        </h1>
        <p className="text-white/50 mt-1">View and manage your parking reservations.</p>
      </div>

      {/* Action messages */}
      {actionMsg && (
        <div className={actionMsg.type === 'ok' ? 'alert-success' : 'alert-error'}>
          {actionMsg.text}
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      {reservations.length === 0 ? (
        <div className="card text-center py-16">
          <CalendarCheck className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg mb-2">No reservations yet</p>
          <p className="text-white/30 text-sm">Go to the Parking Map to reserve a slot!</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-4 lg:hidden">
            {reservations.map((r) => (
              <div key={r.id} className="card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">{r.slotNumber}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{r.lotName}</p>
                      <p className="text-xs text-white/40">#{r.id}</p>
                    </div>
                  </div>
                  <span className={getStatusBadge(r.status)}>{r.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-white/50">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(r.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/50">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(r.endTime)}</span>
                  </div>
                  {r.vehicleNumber && (
                    <div className="flex items-center gap-2 text-white/50 col-span-2">
                      <Car className="h-4 w-4" />
                      <span>{r.vehicleNumber}</span>
                    </div>
                  )}
                </div>

                {(r.status === 'CONFIRMED' || r.status === 'PENDING') && (
                  <div className="flex gap-3">
                    <button onClick={() => handleCheckIn(r.id)} className="btn-success flex-1 text-sm">
                      Check In
                    </button>
                    <button onClick={() => handleCancel(r.id)} className="btn-danger flex-1 text-sm">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="card hidden lg:block overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Slot</th>
                    <th>Lot</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id}>
                      <td className="text-white/40 text-sm">#{r.id}</td>
                      <td className="font-semibold text-white">{r.slotNumber}</td>
                      <td className="text-white/60">{r.lotName}</td>
                      <td className="text-white/60 text-sm">{formatDate(r.startTime)}</td>
                      <td className="text-white/60 text-sm">{formatDate(r.endTime)}</td>
                      <td className="text-white/60 text-sm">{r.vehicleNumber || '—'}</td>
                      <td><span className={getStatusBadge(r.status)}>{r.status}</span></td>
                      <td className="text-right">
                        {(r.status === 'CONFIRMED' || r.status === 'PENDING') && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleCheckIn(r.id)}
                              className="btn-success text-xs py-1.5 px-3"
                            >
                              Check In
                            </button>
                            <button
                              onClick={() => handleCancel(r.id)}
                              className="btn-danger text-xs py-1.5 px-3"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import ReservationForm       from './ReservationForm';
import MyReservationsPage    from './MyReservationsPage';
import CheckInOutPage        from './CheckInOutPage';
import { PlusCircle, List, LogIn } from 'lucide-react';

type Tab = 'book' | 'my' | 'session';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'book',    label: 'Book a Slot',        icon: <PlusCircle className="h-4 w-4" /> },
  { id: 'my',      label: 'My Reservations',    icon: <List       className="h-4 w-4" /> },
  { id: 'session', label: 'Check In / Out',     icon: <LogIn      className="h-4 w-4" /> },
];

const ReservationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('book');

  return (
    <div className="min-h-screen bg-night-900">
      {/* Page header */}
      <div className="border-b border-night-700 bg-night-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="pt-8 pb-0">
            <h1 className="text-2xl font-bold text-white mb-5">Parking Reservations</h1>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-night-700">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg
                    border-b-2 transition-all duration-200
                    ${activeTab === tab.id
                      ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                      : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'book'    && <ReservationForm onSuccess={() => setActiveTab('my')} />}
        {activeTab === 'my'      && <MyReservationsPage />}
        {activeTab === 'session' && <CheckInOutPage />}
      </div>
    </div>
  );
};

export default ReservationsPage;
