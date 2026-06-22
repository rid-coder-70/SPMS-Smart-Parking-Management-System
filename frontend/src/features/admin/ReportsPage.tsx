import { useState, useEffect } from 'react';
import api from '@/common/api';
import type { RevenueReport, OccupancyReport } from '@/common/types';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Activity,
  Search,
  Receipt,
} from 'lucide-react';

export default function ReportsPage() {
  // Revenue state
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState('');

  // Occupancy state
  const [occupancy, setOccupancy] = useState<OccupancyReport[]>([]);
  const [occupancyLoading, setOccupancyLoading] = useState(true);

  useEffect(() => {
    fetchOccupancy();
  }, []);

  const fetchOccupancy = async () => {
    try {
      const res = await api.get<OccupancyReport[]>('/reports/occupancy');
      setOccupancy(res.data || []);
    } catch { } finally {
      setOccupancyLoading(false);
    }
  };

  const fetchRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevenueLoading(true);
    setRevenueError('');
    try {
      const res = await api.get<RevenueReport>(`/reports/revenue?from=${fromDate}&to=${toDate}`);
      setRevenue(res.data);
    } catch (err: any) {
      setRevenueError(err?.message || 'Failed to fetch revenue report');
    } finally {
      setRevenueLoading(false);
    }
  };

  const formatAmount = (n: number) => `৳${Number(n).toFixed(2)}`;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-purple-400" />
          Reports & Analytics
        </h1>
        <p className="text-white/50 mt-1">Revenue summaries and live occupancy data.</p>
      </div>

      {/* ── Revenue Report ─────────────────────────────────── */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          Revenue Report
        </h2>

        <form onSubmit={fetchRevenue} className="flex flex-wrap gap-4 items-end mb-6">
          <div className="flex-1 min-w-[180px]">
            <label className="label">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="label">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={revenueLoading} className="btn-primary">
            <Search className="h-4 w-4 mr-2" />
            {revenueLoading ? 'Loading…' : 'Generate Report'}
          </button>
        </form>

        {revenueError && <div className="alert-error mb-4">{revenueError}</div>}

        {revenue && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-night-700 bg-night-900/50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm text-white/50">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatAmount(revenue.totalRevenue)}</p>
              <p className="text-xs text-white/30 mt-1">{revenue.fromDate} to {revenue.toDate}</p>
            </div>

            <div className="rounded-xl border border-night-700 bg-night-900/50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm text-white/50">Total Transactions</span>
              </div>
              <p className="text-2xl font-bold text-white">{revenue.totalTransactions}</p>
            </div>

            <div className="rounded-xl border border-night-700 bg-night-900/50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm text-white/50">Average Fee</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatAmount(revenue.averageFee)}</p>
            </div>
          </div>
        )}

        {!revenue && !revenueError && !revenueLoading && (
          <div className="text-center py-8 text-white/30">
            <Search className="h-8 w-8 mx-auto mb-3 text-white/20" />
            <p>Select a date range and click Generate Report</p>
          </div>
        )}
      </div>

      {/* ── Occupancy Report ───────────────────────────────── */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-400" />
          Live Occupancy Report
        </h2>

        {occupancyLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : occupancy.length === 0 ? (
          <div className="text-center py-8 text-white/30">
            <p>No active lots to report on.</p>
          </div>
        ) : (
          <>
            {/* Occupancy Table */}
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Lot Name</th>
                    <th>Total Capacity</th>
                    <th>Occupied</th>
                    <th>Available</th>
                    <th>Occupancy</th>
                    <th className="w-48">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {occupancy.map((lot) => (
                    <tr key={lot.lotId}>
                      <td className="font-semibold text-white">{lot.lotName}</td>
                      <td className="text-white/60">{lot.totalCapacity}</td>
                      <td className="text-white/60">{lot.occupiedSlots}</td>
                      <td className="text-green-400 font-medium">{lot.availableSlots}</td>
                      <td className={`font-bold ${
                        lot.occupancyPercent > 80 ? 'text-red-400' :
                        lot.occupancyPercent > 50 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {lot.occupancyPercent.toFixed(1)}%
                      </td>
                      <td>
                        <div className="w-full h-2.5 bg-night-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              lot.occupancyPercent > 80 ? 'bg-red-500' :
                              lot.occupancyPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(lot.occupancyPercent, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
