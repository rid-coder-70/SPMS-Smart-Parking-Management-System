import api from "@/common/api";
export const AuthService = {
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),
  register: (payload) => api.post("/auth/register", payload).then((res) => res.data),
  getMe: () => api.get("/users/me").then((res) => res.data),
  updateProfile: (payload) => api.put("/users/me", payload).then((res) => res.data),
  changePassword: (payload) => api.put("/users/me/password", payload).then((res) => res.data)
};
