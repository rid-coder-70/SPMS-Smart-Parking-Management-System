import { useEffect, useState } from 'react';
import api from '@/common/api';
import type { Transaction } from '@/common/types';
import { Receipt, Clock, CreditCard, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await api.get<Transaction[]>('/billing/my');
      setTransactions(res.data || []);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCheckOut = async (transactionId: number) => {
    if (!window.confirm('Confirm check-out? Your parking fee will be calculated.')) return;
    setActionMsg(null);
    try {
      await api.post(`/billing/check-out/${transactionId}`);
      setActionMsg({ type: 'ok', text: 'Checked out successfully! Fee has been calculated.' });
      fetchTransactions();
    } catch (err: any) {
      setActionMsg({ type: 'err', text: err?.message || 'Failed to check out' });
    }
  };

  const getPaymentBadge = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'badge-paid', PENDING: 'badge-pending',
      FAILED: 'badge-failed', REFUNDED: 'badge-refunded',
    };
    return map[status] || 'badge-inactive';
  };

  const formatDate = (iso: string | undefined) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number | undefined) => {
    if (minutes == null) return '—';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const formatAmount = (amount: number | undefined) => {
    if (amount == null || amount === 0) return '—';
    return `৳${amount.toFixed(2)}`;
  };

  // Summary stats
  const totalPaid = transactions
    .filter(t => t.paymentStatus === 'PAID')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingCount = transactions.filter(t => t.paymentStatus === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Receipt className="h-8 w-8 text-emerald-400" />
          My Billing
        </h1>
        <p className="text-white/50 mt-1">View your parking transactions and receipts.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm text-white/50">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-white">৳{totalPaid.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-400" />
            </div>
            <span className="text-sm text-white/50">Pending Check-outs</span>
          </div>
          <p className="text-2xl font-bold text-white">{pendingCount}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-400" />
            </div>
            <span className="text-sm text-white/50">Total Transactions</span>
          </div>
          <p className="text-2xl font-bold text-white">{transactions.length}</p>
        </div>
      </div>

      {/* Action messages */}
      {actionMsg && (
        <div className={actionMsg.type === 'ok' ? 'alert-success' : 'alert-error'}>
          {actionMsg.text}
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      {transactions.length === 0 ? (
        <div className="card text-center py-16">
          <Receipt className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg mb-2">No transactions yet</p>
          <p className="text-white/30 text-sm">Check in from your reservations to create a transaction.</p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-4 lg:hidden">
            {transactions.map((t) => (
              <div key={t.id} className="card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                      ${t.paymentStatus === 'PAID' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                      {t.paymentStatus === 'PAID'
                        ? <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
                        : <ArrowDownCircle className="h-5 w-5 text-yellow-400" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t.slotNumber} · {t.lotName}</p>
                      <p className="text-xs text-white/40">Transaction #{t.id}</p>
                    </div>
                  </div>
                  <span className={getPaymentBadge(t.paymentStatus)}>{t.paymentStatus}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/40 text-xs">Check In</p>
                    <p className="text-white/70">{formatDate(t.checkInTime)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Check Out</p>
                    <p className="text-white/70">{formatDate(t.checkOutTime)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Duration</p>
                    <p className="text-white/70">{formatDuration(t.durationMinutes)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Amount</p>
                    <p className="text-xl font-bold text-white">{formatAmount(t.amount)}</p>
                  </div>
                </div>

                {t.paymentStatus === 'PENDING' && (
                  <button
                    onClick={() => handleCheckOut(t.id)}
                    className="btn-success w-full"
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Check Out & Pay
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="card hidden lg:block overflow-hidden p-0">
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
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="text-white/40 text-sm">#{t.id}</td>
                      <td className="font-semibold text-white">{t.slotNumber}</td>
                      <td className="text-white/60">{t.lotName}</td>
                      <td className="text-white/60 text-sm">{formatDate(t.checkInTime)}</td>
                      <td className="text-white/60 text-sm">{formatDate(t.checkOutTime)}</td>
                      <td className="text-white/60 text-sm">{formatDuration(t.durationMinutes)}</td>
                      <td className="font-semibold text-white">{formatAmount(t.amount)}</td>
                      <td><span className={getPaymentBadge(t.paymentStatus)}>{t.paymentStatus}</span></td>
                      <td className="text-right">
                        {t.paymentStatus === 'PENDING' && (
                          <button
                            onClick={() => handleCheckOut(t.id)}
                            className="btn-success text-xs py-1.5 px-3"
                          >
                            Check Out
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
