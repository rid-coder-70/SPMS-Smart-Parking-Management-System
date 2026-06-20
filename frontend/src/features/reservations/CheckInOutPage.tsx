import { useState, useEffect } from 'react';
import api from '@/common/api';
import type { Reservation } from '@/common/types';

export default function CheckInOutPage() {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);

  const fetchActive = () => {
    api.get<Reservation[]>('/reservations/me')
      .then(res => {
        const active = res.data.find(r => r.status === 'PENDING' || r.status === 'CONFIRMED');
        setReservation(active || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchActive();
  }, []);

  const handleCheckIn = async () => {
    if (!reservation) return;
    setError(null);
    try {
      await api.put(`/reservations/${reservation.id}/check-in`);
      fetchActive();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    if (!reservation) return;
    setError(null);
    try {
      const res = await api.put(`/reservations/${reservation.id}/check-out`);
      setReceipt(res.data);
      setReservation(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to check out");
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Check In / Check Out</h1>
      
      {error && <div className="alert-error">{error}</div>}

      {receipt && (
        <div className="card bg-green-500/10 border-green-500/30">
          <h2 className="text-lg font-bold text-green-400 mb-2">Checkout Successful!</h2>
          <p className="text-white/80">Total Fee: ${receipt.totalFee}</p>
          <p className="text-white/80">Receipt ID: {receipt.receiptId}</p>
        </div>
      )}

      {reservation ? (
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">Active Reservation #{reservation.id}</h2>
          <div className="space-y-2 text-white/80 mb-6">
            <p><strong>Slot ID:</strong> {reservation.slotId}</p>
            <p><strong>Start Time:</strong> {new Date(reservation.startTime).toLocaleString()}</p>
            <p><strong>Status:</strong> {reservation.status}</p>
          </div>

          {reservation.status === 'PENDING' && (
            <button onClick={handleCheckIn} className="btn-primary w-full py-4 text-lg">Check In Now</button>
          )}

          {reservation.status === 'CONFIRMED' && (
            <button onClick={handleCheckOut} className="btn-secondary w-full py-4 text-lg border-red-500/30 hover:bg-red-500/20 text-red-400">Check Out</button>
          )}
        </div>
      ) : (
        <div className="card text-center text-white/60">
          No active reservations found for today.
        </div>
      )}
    </div>
  );
}
