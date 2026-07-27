import { useEffect, useState } from "react";
import { BillingService } from "@/features/billing/billing.service";
import { DollarSign, Save, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
export default function AdminPricingPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const fetchPricing = async () => {
    setLoading(true);
    try {
      const data = await BillingService.getPricing();
      setConfig(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to fetch pricing config" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPricing();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await BillingService.updatePricing(config);
      setConfig(updated);
      setMessage({ type: "success", text: "Pricing parameters updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update pricing" });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className="flex justify-center py-20"><RotateCcw className="h-8 w-8 text-orange-500 animate-spin" /></div>;
  }
  return <div className="max-w-3xl mx-auto space-y-6 animate-fade-in"><div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5"><DollarSign className="h-6 w-6 text-orange-500" /> Dynamic Pricing Configuration (BDT ৳)
        </h1><p className="text-sm text-gray-500 mt-1">Configure hourly rates, vehicle multipliers, and daily caps in Bangladeshi Taka (৳).</p></div>{message && <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>{message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}<span>{message.text}</span></div>}{config && <form onSubmit={handleSubmit} className="card space-y-6 shadow-sm border-orange-100"><div className="grid sm:grid-cols-2 gap-4"><div><label className="label-text">Base Hourly Rate (৳)</label><input
    type="number"
    step="0.50"
    min="1"
    required
    value={config.baseHourlyRate}
    onChange={(e) => setConfig({ ...config, baseHourlyRate: parseFloat(e.target.value) || 0 })}
    className="input-field"
  /><p className="text-[11px] text-gray-400 mt-1">First {config.baseHoursThreshold} hours rate per hour</p></div><div><label className="label-text">Extended Hourly Rate (৳)</label><input
    type="number"
    step="0.50"
    min="1"
    required
    value={config.extendedHourlyRate}
    onChange={(e) => setConfig({ ...config, extendedHourlyRate: parseFloat(e.target.value) || 0 })}
    className="input-field"
  /><p className="text-[11px] text-gray-400 mt-1">Rate per hour after {config.baseHoursThreshold} hours</p></div><div><label className="label-text">Base Hours Threshold</label><input
    type="number"
    min="1"
    required
    value={config.baseHoursThreshold}
    onChange={(e) => setConfig({ ...config, baseHoursThreshold: parseInt(e.target.value) || 1 })}
    className="input-field"
  /><p className="text-[11px] text-gray-400 mt-1">Hours window before extended rate applies</p></div><div><label className="label-text">Daily Maximum Cap (৳)</label><input
    type="number"
    step="1.00"
    min="1"
    required
    value={config.dailyMaxCap}
    onChange={(e) => setConfig({ ...config, dailyMaxCap: parseFloat(e.target.value) || 0 })}
    className="input-field"
  /><p className="text-[11px] text-gray-400 mt-1">Maximum charge per 24-hour period</p></div></div><div className="border-t border-orange-100 pt-5"><h3 className="text-sm font-bold text-gray-800 mb-3">Vehicle Type Multipliers</h3><div className="grid sm:grid-cols-3 gap-4"><div><label className="label-text">Motorcycle (Multiplier)</label><input
    type="number"
    step="0.05"
    min="0.1"
    required
    value={config.motorcycleMultiplier}
    onChange={(e) => setConfig({ ...config, motorcycleMultiplier: parseFloat(e.target.value) || 0.5 })}
    className="input-field"
  /><p className="text-[11px] text-gray-400 mt-1">{config.motorcycleMultiplier * 100}% of standard rate</p></div><div><label className="label-text">Standard Vehicle</label><input
    type="number"
    step="0.05"
    min="0.1"
    required
    value={config.standardMultiplier}
    onChange={(e) => setConfig({ ...config, standardMultiplier: parseFloat(e.target.value) || 1 })}
    className="input-field"
  /><p className="text-[11px] text-gray-400 mt-1">{config.standardMultiplier * 100}% baseline rate</p></div><div><label className="label-text">Large Vehicle (SUV / Van)</label><input
    type="number"
    step="0.05"
    min="0.1"
    required
    value={config.largeMultiplier}
    onChange={(e) => setConfig({ ...config, largeMultiplier: parseFloat(e.target.value) || 1.5 })}
    className="input-field"
  /><p className="text-[11px] text-gray-400 mt-1">{config.largeMultiplier * 100}% rate multiplier</p></div></div></div><div className="flex justify-end gap-3 pt-4 border-t border-gray-100"><button
    type="button"
    onClick={fetchPricing}
    className="btn-secondary text-sm"
  >
              Reset
            </button><button
    type="submit"
    disabled={saving}
    className="btn-primary text-sm gap-2"
  ><Save className="h-4 w-4" />{saving ? "Saving..." : "Save Pricing Parameters"}</button></div></form>}</div>;
}
