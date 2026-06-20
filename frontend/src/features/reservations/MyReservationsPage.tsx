import { useState, useEffect } from 'react';
import api from '@/common/api';
import type { Reservation } from '@/common/types';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = () => {
    api.get<Reservation[]>('/reservations/me')
      .then(res => setReservations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    try {
      const res = await api.put(`/reservations/${id}/cancel`);
      if (res.data.feeApplied) {
        alert("Reservation cancelled. Note: A cancellation fee applies because it was less than 60 minutes before start time.");
      } else {
        alert("Reservation cancelled successfully with no fee.");
      }
      fetchReservations();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  const upcoming = reservations.filter(r => r.status === 'PENDING' || r.status === 'CONFIRMED');
  const history = reservations.filter(r => r.status !== 'PENDING' && r.status !== 'CONFIRMED');

  const renderTable = (list: Reservation[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-white/80">
        <thead className="border-b border-white/10 text-white font-semibold">
          <tr>
            <th className="pb-3 px-4">ID</th>
            <th className="pb-3 px-4">Slot ID</th>
            <th className="pb-3 px-4">Start Time</th>
            <th className="pb-3 px-4">End Time</th>
            <th className="pb-3 px-4">Status</th>
            <th className="pb-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map(r => (
            <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-3 px-4">{r.id}</td>
              <td className="py-3 px-4">{r.slotId}</td>
              <td className="py-3 px-4">{new Date(r.startTime).toLocaleString()}</td>
              <td className="py-3 px-4">{new Date(r.endTime).toLocaleString()}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold
                  ${r.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  ${r.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' : ''}
                  ${r.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : ''}
                  ${r.status === 'CANCELLED' ? 'bg-gray-500/20 text-gray-400' : ''}
                  ${r.status === 'NO_SHOW' ? 'bg-red-500/20 text-red-400' : ''}
                `}>
                  {r.status}
                </span>
              </td>
              <td className="py-3 px-4">
                {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                  <button onClick={() => handleCancel(r.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Cancel</button>
                )}
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td colSpan={6} className="py-4 text-center opacity-50">No reservations found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">My Reservations</h1>
      
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">Upcoming</h2>
        {renderTable(upcoming)}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">History</h2>
        {renderTable(history)}
      </div>
    </div>
  );
}
