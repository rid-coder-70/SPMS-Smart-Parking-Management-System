import { useState, useEffect } from 'react';
import api from '@/common/api';
import type { Transaction } from '@/common/types';
import { ReceiptView } from './ReceiptView';

export default function BillingHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    api.get<Transaction[]>('/users/me/transactions')
      .then(res => setTransactions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white print:hidden">Billing History</h1>

      {selectedTx ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedTx(null)} className="text-brand-400 hover:text-white text-sm font-semibold print:hidden mb-4">
            &larr; Back to History
          </button>
          <ReceiptView transaction={selectedTx} />
        </div>
      ) : (
        <div className="card overflow-x-auto print:hidden">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="border-b border-white/10 text-white font-semibold">
              <tr>
                <th className="pb-3 px-4">Date</th>
                <th className="pb-3 px-4">Duration</th>
                <th className="pb-3 px-4">Total Fee</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4">{new Date(tx.checkOutTime).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{Math.floor(tx.durationMinutes / 60)}h {tx.durationMinutes % 60}m</td>
                  <td className="py-3 px-4 font-bold text-white">${tx.totalFee.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                      {tx.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => setSelectedTx(tx)} className="text-brand-400 hover:text-brand-300 text-xs font-semibold">
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center opacity-50">No billing history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
