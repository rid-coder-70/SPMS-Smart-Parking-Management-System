import React, { useEffect, useState } from 'react';
import api from '../../common/api';
import { ParkingLot } from '../../common/types';

export const AdminLotsPage: React.FC = () => {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [lotName, setLotName] = useState('');
  const [location, setLocation] = useState('');
  const [totalCapacity, setTotalCapacity] = useState<number | ''>('');
  
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchLots = async () => {
    try {
      const response = await api.get<ParkingLot[]>('/lots');
      setLots(response.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleAddLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotName || !location || !totalCapacity) return;
    
    setAdding(true);
    setAddError('');
    try {
      await api.post('/lots', {
        lotName,
        location,
        totalCapacity: Number(totalCapacity)
      });
      setLotName('');
      setLocation('');
      setTotalCapacity('');
      fetchLots(); // Refresh list after adding
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add lot');
    } finally {
      setAdding(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this parking lot?')) return;
    
    try {
      await api.put(`/lots/${id}/deactivate`);
      fetchLots(); // Refresh list
    } catch (err: any) {
      alert(err?.message || 'Failed to deactivate lot');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Parking Lots</h1>
          <p className="text-gray-500 mt-1">Add new lots or deactivate existing ones.</p>
        </div>
      </div>

      {/* Add Lot Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 transition-shadow hover:shadow-md">
        <h2 className="text-lg font-semibold mb-5 text-gray-800">Add New Lot</h2>
        {addError && <div className="mb-5 text-sm text-red-600 bg-red-50/80 border border-red-100 p-3 rounded-lg">{addError}</div>}
        
        <form onSubmit={handleAddLot} className="flex flex-wrap gap-5 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lot Name</label>
            <input 
              type="text" 
              required
              value={lotName}
              onChange={(e) => setLotName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all bg-gray-50/50 hover:bg-white"
              placeholder="e.g. Main Lot A"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input 
              type="text" 
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all bg-gray-50/50 hover:bg-white"
              placeholder="e.g. North Wing"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity</label>
            <input 
              type="number" 
              required
              min="1"
              value={totalCapacity}
              onChange={(e) => setTotalCapacity(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all bg-gray-50/50 hover:bg-white"
              placeholder="100"
            />
          </div>
          <button 
            type="submit" 
            disabled={adding}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-sm hover:bg-blue-700 hover:shadow disabled:opacity-50 transition-all"
          >
            {adding ? 'Adding...' : 'Add Lot'}
          </button>
        </form>
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse font-medium">Loading lots...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-medium">{error}</div>
        ) : lots.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">No active parking lots found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest font-semibold">
                  <th className="p-5">ID</th>
                  <th className="p-5">Lot Name</th>
                  <th className="p-5">Location</th>
                  <th className="p-5">Capacity</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lots.map(lot => (
                  <tr key={lot.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-5 text-gray-500 text-sm">#{lot.id}</td>
                    <td className="p-5 font-semibold text-gray-800">{lot.lotName}</td>
                    <td className="p-5 text-gray-600">{lot.location}</td>
                    <td className="p-5 text-gray-600 font-medium">{lot.totalCapacity}</td>
                    <td className="p-5">
                      <span className="inline-flex px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full shadow-sm">
                        {lot.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => handleDeactivate(lot.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all focus:opacity-100"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
