import React, { useEffect, useState } from 'react';
import api from '../../common/api';
import { ParkingLot } from '../../common/types';
import { ParkingCircle, Plus, Trash2 } from 'lucide-react';
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
  const [successMsg, setSuccessMsg] = useState('');

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
    setSuccessMsg('');
    try {
      await ParkingService.createLot({
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
      await ParkingService.deleteLot(id);
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
          <div className="flex-1 min-w-[200px]">
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
          <div className="w-36">
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
          <button 
            type="submit" 
            disabled={adding}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            {adding ? 'Adding...' : 'Add Lot'}
          </button>
          <div className="sm:col-span-1">
            <button type="submit" disabled={adding} className="btn-primary w-full">
              {adding ? 'Adding...' : 'Add Lot'}
            </button>
          </div>
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
