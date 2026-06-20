import { useState, useEffect } from 'react';
import api from '@/common/api';

export default function PricingConfigPage() {
  const [config, setConfig] = useState({
    baseRate: 2.00,
    extendedRate: 1.50,
    dailyCap: 15.00,
    motorcycleMultiplier: 0.5,
    largeMultiplier: 1.5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/pricing')
      .then(res => setConfig(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: any) => {
    setConfig({ ...config, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/admin/pricing', config);
      setMessage('Configuration saved successfully!');
    } catch (err: any) {
      setMessage('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Pricing Configuration</h1>
      
      {message && (
        <div className={`p-4 rounded-lg font-bold ${message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="card space-y-6">
        <div>
          <label className="label">Base Rate ($ per hour for first 3 hours)</label>
          <input type="number" step="0.01" name="baseRate" value={config.baseRate} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Extended Rate ($ per hour after 3 hours)</label>
          <input type="number" step="0.01" name="extendedRate" value={config.extendedRate} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Daily Cap ($ max per 24 hours)</label>
          <input type="number" step="0.01" name="dailyCap" value={config.dailyCap} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Motorcycle Multiplier</label>
          <input type="number" step="0.01" name="motorcycleMultiplier" value={config.motorcycleMultiplier} onChange={handleChange} className="input" required />
        </div>
        <div>
          <label className="label">Large Vehicle Multiplier</label>
          <input type="number" step="0.01" name="largeMultiplier" value={config.largeMultiplier} onChange={handleChange} className="input" required />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}
