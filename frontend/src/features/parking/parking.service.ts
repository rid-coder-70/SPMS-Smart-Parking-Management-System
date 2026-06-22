import api from '@/common/api';
import type {
  ParkingLot,
  ParkingSlot,
  CreateParkingLotPayload,
  UpdateParkingLotPayload,
  CreateParkingSlotPayload,
} from '@/common/types';

/**
 * ParkingService — wraps all /lots and /slots endpoints.
 *
 * Backend routes (context-path: /api/v1):
 *   GET    /lots                      → listActiveLots (public)
 *   POST   /lots                      → createLot (ADMIN)
 *   PUT    /lots/{id}                 → updateLot (ADMIN)
 *   PUT    /lots/{id}/deactivate      → deactivateLot (ADMIN)
 *   GET    /lots/{lotId}/slots        → getSlotsByLot (authenticated)
 *   POST   /lots/{lotId}/slots        → addSlot (ADMIN)
 *   PUT    /slots/{id}/out-of-service → markOutOfService (ADMIN)
 */
export const ParkingService = {
  // ── Lots ──────────────────────────────────────────────────
  getAllLots: () =>
    api.get<ParkingLot[]>('/lots').then(res => res.data),

  createLot: (payload: CreateParkingLotPayload) =>
    api.post<ParkingLot>('/lots', payload).then(res => res.data),

  updateLot: (id: number, payload: UpdateParkingLotPayload) =>
    api.put<ParkingLot>(`/lots/${id}`, payload).then(res => res.data),

  deactivateLot: (id: number) =>
    api.put(`/lots/${id}/deactivate`).then(res => res.data),

  // ── Slots ─────────────────────────────────────────────────
  getSlotsByLot: (lotId: number) =>
    api.get<ParkingSlot[]>(`/lots/${lotId}/slots`).then(res => res.data),

  addSlot: (lotId: number, payload: CreateParkingSlotPayload) =>
    api.post<ParkingSlot>(`/lots/${lotId}/slots`, payload).then(res => res.data),

  markOutOfService: (slotId: number) =>
    api.put(`/slots/${slotId}/out-of-service`).then(res => res.data),
};
