import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/common/api';
import type { OccupancyReport, ParkingLot } from '@/common/types';
import {
  LayoutDashboard,
  ParkingCircle,
  Grid3X3,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';

export default function AdminDashboard() {
  const [occupancy, setOccupancy] = useState<OccupancyReport[]>([]);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [occRes, lotsRes] = await Promise.all([
          api.get<OccupancyReport[]>('/reports/occupancy').catch(() => ({ data: [] })),
          api.get<ParkingLot[]>('/lots').catch(() => ({ data: [] })),
        ]);
        setOccupancy(occRes.data || []);
        setLots(lotsRes.data || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalCapacity = occupancy.reduce((s, o) => s + o.totalCapacity, 0);
  const totalOccupied = occupancy.reduce((s, o) => s + o.occupiedSlots, 0);
  const totalAvailable = occupancy.reduce((s, o) => s + o.availableSlots, 0);
  const overallPercent = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-brand-400" />
          Admin Dashboard
        </h1>
        <p className="text-white/50 mt-1">System overview and quick management actions.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ParkingCircle className="h-5 w-5 text-brand-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Active Lots</span>
          </div>
          <p className="text-3xl font-bold text-white">{lots.length}</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Grid3X3 className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Total Capacity</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalCapacity}</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Available Slots</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalAvailable}</p>
        </div>

        <div className="stat-card group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-white/50">Overall Occupancy</span>
          </div>
          <p className="text-3xl font-bold text-white">{overallPercent}%</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/lots" className="card group hover:border-brand-500/30 cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ParkingCircle className="h-6 w-6 text-brand-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">Manage Lots</h3>
            <p className="text-sm text-white/50">Add or deactivate parking lots</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-brand-400 transition-all" />
        </Link>

        <Link to="/admin/slots" className="card group hover:border-blue-500/30 cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Grid3X3 className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">Manage Slots</h3>
            <p className="text-sm text-white/50">Map out physical parking spaces</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-blue-400 transition-all" />
        </Link>

        <Link to="/admin/reports" className="card group hover:border-purple-500/30 cursor-pointer flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BarChart3 className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">View Reports</h3>
            <p className="text-sm text-white/50">Revenue and occupancy analytics</p>
          </div>
          <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-purple-400 transition-all" />
        </Link>
      </div>

      {/* Live Occupancy */}
      {occupancy.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Live Occupancy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {occupancy.map((lot) => (
              <div key={lot.lotId} className="rounded-xl border border-night-700 bg-night-900/50 p-5 hover:border-night-600 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{lot.lotName}</h3>
                  <span className={`text-sm font-bold ${
                    lot.occupancyPercent > 80 ? 'text-red-400' :
                    lot.occupancyPercent > 50 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {lot.occupancyPercent.toFixed(1)}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-night-700 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      lot.occupancyPercent > 80 ? 'bg-red-500' :
                      lot.occupancyPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(lot.occupancyPercent, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-white/40">
                  <span>Occupied: {lot.occupiedSlots}</span>
                  <span>Available: {lot.availableSlots}</span>
                  <span>Total: {lot.totalCapacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
