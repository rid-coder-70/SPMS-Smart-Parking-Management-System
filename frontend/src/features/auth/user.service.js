import api from "@/common/api";
export const UserService = {
  // ── Own Profile ──────────────────────────────────────────
  getMe: () => api.get("/users/me").then((res) => res.data),
  // ── Admin User Management ────────────────────────────────
  listUsers: (page = 0, size = 20) => api.get(`/users?page=${page}&size=${size}&sort=username,asc`).then((res) => res.data),
  activateUser: (id) => api.put(`/users/${id}/activate`).then((res) => res.data),
  deactivateUser: (id) => api.put(`/users/${id}/deactivate`).then((res) => res.data),
  resetPassword: (id, payload) => api.put(`/users/${id}/reset-password`, payload).then((res) => res.data)
};
