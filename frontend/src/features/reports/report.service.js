import api from "@/common/api";
export const ReportService = {
  getUtilization: (from, to, lotId) => api.get("/reports/utilization", {
    params: { from, to, lotId }
  }).then((res) => res.data),
  getRevenue: (from, to, lotId) => api.get("/reports/revenue", {
    params: { from, to, lotId }
  }).then((res) => res.data),
  getPeakHours: (from, to, lotId) => api.get("/reports/peak-hours", {
    params: { from, to, lotId }
  }).then((res) => res.data)
};
