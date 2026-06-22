import api from '@/common/api';
import type {
  Reservation,
  CreateReservationPayload,
  CancelResponse,
  CheckOutResponse,
} from '@/common/types';

/**
 * ReservationService — wraps all /reservations endpoints.
 *
 * Backend routes (context-path: /api/v1):
 *   POST   /reservations          → create reservation (authenticated)
 *   GET    /reservations/me       → list my reservations
 *   GET    /reservations/{id}     → get single reservation
 *   PUT    /reservations/{id}/cancel    → cancel reservation
 *   PUT    /reservations/{id}/check-in  → check in
 *   PUT    /reservations/{id}/check-out → check out (returns CheckOutResponse)
 *   DELETE /reservations/{id}           → cancel own reservation
 *   DELETE /reservations/{id}/admin     → admin cancel (ADMIN only)
 */
export const ReservationService = {
  create: (payload: CreateReservationPayload) =>
    api.post<Reservation>('/reservations', payload).then(res => res.data),

  getMyReservations: () =>
    api.get<Reservation[]>('/reservations/me').then(res => res.data),

  getById: (id: number) =>
    api.get<Reservation>(`/reservations/${id}`).then(res => res.data),

  cancel: (id: number) =>
    api.put<CancelResponse>(`/reservations/${id}/cancel`).then(res => res.data),

  cancelDelete: (id: number) =>
    api.delete<Reservation>(`/reservations/${id}`).then(res => res.data),

  checkIn: (id: number) =>
    api.put<Reservation>(`/reservations/${id}/check-in`).then(res => res.data),

  checkOut: (id: number) =>
    api.put<CheckOutResponse>(`/reservations/${id}/check-out`).then(res => res.data),

  adminCancel: (id: number) =>
    api.delete<Reservation>(`/reservations/${id}/admin`).then(res => res.data),
};
