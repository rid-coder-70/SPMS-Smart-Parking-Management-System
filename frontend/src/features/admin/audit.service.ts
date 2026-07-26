import api from '@/common/api';
import type { AuditLog, Page } from '@/common/types';

export const AuditService = {
  getLogs: (actionType?: string, page = 0, size = 20) =>
    api.get<Page<AuditLog>>('/admin/audit-logs', {
      params: { actionType, page, size }
    }).then(res => res.data),
};
