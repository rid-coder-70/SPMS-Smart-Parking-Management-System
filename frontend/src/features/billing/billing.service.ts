import api from '@/common/api';
import type { Transaction } from '@/common/types';

/**
 * BillingService — wraps all /billing endpoints.
 *
 * Backend routes (context-path: /api/v1):
 *   POST /billing/check-in/{reservationId}  → check in (creates transaction)
 *   POST /billing/check-out/{transactionId} → check out + compute fee
 *   GET  /billing/transactions/{id}         → get single receipt
 *   GET  /billing/my                        → list my transactions
 */
export const BillingService = {
  checkIn: (reservationId: number) =>
    api.post<Transaction>(`/billing/check-in/${reservationId}`).then(res => res.data),

  checkOut: (transactionId: number) =>
    api.post<Transaction>(`/billing/check-out/${transactionId}`).then(res => res.data),

  getTransaction: (id: number) =>
    api.get<Transaction>(`/billing/transactions/${id}`).then(res => res.data),

  getMyTransactions: () =>
    api.get<Transaction[]>('/billing/my').then(res => res.data),
};
