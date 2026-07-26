import api from '@/common/api';
import type { PricingConfig } from '@/common/types';

export const BillingService = {
  getPricing: () =>
    api.get<PricingConfig>('/admin/pricing').then(res => res.data),

  updatePricing: (payload: PricingConfig) =>
    api.put<PricingConfig>('/admin/pricing', payload).then(res => res.data),
};
