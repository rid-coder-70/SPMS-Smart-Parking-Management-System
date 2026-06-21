import React, { useEffect, useState } from 'react';
import api from '../../common/api';
import { ParkingLot } from '../../common/types';
import { ParkingCircle, Plus, Trash2 } from 'lucide-react';

export const AdminLotsPage: React.FC = () => {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [lotName, setLotName] = useState('');
  const [location, setLocation] = useState('');
  const [totalCapacity, setTotalCapacity] = useState<number | ''>('');
  
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
    setSuccessMsg('');
    try {
      await api.post('/lots', {
        lotName,
        location,
        totalCapacity: Number(totalCapacity)
      });
      setLotName('');
      setLocation('');
      setTotalCapacity('');
      setSuccessMsg('Parking lot added successfully!');
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
      await api.put(`/lots/${id}/deactivate`);
      setSuccessMsg('Lot deactivated successfully.');
      fetchLots();
    } catch (err: any) {
      alert(err?.message || 'Failed to deactivate lot');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ParkingCircle className="h-8 w-8 text-brand-400" />
          Manage Parking Lots
        </h1>
        <p className="text-white/50 mt-1">Add new lots or deactivate existing ones.</p>
      </div>

      {/* Add Lot Form */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-5 pb-4 border-b border-night-700">Add New Lot</h2>
        {addError && <div className="alert-error mb-4">{addError}</div>}
        {successMsg && <div className="alert-success mb-4">{successMsg}</div>}
        
        <form onSubmit={handleAddLot} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
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
          <div className="flex-1 min-w-[200px]">
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
          <div className="w-36">
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
          <button 
            type="submit" 
            disabled={adding}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            {adding ? 'Adding...' : 'Add Lot'}
          </button>
        </form>
      </div>

      {/* Lots Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400 font-medium">{error}</div>
        ) : lots.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <ParkingCircle className="h-10 w-10 mx-auto mb-3 text-white/20" />
            <p>No active parking lots found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lot Name</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lots.map(lot => (
                  <tr key={lot.id} className="group">
                    <td className="text-white/40 text-sm">#{lot.id}</td>
                    <td className="font-semibold text-white">{lot.lotName}</td>
                    <td className="text-white/60">{lot.location}</td>
                    <td className="text-white/60 font-medium">{lot.totalCapacity}</td>
                    <td>
                      <span className="badge-active">{lot.status}</span>
                    </td>
                    <td className="text-right">
                      <button 
                        onClick={() => handleDeactivate(lot.id)}
                        className="btn-danger text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3 mr-1.5" />
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
