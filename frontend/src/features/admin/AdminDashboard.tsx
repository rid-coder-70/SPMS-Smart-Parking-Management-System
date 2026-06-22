import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReportService } from './report.service';
import { ParkingService } from '@/features/parking/parking.service';
import type { OccupancyReport, ParkingLot } from '@/common/types';
import {
  LayoutDashboard,
  ParkingCircle,
  LayoutGrid,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [occupancy, setOccupancy] = useState<OccupancyReport[]>([]);
  const [lots,      setLots]      = useState<ParkingLot[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const [occ, lo] = await Promise.allSettled([
        ReportService.getOccupancy(),
        ParkingService.getAllLots(),
      ]);
      if (occ.status === 'fulfilled') setOccupancy(occ.value ?? []);
      if (lo.status  === 'fulfilled') setLots(lo.value ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const totalCap       = occupancy.reduce((s, o) => s + o.totalCapacity, 0);
  const totalOccupied  = occupancy.reduce((s, o) => s + o.occupiedSlots, 0);
  const totalAvailable = occupancy.reduce((s, o) => s + o.availableSlots, 0);
  const overallPct     = totalCap > 0 ? ((totalOccupied / totalCap) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Active Lots',
      value: lots.length,
      icon: <ParkingCircle className="h-4 w-4 text-brand-400" />,
      bg: 'bg-brand-500/8', border: 'border-brand-500/15',
    },
    {
      label: 'Total Capacity',
      value: totalCap,
      icon: <Layers className="h-4 w-4 text-blue-400" />,
      bg: 'bg-blue-500/8', border: 'border-blue-500/15',
    },
    {
      label: 'Available Slots',
      value: totalAvailable,
      icon: <Activity className="h-4 w-4 text-emerald-400" />,
      bg: 'bg-emerald-500/8', border: 'border-emerald-500/15',
    },
    {
      label: 'Overall Occupancy',
      value: `${overallPct}%`,
      icon: <TrendingUp className="h-4 w-4 text-purple-400" />,
      bg: 'bg-purple-500/8', border: 'border-purple-500/15',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <LayoutDashboard className="h-6 w-6 text-brand-400" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-white/40 mt-1">System overview and quick management actions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`stat-card border ${s.border} ${s.bg}`}
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center mb-3">
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{s.value}</p>
            <p className="text-xs text-white/40 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick management actions */}
      <div>
        <h2 className="text-sm font-semibold text-white/35 uppercase tracking-wider mb-3">Management</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              to: '/admin/lots',
              label: 'Manage Lots',
              desc: 'Add, edit, or deactivate parking lots',
              icon: <ParkingCircle className="h-5 w-5 text-brand-400" />,
              border: 'hover:border-brand-500/20',
              hover:  'hover:bg-brand-500/3',
              arrow:  'group-hover:text-brand-400',
            },
            {
              to: '/admin/slots',
              label: 'Manage Slots',
              desc: 'Add slots and mark out-of-service',
              icon: <LayoutGrid className="h-5 w-5 text-blue-400" />,
              border: 'hover:border-blue-500/20',
              hover:  'hover:bg-blue-500/3',
              arrow:  'group-hover:text-blue-400',
            },
            {
              to: '/admin/reports',
              label: 'View Reports',
              desc: 'Revenue summaries and live occupancy',
              icon: <BarChart3 className="h-5 w-5 text-purple-400" />,
              border: 'hover:border-purple-500/20',
              hover:  'hover:bg-purple-500/3',
              arrow:  'group-hover:text-purple-400',
            },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`card group cursor-pointer flex items-center gap-4 transition-all ${item.border} ${item.hover}`}
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight className={`h-4 w-4 text-white/20 ${item.arrow} group-hover:translate-x-0.5 transition-all`} />
            </Link>
          ))}
        </div>
      </div>

      {/* Live Occupancy */}
      {occupancy.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/35 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Occupancy
            </h2>
            <Link to="/admin/reports" className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
              Full Report <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {occupancy.map(lot => {
              const pct = lot.occupancyPercent;
              const color = pct > 80 ? 'red' : pct > 50 ? 'amber' : 'emerald';
              const barColors: Record<string, string> = {
                red:     'bg-red-500',
                amber:   'bg-amber-500',
                emerald: 'bg-emerald-500',
              };
              const textColors: Record<string, string> = {
                red:     'text-red-400',
                amber:   'text-amber-400',
                emerald: 'text-emerald-400',
              };
              return (
                <div key={lot.lotId} className="card hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{lot.lotName}</h3>
                      <p className="text-xs text-white/35">{lot.occupiedSlots} / {lot.totalCapacity} occupied</p>
                    </div>
                    <span className={`text-sm font-bold ${textColors[color]}`}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColors[color]}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-white/30 mt-2">
                    <span>Available: {lot.availableSlots}</span>
                    <span>Total: {lot.totalCapacity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
