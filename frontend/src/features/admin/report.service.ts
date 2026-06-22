import api from '@/common/api';
import type { RevenueReport, OccupancyReport } from '@/common/types';

/**
 * ReportService — wraps all /reports endpoints (ADMIN only).
 *
 * Backend routes (context-path: /api/v1):
 *   GET /reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD → RevenueReport
 *   GET /reports/occupancy                              → OccupancyReport[]
 */
export const ReportService = {
  getRevenue: (from: string, to: string) =>
    api.get<RevenueReport>(`/reports/revenue?from=${from}&to=${to}`).then(res => res.data),

  getOccupancy: () =>
    api.get<OccupancyReport[]>('/reports/occupancy').then(res => res.data),
};
