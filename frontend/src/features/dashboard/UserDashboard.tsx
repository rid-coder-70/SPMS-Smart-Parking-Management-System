import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { ReservationService } from '@/features/reservations/reservation.service';
import { ParkingService } from '@/features/parking/parking.service';
import type { Reservation, ParkingLot } from '@/common/types';
import {
  MapPin,
  CalendarCheck,
  ArrowRight,
  ParkingCircle,
  Plus,
  Home,
} from 'lucide-react';
import { motion } from 'framer-motion';

const statusBadgeClass: Record<string, string> = {
  CONFIRMED: 'badge-confirmed',
  PENDING:   'badge-pending',
  CANCELLED: 'badge-cancelled',
  COMPLETED: 'badge-completed',
  NO_SHOW:   'badge-no-show',
  PAID:      'badge-paid',
  FAILED:    'badge-failed',
  REFUNDED:  'badge-refunded',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [lots,         setLots]         = useState<ParkingLot[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      const [res, lo] = await Promise.allSettled([
        ReservationService.getMyReservations(),
        ParkingService.getAllLots(),
      ]);
      if (res.status === 'fulfilled') setReservations(res.value.slice(0, 10));
      if (lo.status  === 'fulfilled') setLots(lo.value);
      setLoading(false);
    }
    load();
  }, []);

  const activeCount  = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length;

  const availableLots = lots.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  const statCards = [
    {
      label:  'Active Reservations',
      value:  activeCount,
      icon:   <CalendarCheck className="h-4 w-4" />,
      bg:     'bg-orange-50',
      border: 'border-orange-200',
      text:   'text-orange-500',
    },
    {
      label:  'Parking Lots',
      value:  availableLots,
      icon:   <ParkingCircle className="h-4 w-4" />,
      bg:     'bg-yellow-50',
      border: 'border-yellow-200',
      text:   'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good day, <span className="text-orange-500">{user?.username}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here's an overview of your parking activity.</p>
        </div>
        <Link
          to="/"
          className="btn-secondary text-sm gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className={`stat-card border ${s.border} ${s.bg}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white border border-orange-100 ${s.text}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{s.value}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/parking"
            className="card group hover:border-orange-300 hover:shadow-orange cursor-pointer flex items-center gap-4 transition-all">
            <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Find a Parking Spot</p>
              <p className="text-xs text-gray-400 mt-0.5">Browse lots & reserve a slot</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link to="/reservations"
            className="card group hover:border-yellow-300 hover:shadow-yellow cursor-pointer flex items-center gap-4 transition-all">
            <div className="w-11 h-11 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <CalendarCheck className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">My Reservations</p>
              <p className="text-xs text-gray-400 mt-0.5">View, check-in, or cancel</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Reservations</h2>
          <Link to="/reservations" className="text-xs text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {reservations.length === 0 ? (
          <div className="card text-center py-12 border-dashed">
            <CalendarCheck className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-1">No reservations yet</p>
            <Link to="/parking" className="btn-primary text-xs px-4 py-2 mt-3">
              <Plus className="h-3.5 w-3.5" /> Book a slot
            </Link>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Lot</th>
                    <th>Start Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice(0, 5).map(r => (
                    <tr key={r.id}>
                      <td className="font-mono font-semibold text-gray-800 text-xs">{r.slotNumber}</td>
                      <td className="text-gray-600">{r.lotName}</td>
                      <td className="text-gray-500 text-xs">{formatDate(r.startTime)}</td>
                      <td><span className={statusBadgeClass[r.status] ?? 'badge-inactive'}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
