import React, { useEffect, useState } from 'react';
import { ParkingService } from './parking.service';
import type { ParkingLot } from '../../common/types';
import {
  ParkingCircle,
  Plus,
  Trash2,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const AdminLotsPage: React.FC = () => {
  const [lots,     setLots]     = useState<ParkingLot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [lotName,  setLotName]  = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [adding,   setAdding]   = useState(false);
  const [addError, setAddError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLots = async () => {
    setLoading(true);
    try {
      const data = await ParkingService.getAllLots();
      setLots(data);
      setError('');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch lots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLots(); }, []);

  const handleAddLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotName || !location || !capacity) return;
    setAdding(true);
    setAddError('');
    setSuccessMsg('');
    try {
      await ParkingService.createLot({ lotName, location, totalCapacity: Number(capacity) });
      setLotName(''); setLocation(''); setCapacity('');
      setSuccessMsg('Parking lot added successfully!');
      fetchLots();
    } catch (e: any) {
      setAddError(e?.message ?? 'Failed to add lot');
    } finally {
      setAdding(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Deactivate this parking lot?')) return;
    try {
      await ParkingService.deactivateLot(id);
      setSuccessMsg('Lot deactivated successfully.');
      fetchLots();
    } catch (e: any) {
      alert(e?.message ?? 'Failed to deactivate lot');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ParkingCircle className="h-6 w-6 text-orange-500" />
            Manage Parking Lots
          </h1>
          <p className="text-sm text-gray-500 mt-1">Add new lots or deactivate existing ones.</p>
        </div>
        <button onClick={fetchLots} className="btn-secondary text-xs px-3 py-2 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="card">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Lot
        </h2>

        {addError && (
          <div className="alert-error mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" /> {addError}
          </div>
        )}
        {successMsg && (
          <div className="alert-success mb-4">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleAddLot} className="grid sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="label">Lot Name</label>
            <input
              type="text" required className="input"
              value={lotName} onChange={e => setLotName(e.target.value)}
              placeholder="e.g. Main Lot A"
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text" required className="input"
              value={location} onChange={e => setLocation(e.target.value)}
              placeholder="e.g. North Wing"
            />
          </div>
          <div>
            <label className="label">Capacity</label>
            <input
              type="number" required min="1" className="input"
              value={capacity}
              onChange={e => setCapacity(e.target.value ? Number(e.target.value) : '')}
              placeholder="100"
            />
          </div>
          <div>
            <button type="submit" disabled={adding} className="btn-primary w-full gap-2">
              {adding
                ? <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                : <Plus className="h-4 w-4" />}
              {adding ? 'Adding…' : 'Add Lot'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm">{error}</div>
        ) : lots.length === 0 ? (
          <div className="p-12 text-center">
            <ParkingCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No active parking lots found.</p>
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
                    <td className="text-gray-400 mono text-xs">#{lot.id}</td>
                    <td className="font-semibold text-gray-800">{lot.lotName}</td>
                    <td className="text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" /> {lot.location}
                      </span>
                    </td>
                    <td className="text-gray-600 font-medium">{lot.totalCapacity}</td>
                    <td>
                      <span className="badge-active">{lot.status}</span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDeactivate(lot.id)}
                        className="btn-danger text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                      >
                        <Trash2 className="h-3 w-3" /> Deactivate
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
