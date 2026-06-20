import { useState, useEffect, FormEvent } from 'react';
import api from '@/common/api';
import type { ParkingLot } from '@/common/types';

export default function AdminLotsPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [lotName, setLotName] = useState('');
  const [location, setLocation] = useState('');
  const [totalCapacity, setTotalCapacity] = useState('');

  const fetchLots = () => {
    api.get<ParkingLot[]>('/lots')
      .then(res => setLots(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!lotName || !location || !totalCapacity) return;
    try {
      await api.post('/lots', {
        lotName, location, totalCapacity: parseInt(totalCapacity)
      });
      setLotName(''); setLocation(''); setTotalCapacity('');
      fetchLots();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await api.put(`/lots/${id}/deactivate`);
      fetchLots();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Manage Parking Lots</h1>
      
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">Add New Lot</h2>
        <form onSubmit={handleAdd} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Lot Name</label>
            <input type="text" className="input" value={lotName} onChange={e => setLotName(e.target.value)} required />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="label">Location</label>
            <input type="text" className="input" value={location} onChange={e => setLocation(e.target.value)} required />
          </div>
          <div className="w-32">
            <label className="label">Capacity</label>
            <input type="number" min="1" className="input" value={totalCapacity} onChange={e => setTotalCapacity(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary py-3">Add Lot</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="border-b border-white/10 text-white font-semibold">
            <tr>
              <th className="pb-3 px-4">ID</th>
              <th className="pb-3 px-4">Name</th>
              <th className="pb-3 px-4">Location</th>
              <th className="pb-3 px-4">Capacity</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lots.map(lot => (
              <tr key={lot.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4">{lot.id}</td>
                <td className="py-3 px-4 font-medium text-white">{lot.lotName}</td>
                <td className="py-3 px-4">{lot.location}</td>
                <td className="py-3 px-4">{lot.totalCapacity}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${lot.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {lot.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {lot.status === 'ACTIVE' && (
                    <button onClick={() => handleDeactivate(lot.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
            {lots.length === 0 && (
              <tr><td colSpan={6} className="py-4 text-center opacity-50">No lots found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
