import { useEffect, useState, useCallback } from 'react';
import { BillingService } from './billing.service';
import type { Transaction } from '@/common/types';
import {
  Receipt,
  Clock,
  CreditCard,
  ArrowUpCircle,
  DollarSign,
  ArrowDownToLine,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

const paymentBadge: Record<string, string> = {
  PAID:     'badge-paid',
  PENDING:  'badge-pending',
  FAILED:   'badge-failed',
  REFUNDED: 'badge-refunded',
};

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDuration(min?: number) {
  if (min == null) return '—';
  const h = Math.floor(min / 60), m = min % 60;
  return h === 0 ? `${m}m` : m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtAmount(amount?: number) {
  if (amount == null || amount === 0) return '—';
  return `৳${amount.toFixed(2)}`;
}

export default function BillingPage() {
  const [txs,       setTxs]       = useState<Transaction[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const fetchTxs = useCallback(async () => {
    try {
      const data = await BillingService.getMyTransactions();
      setTxs(data ?? []);
      setError('');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTxs(); }, [fetchTxs]);

  const handleCheckOut = async (txId: number) => {
    if (!window.confirm('Confirm check-out? Your parking fee will be calculated.')) return;
    setActionMsg(null);
    setLoadingId(txId);
    try {
      await BillingService.checkOut(txId);
      setActionMsg({ type: 'ok', text: 'Checked out successfully! Fee has been calculated.' });
      fetchTxs();
    } catch (e: any) {
      setActionMsg({ type: 'err', text: e?.message ?? 'Failed to check out.' });
    } finally {
      setLoadingId(null);
    }
  };

  // Summary
  const totalPaid    = txs.filter(t => t.paymentStatus === 'PAID').reduce((s, t) => s + (t.amount ?? 0), 0);
  const pendingCount = txs.filter(t => t.paymentStatus === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-emerald-400" />
            My Billing
          </h1>
          <p className="text-sm text-white/40 mt-1">Your parking transactions and receipts.</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchTxs(); }}
          className="btn-secondary text-xs px-3 py-2 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            icon: <DollarSign className="h-4 w-4 text-emerald-400" />,
            label: 'Total Spent',
            value: `৳${totalPaid.toFixed(2)}`,
            bg: 'bg-emerald-500/8', border: 'border-emerald-500/15',
          },
          {
            icon: <Clock className="h-4 w-4 text-amber-400" />,
            label: 'Pending Check-outs',
            value: pendingCount,
            bg: 'bg-amber-500/8', border: 'border-amber-500/15',
          },
          {
            icon: <CreditCard className="h-4 w-4 text-blue-400" />,
            label: 'Total Transactions',
            value: txs.length,
            bg: 'bg-blue-500/8', border: 'border-blue-500/15',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`stat-card border ${s.border} ${s.bg}`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center">
                {s.icon}
              </div>
              <span className="text-xs text-white/45 font-medium">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {actionMsg && (
        <div className={actionMsg.type === 'ok' ? 'alert-success' : 'alert-error'}>
          {actionMsg.type === 'ok'
            ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            : <AlertCircle  className="h-4 w-4 shrink-0 mt-0.5" />}
          {actionMsg.text}
        </div>
      )}
      {error && (
        <div className="alert-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Content */}
      {txs.length === 0 ? (
        <div className="card text-center py-16 border-dashed">
          <Receipt className="h-10 w-10 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/30 mb-1">No transactions yet</p>
          <p className="text-xs text-white/20">Check in from a reservation to create a transaction.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {txs.map(t => (
              <div key={t.id} className="card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                      t.paymentStatus === 'PAID'
                        ? 'bg-emerald-500/10 border-emerald-500/15'
                        : 'bg-amber-500/10 border-amber-500/15'
                    }`}>
                      {t.paymentStatus === 'PAID'
                        ? <ArrowUpCircle className="h-4 w-4 text-emerald-400" />
                        : <ArrowDownToLine className="h-4 w-4 text-amber-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white mono">{t.slotNumber} · {t.lotName}</p>
                      <p className="text-xs text-white/35">Tx #{t.id}</p>
                    </div>
                  </div>
                  <span className={paymentBadge[t.paymentStatus] ?? 'badge-inactive'}>{t.paymentStatus}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-white/35 mb-0.5">Check In</p>
                    <p className="text-white/65">{fmtDate(t.checkInTime)}</p>
                  </div>
                  <div>
                    <p className="text-white/35 mb-0.5">Check Out</p>
                    <p className="text-white/65">{fmtDate(t.checkOutTime)}</p>
                  </div>
                  <div>
                    <p className="text-white/35 mb-0.5">Duration</p>
                    <p className="text-white/65">{fmtDuration(t.durationMinutes)}</p>
                  </div>
                  <div>
                    <p className="text-white/35 mb-0.5">Amount</p>
                    <p className="text-lg font-bold text-white">{fmtAmount(t.amount)}</p>
                  </div>
                </div>
                {t.paymentStatus === 'PENDING' && (
                  <button
                    onClick={() => handleCheckOut(t.id)}
                    disabled={loadingId === t.id}
                    className="btn-success w-full text-xs py-2"
                  >
                    {loadingId === t.id
                      ? <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                      : <><ArrowUpCircle className="h-3.5 w-3.5" /> Check Out & Pay</>}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="card hidden lg:block p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Slot</th>
                    <th>Lot</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Duration</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map(t => (
                    <tr key={t.id}>
                      <td className="text-white/30 mono text-xs">#{t.id}</td>
                      <td className="font-semibold text-white mono text-xs">{t.slotNumber}</td>
                      <td className="text-white/55 text-xs">{t.lotName}</td>
                      <td className="text-white/45 text-xs">{fmtDate(t.checkInTime)}</td>
                      <td className="text-white/45 text-xs">{fmtDate(t.checkOutTime)}</td>
                      <td className="text-white/45 text-xs">{fmtDuration(t.durationMinutes)}</td>
                      <td className="font-semibold text-white text-sm">{fmtAmount(t.amount)}</td>
                      <td><span className={paymentBadge[t.paymentStatus] ?? 'badge-inactive'}>{t.paymentStatus}</span></td>
                      <td className="text-right">
                        {t.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => handleCheckOut(t.id)}
                            disabled={loadingId === t.id}
                            className="btn-success text-xs py-1.5 px-3"
                          >
                            {loadingId === t.id
                              ? <span className="w-3 h-3 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
                              : 'Check Out'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
