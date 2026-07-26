import api from '@/common/api';
import type { UtilizationReport, RevenueReport, PeakHoursReport } from '@/common/types';

export const ReportService = {
  getUtilization: (from: string, to: string, lotId?: number) =>
    api.get<UtilizationReport>('/reports/utilization', {
      params: { from, to, lotId }
    }).then(res => res.data),

  getRevenue: (from: string, to: string, lotId?: number) =>
    api.get<RevenueReport>('/reports/revenue', {
      params: { from, to, lotId }
    }).then(res => res.data),

  getPeakHours: (from: string, to: string, lotId?: number) =>
    api.get<PeakHoursReport>('/reports/peak-hours', {
      params: { from, to, lotId }
    }).then(res => res.data),
};
