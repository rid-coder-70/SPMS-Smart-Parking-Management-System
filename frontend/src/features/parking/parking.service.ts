import api from '@/common/api';
import type { 
  ParkingLot, 
  ParkingSlot, 
  CreateParkingLotPayload, 
  UpdateParkingLotPayload,
  CreateParkingSlotPayload,
  UpdateSlotStatusPayload 
} from '@/common/types';

export const ParkingService = {
  // Lots
  getAllLots: () => api.get<ParkingLot[]>('/lots').then(res => res.data),
  getLotById: (id: number) => api.get<ParkingLot>(`/lots/${id}`).then(res => res.data),
  createLot: (payload: CreateParkingLotPayload) => api.post<ParkingLot>('/lots', payload).then(res => res.data),
  updateLot: (id: number, payload: UpdateParkingLotPayload) => api.put<ParkingLot>(`/lots/${id}`, payload).then(res => res.data),
  deleteLot: (id: number) => api.delete(`/lots/${id}`).then(res => res.data),

  // Slots
  getSlotsByLot: (lotId: number) => api.get<ParkingSlot[]>(`/lots/${lotId}/slots`).then(res => res.data),
  createSlot: (lotId: number, payload: CreateParkingSlotPayload) => api.post<ParkingSlot>(`/lots/${lotId}/slots`, payload).then(res => res.data),
  updateSlotStatus: (id: number, payload: UpdateSlotStatusPayload) => api.put<ParkingSlot>(`/slots/${id}/status`, payload).then(res => res.data),
  deleteSlot: (id: number) => api.delete(`/slots/${id}`).then(res => res.data),
};
