import api from "@/common/api";
export const BillingService = {
  getPricing: () => api.get("/admin/pricing").then((res) => res.data),
  updatePricing: (payload) => api.put("/admin/pricing", payload).then((res) => res.data)
};
