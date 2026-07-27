import api from "@/common/api";
export const AuditService = {
  getLogs: (actionType, page = 0, size = 20) => api.get("/admin/audit-logs", {
    params: { actionType, page, size }
  }).then((res) => res.data)
};
