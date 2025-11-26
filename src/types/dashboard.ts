export interface MonthlyData {
  mes: string;
  ventas: number;
  recargas: number;
  comisiones: number;
}

export interface WeeklyData {
  semana: string;
  ventas: number;
  recargas: number;
  comisiones: number;
}

export interface ResumeData {
  commissions: number;
  recargas: number;
  ventas: number;
  period: string;
  startDate?: string;
  endDate?: string;
  monthlyData: MonthlyData[];
  weeklyData?: WeeklyData[];
}

export interface DashboardMetrics {
  totalEarnings: number;
  availableBalance: number;
  activeReferrals: number;
  lastMonthCommissions: number;
  totalVolume: number;
  currency: string;
  lastUpdated: string;
  resume?: ResumeData;
  recentTransactions?: RecentTransaction[];
}

export interface DashboardMetricsResponse {
  statusCode: number;
  message: string;
  data: DashboardMetrics;
}

export interface ResumeResponse {
  statusCode: number;
  message: string;
  data: ResumeData;
}

export type DateFilter = 
  | 'last_month' 
  | 'last_2_months' 
  | 'last_6_months' 
  | 'last_year' 
  | 'last_2_years' 
  | 'all_time';

export interface RecentTransaction {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  cryptoAmount: number;
  localAmount: number;
  localCurrency: string;
  cryptocurrency: string;
  createdAt: string;
  status: string;
}

export interface RecentTransactionsResponse {
  transactions: RecentTransaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RecentTransactionsApiResponse {
  statusCode: number;
  message: string;
  data: RecentTransactionsResponse;
}

