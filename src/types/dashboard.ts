export interface DashboardMetrics {
  totalEarnings: number;
  availableBalance: number;
  activeReferrals: number;
  lastMonthCommissions: number;
  totalVolume: number;
  currency: string;
  lastUpdated: string;
}

export interface DashboardMetricsResponse {
  statusCode: number;
  message: string;
  data: DashboardMetrics;
}

