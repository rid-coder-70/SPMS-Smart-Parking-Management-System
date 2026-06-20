import React, { useEffect, useState } from 'react';
import { ParkingService } from './parking.service';
import type { ParkingLot } from '../../common/types';
import { PlusCircle, Trash2, MapPin, Hash, AlertCircle, RefreshCw } from 'lucide-react';

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
    setLoading(true);
    try {
      const data = await ParkingService.getAllLots();
      setLots(data);
      setError('');
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
      await ParkingService.createLot({
        lotName,
        location,
        totalCapacity: Number(totalCapacity)
      });
      setLotName('');
      setLocation('');
      setTotalCapacity('');
      fetchLots();
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add lot');
    } finally {
      setAdding(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this parking lot?')) return;
    try {
      await ParkingService.deleteLot(id);
      fetchLots();
    } catch (err: any) {
      alert(err?.message || 'Failed to deactivate lot');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Parking Lots</h1>
          <p className="text-white/50 text-sm mt-1">Add new lots or deactivate existing ones.</p>
        </div>
        <button onClick={fetchLots} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Add Lot Form */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-brand-400" /> Add New Lot
        </h2>
        
        {addError && (
          <div className="alert-error mb-5">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p>{addError}</p>
          </div>
        )}
        
        <form onSubmit={handleAddLot} className="grid sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-1">
            <label className="label">Lot Name</label>
            <input 
              type="text" 
              required
              value={lotName}
              onChange={(e) => setLotName(e.target.value)}
              className="input"
              placeholder="e.g. Main Lot A"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="label">Location</label>
            <input 
              type="text" 
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
              placeholder="e.g. North Wing"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="label">Capacity</label>
            <input 
              type="number" 
              required
              min="1"
              value={totalCapacity}
              onChange={(e) => setTotalCapacity(e.target.value ? Number(e.target.value) : '')}
              className="input"
              placeholder="100"
            />
          </div>
          <div className="sm:col-span-1">
            <button type="submit" disabled={adding} className="btn-primary w-full">
              {adding ? 'Adding...' : 'Add Lot'}
            </button>
          </div>
        </form>
      </div>

      {/* Lots Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-brand-400 animate-spin mb-4" />
            <p className="text-white/50 text-sm">Loading lots...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : lots.length === 0 ? (
          <div className="p-12 text-center text-white/50">No active parking lots found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-night-900 border-b border-night-700 text-white/50 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Lot Name</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Capacity</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-700">
                {lots.map(lot => (
                  <tr key={lot.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-white/50 text-sm font-mono">#{lot.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{lot.lotName}</td>
                    <td className="px-6 py-4 text-white/70 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-white/40" /> {lot.location}
                    </td>
                    <td className="px-6 py-4 text-white/70 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Hash className="h-4 w-4 text-brand-400" /> {lot.totalCapacity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-active">{lot.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeactivate(lot.id)}
                        className="text-sm font-medium text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 ml-auto"
                      >
                        <Trash2 className="h-4 w-4" /> Deactivate
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
