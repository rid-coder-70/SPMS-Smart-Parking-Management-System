import api from '@/common/api';
import type { 
  Reservation, 
  CreateReservationPayload, 
  CancelResponse, 
  CheckOutResponse 
} from '@/common/types';

export const ReservationService = {
  create: (payload: CreateReservationPayload) => api.post<Reservation>('/reservations', payload).then(res => res.data),
  getMyReservations: () => api.get<Reservation[]>('/reservations/me').then(res => res.data),
  getById: (id: number) => api.get<Reservation>(`/reservations/${id}`).then(res => res.data),
  cancel: (id: number) => api.put<CancelResponse>(`/reservations/${id}/cancel`).then(res => res.data),
  checkIn: (id: number) => api.put<Reservation>(`/reservations/${id}/check-in`).then(res => res.data),
  checkOut: (id: number) => api.put<CheckOutResponse>(`/reservations/${id}/check-out`).then(res => res.data),
};
