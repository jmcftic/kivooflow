import { apiService } from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { DashboardMetrics, DashboardMetricsResponse, ResumeData, ResumeResponse, DateFilter, RecentTransaction, RecentTransactionsApiResponse, RecentTransactionsResponse } from '@/types/dashboard';

export async function getDashboardMetrics(model: string, dateFilter?: DateFilter): Promise<DashboardMetrics> {
  // Convertir el modelo a mayúsculas para el query param (B2C, B2B, B2T)
  const modelUpper = model.toUpperCase();
  
  const params: Record<string, string> = { model: modelUpper };
  if (dateFilter) {
    params.dateFilter = dateFilter;
  }
  
  const res = await apiService.get<DashboardMetricsResponse>(
    API_ENDPOINTS.DASHBOARD.METRICS,
    params
  );
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
    resume: data?.resume ? {
      commissions: data.resume.commissions ?? 0,
      recargas: data.resume.recargas ?? 0,
      ventas: data.resume.ventas ?? 0,
      period: data.resume.period ?? 'last_2_months',
      startDate: data.resume.startDate,
      endDate: data.resume.endDate,
      monthlyData: data.resume.monthlyData ?? [],
    } : undefined,
    recentTransactions: data?.recentTransactions ? data.recentTransactions.map((tx: any) => ({
      id: tx.id ?? '',
      userId: tx.userId ?? 0,
      userEmail: tx.userEmail ?? '',
      cryptoAmount: tx.cryptoAmount ?? 0,
      localAmount: tx.localAmount ?? 0,
      localCurrency: tx.localCurrency ?? 'MXN',
      cryptocurrency: tx.cryptocurrency ?? 'USDT',
      createdAt: tx.createdAt ?? new Date().toISOString(),
      status: tx.status ?? '',
    })) : undefined,
  };
}

export async function getDashboardResume(model: string, dateFilter: DateFilter): Promise<ResumeData> {
  // Convertir el modelo a mayúsculas para el query param (B2C, B2B, B2T)
  const modelUpper = model.toUpperCase();
  
  const res = await apiService.get<ResumeResponse>(
    API_ENDPOINTS.DASHBOARD.RESUME,
    { 
      model: modelUpper,
      dateFilter: dateFilter
    }
  );
  const payload: any = res;
  const data = payload?.data ?? payload;
  
  return {
    commissions: data?.commissions ?? 0,
    recargas: data?.recargas ?? 0,
    ventas: data?.ventas ?? 0,
    period: data?.period ?? dateFilter,
    startDate: data?.startDate,
    endDate: data?.endDate,
    monthlyData: data?.monthlyData ?? [],
  };
}

export async function getRecentTransactions(
  model: string, 
  page: number = 1, 
  pageSize: number = 5
): Promise<RecentTransactionsResponse> {
  // Convertir el modelo a mayúsculas para el query param (B2C, B2B, B2T)
  const modelUpper = model.toUpperCase();
  
  const res = await apiService.get<RecentTransactionsApiResponse>(
    API_ENDPOINTS.DASHBOARD.RECENT_TRANSACTIONS,
    { 
      model: modelUpper,
      page: page.toString(),
      pageSize: pageSize.toString()
    }
  );
  const payload: any = res;
  const data = payload?.data ?? payload;
  
  return {
    transactions: data?.transactions ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    totalPages: data?.totalPages ?? 0,
  };
}

