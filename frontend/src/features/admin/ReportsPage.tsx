import { useState, useEffect } from 'react';
import { ReportService } from './report.service';
import type { RevenueReport, OccupancyReport } from '@/common/types';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Activity,
  Search,
  Receipt,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  const today    = new Date().toISOString().split('T')[0];
  const lastMonth = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0]; })();

  const [fromDate,       setFromDate]       = useState(lastMonth);
  const [toDate,         setToDate]         = useState(today);
  const [revenue,        setRevenue]        = useState<RevenueReport | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError,   setRevenueError]   = useState('');

  const [occupancy,        setOccupancy]        = useState<OccupancyReport[]>([]);
  const [occupancyLoading, setOccupancyLoading] = useState(true);

  useEffect(() => {
    ReportService.getOccupancy()
      .then(d => setOccupancy(d ?? []))
      .finally(() => setOccupancyLoading(false));
  }, []);

  const fetchRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setRevenueLoading(true);
    setRevenueError('');
    try {
      const data = await ReportService.getRevenue(fromDate, toDate);
      setRevenue(data);
    } catch (err: any) {
      setRevenueError(err?.message ?? 'Failed to fetch revenue report');
    } finally {
      setRevenueLoading(false);
    }
  };

  const refreshOccupancy = () => {
    setOccupancyLoading(true);
    ReportService.getOccupancy()
      .then(d => setOccupancy(d ?? []))
      .finally(() => setOccupancyLoading(false));
  };

  const fmt = (n: number) => `৳${Number(n).toFixed(2)}`;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 className="h-6 w-6 text-purple-400" />
          Reports & Analytics
        </h1>
        <p className="text-sm text-white/40 mt-1">Revenue summaries and live occupancy data.</p>
      </div>

      {/* Revenue Report */}
      <div className="card">
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <DollarSign className="h-4.5 w-4.5 text-emerald-400" />
          Revenue Report
        </h2>

        <form onSubmit={fetchRevenue} className="flex flex-wrap gap-3 items-end mb-6">
          <div className="flex-1 min-w-[160px]">
            <label className="label">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="label">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={revenueLoading} className="btn-primary gap-2">
            <Search className="h-4 w-4" />
            {revenueLoading ? 'Loading…' : 'Generate'}
          </button>
        </form>

        {revenueError && (
          <div className="alert-error mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {revenueError}
          </div>
        )}

        {revenue ? (
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                icon: <DollarSign className="h-4 w-4 text-emerald-400" />,
                label: 'Total Revenue',
                value: fmt(revenue.totalRevenue),
                sub: `${revenue.fromDate} → ${revenue.toDate}`,
                bg: 'bg-emerald-500/8', border: 'border-emerald-500/15',
              },
              {
                icon: <Receipt className="h-4 w-4 text-blue-400" />,
                label: 'Total Transactions',
                value: revenue.totalTransactions,
                sub: 'completed payments',
                bg: 'bg-blue-500/8', border: 'border-blue-500/15',
              },
              {
                icon: <TrendingUp className="h-4 w-4 text-purple-400" />,
                label: 'Average Fee',
                value: fmt(revenue.averageFee),
                sub: 'per transaction',
                bg: 'bg-purple-500/8', border: 'border-purple-500/15',
              },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-xl border p-5 ${s.border} ${s.bg}`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <span className="text-xs text-white/45 font-medium">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{s.value}</p>
                <p className="text-[11px] text-white/30">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        ) : !revenueLoading && (
          <div className="text-center py-10 text-white/25">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Select a date range and click Generate</p>
          </div>
        )}
      </div>

      {/* Occupancy Report */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-emerald-400" />
            Live Occupancy Report
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </h2>
          <button onClick={refreshOccupancy} className="btn-secondary text-xs px-3 py-2 gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {occupancyLoading ? (
          <div className="flex justify-center py-10">
            <div className="spinner" />
          </div>
        ) : occupancy.length === 0 ? (
          <div className="text-center py-10 text-white/25 text-sm">
            No active lots to report on.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Lot Name</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Available</th>
                  <th>Occupancy %</th>
                  <th className="w-48">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {occupancy.map(lot => {
                  const pct = lot.occupancyPercent;
                  const textColor = pct > 80 ? 'text-red-400' : pct > 50 ? 'text-amber-400' : 'text-emerald-400';
                  const barColor  = pct > 80 ? 'bg-red-500'   : pct > 50 ? 'bg-amber-500'   : 'bg-emerald-500';
                  return (
                    <tr key={lot.lotId}>
                      <td className="font-semibold text-white">{lot.lotName}</td>
                      <td className="text-white/55">{lot.totalCapacity}</td>
                      <td className="text-white/55">{lot.occupiedSlots}</td>
                      <td className="text-emerald-400 font-medium">{lot.availableSlots}</td>
                      <td className={`font-bold ${textColor}`}>{pct.toFixed(1)}%</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor} transition-all duration-700`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
