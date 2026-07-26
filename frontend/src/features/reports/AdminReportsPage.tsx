import { useEffect, useState } from 'react';
import { ReportService } from '@/features/reports/report.service';
import { ParkingService } from '@/features/parking/parking.service';
import type { UtilizationReport, RevenueReport, PeakHoursReport, ParkingLot } from '@/common/types';
import { BarChart3, TrendingUp, Clock, Filter, RefreshCcw } from 'lucide-react';

export default function AdminReportsPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<number | undefined>(undefined);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [from, setFrom] = useState(thirtyDaysAgo.toISOString().slice(0, 16));
  const [to, setTo] = useState(now.toISOString().slice(0, 16));

  const [utilization, setUtilization] = useState<UtilizationReport | null>(null);
  const [revenue, setRevenue] = useState<RevenueReport | null>(null);
  const [peakHours, setPeakHours] = useState<PeakHoursReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ParkingService.getAllLots().then(setLots).catch(console.error);
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const fromIso = new Date(from).toISOString();
      const toIso = new Date(to).toISOString();

      const [u, r, p] = await Promise.all([
        ReportService.getUtilization(fromIso, toIso, selectedLot),
        ReportService.getRevenue(fromIso, toIso, selectedLot),
        ReportService.getPeakHours(fromIso, toIso, selectedLot),
      ]);

      setUtilization(u);
      setRevenue(r);
      setPeakHours(p);
    } catch (err: any) {
      alert(err.message || 'Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, [selectedLot]);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-orange-500" /> Reporting & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Utilization, revenue performance, and peak usage trends in BDT (৳).</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-orange-100 shadow-sm">
          <Filter className="h-4 w-4 text-orange-500 ml-1" />
          <select
            value={selectedLot || ''}
            onChange={(e) => setSelectedLot(e.target.value ? Number(e.target.value) : undefined)}
            className="text-xs bg-orange-50/50 border border-orange-200 rounded-lg px-2.5 py-1.5 font-medium text-gray-700 outline-none"
          >
            <option value="">All Parking Lots</option>
            {lots.map(l => (
              <option key={l.id} value={l.id}>{l.lotName}</option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="text-xs bg-orange-50/50 border border-orange-200 rounded-lg px-2 py-1 text-gray-700"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="text-xs bg-orange-50/50 border border-orange-200 rounded-lg px-2 py-1 text-gray-700"
          />

          <button
            onClick={loadReports}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <RefreshCcw className="h-3 w-3" /> Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <RefreshCcw className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-orange-50/60 border-orange-100">
              <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">৳{revenue?.totalRevenue.toFixed(2) || '0.00'}</p>
              <p className="text-[11px] text-orange-600 mt-1">{revenue?.totalTransactions || 0} completed transactions</p>
            </div>

            <div className="card bg-blue-50/60 border-blue-100">
              <p className="text-xs text-gray-500 font-medium">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{utilization?.occupancyRatePercent || 0}%</p>
              <p className="text-[11px] text-blue-600 mt-1">Avg duration: {utilization?.avgDurationMinutes || 0} min</p>
            </div>

            <div className="card bg-emerald-50/60 border-emerald-100">
              <p className="text-xs text-gray-500 font-medium">Total Reservations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{utilization?.totalReservations || 0}</p>
              <p className="text-[11px] text-emerald-600 mt-1">{utilization?.completedReservations || 0} checked out</p>
            </div>

            <div className="card bg-purple-50/60 border-purple-100">
              <p className="text-xs text-gray-500 font-medium">Peak Hour / Day</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{peakHours?.peakHour}:00 HRS</p>
              <p className="text-[11px] text-purple-600 mt-1">Peak Day: {peakHours?.peakDay || 'N/A'}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" /> Revenue Distribution (BDT ৳)
                </h3>
              </div>

              {revenue && Object.keys(revenue.dailyRevenue).length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {Object.entries(revenue.dailyRevenue).map(([date, amount]) => {
                    const max = Math.max(...Object.values(revenue.dailyRevenue), 1);
                    const pct = (amount / max) * 100;
                    return (
                      <div key={date} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{date}</span>
                          <span className="font-semibold">৳{amount.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">No transaction revenue recorded for selected period.</p>
              )}
            </div>

            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" /> Peak Hour Activity (24-Hour)
                </h3>
              </div>

              {peakHours && (
                <div className="grid grid-cols-6 gap-1.5 pt-2">
                  {Object.entries(peakHours.hourlyDistribution).map(([hour, count]) => {
                    const max = Math.max(...Object.values(peakHours.hourlyDistribution), 1);
                    const pct = Math.max((count / max) * 100, 5);
                    return (
                      <div key={hour} className="flex flex-col items-center gap-1">
                        <div className="w-full bg-orange-50 h-20 rounded-md flex items-end p-0.5">
                          <div
                            className="w-full bg-orange-500 rounded-sm transition-all"
                            style={{ height: `${pct}%` }}
                            title={`${hour}:00 — ${count} arrivals`}
                          />
                        </div>
                        <span className="text-[9px] text-gray-400">{hour}h</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
