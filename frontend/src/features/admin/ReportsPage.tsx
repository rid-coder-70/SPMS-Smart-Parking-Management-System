import { useState, useEffect } from 'react';
import api from '@/common/api';
import { LotSelector } from '@/features/parking/LotSelector';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ReportsPage() {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 30 days ago
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [lotId, setLotId] = useState<number | undefined>();
  const [granularity, setGranularity] = useState('daily');
  
  const [utilization, setUtilization] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fromIso = `${from}T00:00:00`;
        const toIso = `${to}T23:59:59`;
        
        const utilRes = await api.get(`/admin/reports/utilization?from=${fromIso}&to=${toIso}${lotId ? `&lotId=${lotId}` : ''}`);
        setUtilization(utilRes.data);
        
        const revRes = await api.get(`/admin/reports/revenue?from=${fromIso}&to=${toIso}&granularity=${granularity}`);
        setRevenue(revRes.data);
        
        const peakRes = await api.get(`/admin/reports/peak-hours${lotId ? `?lotId=${lotId}` : ''}`);
        // Transform peakRes for chart
        const formattedPeak = peakRes.data.map((d: any) => ({
          name: `${d.dayOfWeek.slice(0, 3)} ${d.hourOfDay}:00`,
          count: d.reservationCount
        })).slice(0, 10); // top 10
        setPeakHours(formattedPeak);

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [from, to, lotId, granularity]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Reporting & Analytics</h1>
      
      <div className="card flex flex-wrap gap-4 items-end">
        <div>
          <label className="label text-xs">From Date</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label text-xs">To Date</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label text-xs">Filter by Lot (Optional)</label>
          <LotSelector value={lotId} onChange={setLotId} className="w-48" />
        </div>
        <div>
          <button className="btn-secondary" onClick={() => setLotId(undefined)}>Clear Lot</button>
        </div>
      </div>

      {utilization && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-white/60 text-sm font-semibold mb-2">Total Reservations</h3>
            <p className="text-3xl font-black text-white">{utilization.totalReservations}</p>
          </div>
          <div className="card">
            <h3 className="text-white/60 text-sm font-semibold mb-2">Avg Duration (Mins)</h3>
            <p className="text-3xl font-black text-white">{Math.round(utilization.averageDurationMinutes)}</p>
          </div>
          <div className="card">
            <h3 className="text-white/60 text-sm font-semibold mb-2">Estimated Occupancy</h3>
            <p className="text-3xl font-black text-white">{utilization.occupancyRatePercent}%</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Revenue Report</h2>
            <select className="input w-32 py-1" value={granularity} onChange={e => setGranularity(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="period" stroke="#ffffff80" fontSize={12} />
                <YAxis stroke="#ffffff80" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="totalRevenue" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-white mb-6">Peak Hours (Top 10)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#ffffff80" fontSize={12} />
                <YAxis stroke="#ffffff80" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
