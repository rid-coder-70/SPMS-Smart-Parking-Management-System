import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { ReservationService } from '@/features/reservations/reservation.service';
import { BillingService } from '@/features/billing/billing.service';
import { ParkingService } from '@/features/parking/parking.service';
import type { Reservation, Transaction, ParkingLot } from '@/common/types';
import {
  MapPin,
  CalendarCheck,
  Clock,
  ArrowRight,
  ParkingCircle,
  TrendingUp,
  Plus,
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lots,         setLots]         = useState<ParkingLot[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    async function load() {
      const [res, tx, lo] = await Promise.allSettled([
        ReservationService.getMyReservations(),
        BillingService.getMyTransactions(),
        ParkingService.getAllLots(),
      ]);
      if (res.status === 'fulfilled') setReservations(res.value.slice(0, 10));
      if (tx.status  === 'fulfilled') setTransactions(tx.value.slice(0, 10));
      if (lo.status  === 'fulfilled') setLots(lo.value);
      setLoading(false);
    }
    load();
  }, []);

  const activeCount  = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length;
  const pendingTxCnt = transactions.filter(t => t.paymentStatus === 'PENDING').length;
  const totalSpent   = transactions.filter(t => t.paymentStatus === 'PAID').reduce((s, t) => s + (t.amount ?? 0), 0);
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
      color:  'blue',
      bg:     'bg-blue-500/8',
      border: 'border-blue-500/15',
      text:   'text-blue-400',
    },
    {
      label:  'Pending Check-outs',
      value:  pendingTxCnt,
      icon:   <Clock className="h-4 w-4" />,
      color:  'amber',
      bg:     'bg-amber-500/8',
      border: 'border-amber-500/15',
      text:   'text-amber-400',
    },
    {
      label:  'Total Spent',
      value:  `৳${totalSpent.toFixed(0)}`,
      icon:   <TrendingUp className="h-4 w-4" />,
      color:  'emerald',
      bg:     'bg-emerald-500/8',
      border: 'border-emerald-500/15',
      text:   'text-emerald-400',
    },
    {
      label:  'Parking Lots',
      value:  availableLots,
      icon:   <ParkingCircle className="h-4 w-4" />,
      color:  'violet',
      bg:     'bg-violet-500/8',
      border: 'border-violet-500/15',
      text:   'text-violet-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good day, <span className="text-brand-400">{user?.username}</span> 👋
        </h1>
        <p className="text-sm text-white/40 mt-1">Here's an overview of your parking activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className={`stat-card border ${s.border} ${s.bg}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white/5 border border-white/8 ${s.text}`}>
              {s.icon}
            </div>
            <p className={`text-2xl font-bold text-white mb-0.5`}>{s.value}</p>
            <p className="text-xs text-white/40 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/parking"
            className="card group hover:border-blue-500/20 hover:bg-blue-500/3 cursor-pointer flex items-center gap-4 transition-all">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">Find a Parking Spot</p>
              <p className="text-xs text-white/40 mt-0.5">Browse lots & reserve a slot</p>
            </div>
            <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link to="/reservations"
            className="card group hover:border-violet-500/20 hover:bg-violet-500/3 cursor-pointer flex items-center gap-4 transition-all">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <CalendarCheck className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">My Reservations</p>
              <p className="text-xs text-white/40 mt-0.5">View, check-in, or cancel</p>
            </div>
            <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

      {/* Recent reservations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Recent Reservations</h2>
          <Link to="/reservations" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {reservations.length === 0 ? (
          <div className="card text-center py-12 border-dashed">
            <CalendarCheck className="h-10 w-10 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30 mb-1">No reservations yet</p>
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
                      <td className="font-mono font-semibold text-white text-xs">{r.slotNumber}</td>
                      <td className="text-white/55">{r.lotName}</td>
                      <td className="text-white/45 text-xs">{formatDate(r.startTime)}</td>
                      <td><span className={statusBadgeClass[r.status] ?? 'badge-inactive'}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      {transactions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Recent Billing</h2>
            <Link to="/billing" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Check-In</th>
                    <th>Amount</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 4).map(t => (
                    <tr key={t.id}>
                      <td className="font-mono font-semibold text-white text-xs">{t.slotNumber}</td>
                      <td className="text-white/45 text-xs">{formatDate(t.checkInTime)}</td>
                      <td className="font-semibold text-white">{t.amount ? `৳${t.amount.toFixed(2)}` : '—'}</td>
                      <td>
                        <span className={statusBadgeClass[t.paymentStatus] ?? 'badge-inactive'}>
                          {t.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
