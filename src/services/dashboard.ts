import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { DashboardMetrics, DashboardMetricsResponse } from '@/types/dashboard';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await apiService.get<DashboardMetricsResponse>(API_ENDPOINTS.DASHBOARD.METRICS);
  const payload: any = res;
  const data = payload?.data ?? payload;
  
  return {
    totalEarnings: data?.totalEarnings ?? 0,
    availableBalance: data?.availableBalance ?? 0,
    activeReferrals: data?.activeReferrals ?? 0,
    lastMonthCommissions: data?.lastMonthCommissions ?? 0,
    totalVolume: data?.totalVolume ?? 0,
    currency: data?.currency ?? 'MXN',
    lastUpdated: data?.lastUpdated ?? new Date().toISOString(),
  };
}

