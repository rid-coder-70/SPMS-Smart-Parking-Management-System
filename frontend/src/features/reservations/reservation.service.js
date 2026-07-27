import api from "@/common/api";
export const ReservationService = {
  create: (payload) => api.post("/reservations", payload).then((res) => res.data),
  getMyReservations: () => api.get("/reservations/me").then((res) => res.data),
  getById: (id) => api.get(`/reservations/${id}`).then((res) => res.data),
  cancel: (id) => api.put(`/reservations/${id}/cancel`).then((res) => res.data),
  checkIn: (id) => api.put(`/reservations/${id}/check-in`).then((res) => res.data),
  checkOut: (id) => api.put(`/reservations/${id}/check-out`).then((res) => res.data),
  adminCancel: (id) => api.delete(`/reservations/${id}/admin`).then((res) => res.data)
};
