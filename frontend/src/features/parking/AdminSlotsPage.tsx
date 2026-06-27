import React, { useEffect, useState } from 'react';
import { ParkingService } from './parking.service';
import type { ParkingSlot, VehicleType } from '../../common/types';
import { LotSelector } from './LotSelector';
import { LayoutGrid, Plus, Wrench, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'STANDARD',   label: 'Standard Car' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'LARGE',      label: 'Large Vehicle (SUV / Van)' },
];

const slotStatusBadge: Record<string, string> = {
  AVAILABLE:      'badge-active',
  RESERVED:       'badge-pending',
  OCCUPIED:       'badge-cancelled',
  OUT_OF_SERVICE: 'badge-inactive',
};

export const AdminSlotsPage: React.FC = () => {
  const [selectedLotId, setSelectedLotId] = useState<number | undefined>();
  const [slots,         setSlots]         = useState<ParkingSlot[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [bulkCount,    setBulkCount]    = useState<number | ''>('');
  const [bulkPrefix,   setBulkPrefix]   = useState('A-');
  const [bulkSlotType, setBulkSlotType] = useState<VehicleType | ''>('');
  const [adding,        setAdding]        = useState(false);
  const [addError,      setAddError]      = useState('');
  const [successMsg,    setSuccessMsg]    = useState('');

  const fetchSlots = async (lotId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await ParkingService.getSlotsByLot(lotId);
      setSlots(data);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLotId) fetchSlots(selectedLotId);
    else setSlots([]);
  }, [selectedLotId]);

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLotId || !bulkCount || !bulkSlotType) return;
    setAdding(true); setAddError(''); setSuccessMsg('');
    try {
      await ParkingService.bulkAddSlots(selectedLotId, { 
        count: Number(bulkCount), 
        prefix: bulkPrefix, 
        slotType: bulkSlotType as VehicleType 
      });
      setBulkCount(''); 
      setSuccessMsg(`${bulkCount} slots added successfully!`);
      fetchSlots(selectedLotId);
    } catch (e: any) {
      setAddError(e?.message ?? 'Failed to generate slots');
    } finally {
      setAdding(false);
    }
  };

  const handleMarkOutOfService = async (id: number) => {
    if (!window.confirm('Mark this slot as out of service?')) return;
    try {
      await ParkingService.markOutOfService(id);
      setSuccessMsg('Slot marked as out of service.');
      if (selectedLotId) fetchSlots(selectedLotId);
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update slot status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <LayoutGrid className="h-6 w-6 text-yellow-600" />
            Manage Parking Slots
          </h1>
          <p className="text-sm text-gray-500 mt-1">Select a lot to view and manage its slots.</p>
        </div>
        {selectedLotId && (
          <button
            onClick={() => fetchSlots(selectedLotId)}
            className="btn-secondary text-xs px-3 py-2 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        )}
      </div>
      <div className="card">
        <label className="label">Select Parking Lot</label>
        <LotSelector
          value={selectedLotId}
          onChange={setSelectedLotId}
          className="w-full max-w-md"
        />
      </div>

      {selectedLotId && (
        <>
          {/* Add Slot Form */}
          <div className="card">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Bulk Generate Slots
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

            <form onSubmit={handleBulkAdd} className="grid sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="label">Prefix (Optional)</label>
                <input
                  type="text" className="input"
                  value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value)}
                  placeholder="e.g. A-"
                />
              </div>
              <div>
                <label className="label">Count</label>
                <input
                  type="number" required min="1" className="input"
                  value={bulkCount} onChange={e => setBulkCount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <label className="label">Vehicle Type</label>
                <select
                  required className="input"
                  value={bulkSlotType}
                  onChange={e => setBulkSlotType(e.target.value as VehicleType)}
                >
                  <option value="" disabled>Select type…</option>
                  {VEHICLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <button type="submit" disabled={adding} className="btn-primary w-full gap-2">
                  {adding
                    ? <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    : <Plus className="h-4 w-4" />}
                  {adding ? 'Generating…' : 'Generate Slots'}
                </button>
              </div>
            </form>
          </div>

          {/* Slots Table */}
          <div className="card p-0 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="spinner" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 text-sm">{error}</div>
            ) : slots.length === 0 ? (
              <div className="p-12 text-center">
                <LayoutGrid className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No slots in this lot. Add one above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-dark">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Slot Number</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map(slot => (
                      <tr key={slot.id} className="group">
                        <td className="text-gray-400 mono text-xs">#{slot.id}</td>
                        <td className="font-semibold text-gray-800 mono text-xs">{slot.slotNumber}</td>
                        <td className="text-gray-600 text-xs">{slot.slotType}</td>
                        <td>
                          <span className={slotStatusBadge[slot.status] ?? 'badge-inactive'}>
                            {slot.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="text-right">
                          {slot.status !== 'OUT_OF_SERVICE' && (
                            <button
                              onClick={() => handleMarkOutOfService(slot.id)}
                              className="btn-danger text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity gap-1.5"
                            >
                              <Wrench className="h-3 w-3" /> Out of Service
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedLotId && (
        <div className="card text-center py-16 border-dashed">
          <LayoutGrid className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Select a parking lot above to view its slots</p>
        </div>
      )}
    </div>
  );
};
