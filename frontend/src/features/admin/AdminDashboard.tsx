import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ParkingService } from '@/features/parking/parking.service';
import type { ParkingLot } from '@/common/types';
import {
  LayoutDashboard,
  ParkingCircle,
  LayoutGrid,
  ArrowRight,
  Layers,
  Home,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [lots,      setLots]      = useState<ParkingLot[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const lo = await Promise.resolve(
        ParkingService.getAllLots(),
      );
      if (lo) setLots(lo ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const totalCap       = lots.reduce((s, o) => s + o.totalCapacity, 0);

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
      icon: <ParkingCircle className="h-4 w-4 text-orange-500" />,
      bg: 'bg-orange-50', border: 'border-orange-200',
    },
    {
      label: 'Total Capacity',
      value: totalCap,
      icon: <Layers className="h-4 w-4 text-yellow-600" />,
      bg: 'bg-yellow-50', border: 'border-yellow-200',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <LayoutDashboard className="h-6 w-6 text-orange-500" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">System overview and quick management actions.</p>
        </div>
        <Link
          to="/"
          className="btn-secondary text-sm gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
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
            <div className="w-8 h-8 rounded-lg bg-white border border-orange-100 flex items-center justify-center mb-3">
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{s.value}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick management actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Management</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              to: '/admin/lots',
              label: 'Manage Lots',
              desc: 'Add, edit, or deactivate parking lots',
              icon: <ParkingCircle className="h-5 w-5 text-orange-500" />,
              hoverBorder: 'hover:border-orange-300',
              hoverBg:     'hover:shadow-orange',
              arrow:       'group-hover:text-orange-500',
            },
            {
              to: '/admin/slots',
              label: 'Manage Slots',
              desc: 'Add slots and mark out-of-service',
              icon: <LayoutGrid className="h-5 w-5 text-yellow-600" />,
              hoverBorder: 'hover:border-yellow-300',
              hoverBg:     'hover:shadow-yellow',
              arrow:       'group-hover:text-yellow-600',
            },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`card group cursor-pointer flex items-center gap-4 transition-all ${item.hoverBorder} ${item.hoverBg}`}
            >
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight className={`h-4 w-4 text-gray-300 ${item.arrow} group-hover:translate-x-0.5 transition-all`} />
            </Link>
          ))}
        </div>
      </div>


    </div>
  );
}
