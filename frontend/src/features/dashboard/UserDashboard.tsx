import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import api from '@/common/api';
import type { Reservation, Transaction, ParkingLot } from '@/common/types';
import {
  MapPin,
  CalendarCheck,
  Receipt,
  Clock,
  ArrowRight,
  ParkingCircle,
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resRes, txRes, lotsRes] = await Promise.all([
          api.get<Reservation[]>('/reservations/my').catch(() => ({ data: [] })),
          api.get<Transaction[]>('/billing/my').catch(() => ({ data: [] })),
          api.get<ParkingLot[]>('/lots').catch(() => ({ data: [] })),
        ]);
        setRecentReservations((resRes.data || []).slice(0, 5));
        setRecentTransactions((txRes.data || []).slice(0, 5));
        setLots(lotsRes.data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeReservations = recentReservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'PENDING'
  ).length;
  const pendingTx = recentTransactions.filter(
    (t) => t.paymentStatus === 'PENDING'
  ).length;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
      CANCELLED: 'badge-cancelled', COMPLETED: 'badge-completed',
      NO_SHOW: 'badge-no-show', PAID: 'badge-paid',
      FAILED: 'badge-failed', REFUNDED: 'badge-refunded',
    };
    return map[status] || 'badge-inactive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="text-brand-400">{user?.username}</span>
        </h1>
        <p className="text-white/50 mt-1">Here's an overview of your parking activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Active Reservations</span>
          </div>
          <p className="text-3xl font-bold text-white">{activeReservations}</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Pending Check-outs</span>
          </div>
          <p className="text-3xl font-bold text-white">{pendingTx}</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Total Transactions</span>
          </div>
          <p className="text-3xl font-bold text-white">{recentTransactions.length}</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ParkingCircle className="h-5 w-5 text-brand-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Parking Lots</span>
          </div>
          <p className="text-3xl font-bold text-white">{lots.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/parking" className="card group hover:border-brand-500/30 cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="h-6 w-6 text-brand-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">Find a Parking Spot</h3>
            <p className="text-sm text-white/50">Browse available lots and reserve a slot</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link to="/reservations" className="card group hover:border-blue-500/30 cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CalendarCheck className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Manage Reservations</h3>
            <p className="text-sm text-white/50">View, check-in or cancel your bookings</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Recent Activity */}
      {recentReservations.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Reservations</h2>
            <Link to="/reservations" className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Lot</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.slice(0, 3).map((r) => (
                  <tr key={r.id}>
                    <td className="font-semibold text-white">{r.slotNumber}</td>
                    <td className="text-white/60">{r.lotName}</td>
                    <td className="text-white/60 text-sm">{formatDate(r.startTime)}</td>
                    <td><span className={getStatusBadge(r.status)}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
