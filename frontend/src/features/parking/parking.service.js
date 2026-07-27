import api from "@/common/api";
export const ParkingService = {
  // ── Lots ──────────────────────────────────────────────────
  getAllLots: () => api.get("/lots").then((res) => res.data),
  createLot: (payload) => api.post("/lots", payload).then((res) => res.data),
  updateLot: (id, payload) => api.put(`/lots/${id}`, payload).then((res) => res.data),
  deactivateLot: (id) => api.put(`/lots/${id}/deactivate`).then((res) => res.data),
  // ── Slots ─────────────────────────────────────────────────
  getSlotsByLot: (lotId) => api.get(`/lots/${lotId}/slots`).then((res) => res.data),
  addSlot: (lotId, payload) => api.post(`/lots/${lotId}/slots`, payload).then((res) => res.data),
  bulkAddSlots: (lotId, payload) => api.post(`/lots/${lotId}/slots/bulk`, payload).then((res) => res.data),
  markOutOfService: (slotId) => api.put(`/slots/${slotId}/out-of-service`).then((res) => res.data)
};
