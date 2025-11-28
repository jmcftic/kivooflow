export interface NetworkUser {
  user_id: number;
  user_email: string;
  user_full_name: string;
  user_phone: string;
  user_status: string;
  user_created_at: string;
  user_referral_code: string;
  direct_parent_id?: number;
  direct_parent_email?: string;
  direct_parent_full_name?: string;
  direct_parent_referral_code?: string;
  direct_referrals: number;
  total_descendants_of_user: number;
  has_descendants?: boolean;
}

export interface NetworkLevel {
  level: number;
  total_users_in_level: number;
  active_users_in_level: number;
  has_more_users_in_level: boolean;
  users: NetworkUser[];
}

export interface NetworkResponse {
  statusCode: number;
  message: string;
  data: {
    userId: number;
    total_levels: number;
    total_descendants: number;
    levels: NetworkLevel[];
    columns: Record<string, string[]>;
  }
}

export interface DescendantSubtreeUser {
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  status: string;
  createdAt: string;
  referralCode: string;
  directParentId: number | null;
  directParentEmail: string | null;
  directParentFullName: string | null;
  directParentReferralCode: string | null;
  directReferrals: number;
  totalDescendants: number;
  levelInSubtree: number;
}

export interface DescendantSubtreeResponse {
  isAuthorized: boolean;
  requesterLevelToDescendant: number | null;
  totalLevels: number;
  totalDescendants: number;
  users: DescendantSubtreeUser[];
}

export interface B2CNetworkUser {
  user_id: number;
  user_email: string;
  user_full_name: string;
  user_phone: string;
  user_status: string;
  user_created_at: string;
  user_referral_code: string;
  direct_parent_id: number;
  direct_parent_email: string;
  direct_parent_full_name: string;
  direct_parent_referral_code: string;
  direct_referrals: number;
  total_descendants_of_user: number;
  has_descendants: boolean;
}

export interface B2CNetworkResponse {
  statusCode: number;
  message: string;
  data: {
    summary: {
      totalLevels: number;
      totalDescendants: number;
    };
    level: {
      level: number;
      totalUsers: number;
      activeUsers: number;
    };
    users: B2CNetworkUser[];
    pagination: {
      totalPages: number;
      currentPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface AvailableMlmModelsData {
  user_id: number;
  my_model: string; // B2C, B2T, o B2B
  show_b2c_tab: boolean;
  show_b2t_tab: boolean;
  show_b2b_tab: boolean;
}

export interface AvailableMlmModelsResponse {
  statusCode?: number;
  message?: string;
  data?: AvailableMlmModelsData;
}

export interface NetworkLeaderOwnedToB2C {
  userId: number;
  depth: number;
  fullName: string;
  email: string;
  phone: string | null;
  referralCode: string;
  profileIconUrl: string | null;
  isEnterprice: boolean;
  status: string;
  createdAt: string;
  parentName: string | null;
  parentReferralCode: string | null;
  teamId: number | null;
  teamName: string | null;
  teamBannerUrl: string | null;
  mlmCode: string | null;
  mlmName: string | null;
  isTeamLeader: boolean | null;
  networkDepth: number | null;
  card1Url: string | null;
  card2Url: string | null;
  card3Url: string | null;
}

export interface NetworkLeadersPagination {
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NetworkLeadersResult {
  type: 'B2B' | 'B2T';
  total: number;
  limit: number;
  offset: number;
  pagination: NetworkLeadersPagination;
  leaders: NetworkLeaderOwnedToB2C[];
}

export interface NetworkLeadersResponse {
  statusCode?: number;
  message?: string;
  data?: NetworkLeadersResult;
}

export interface Claim {
  id: number;
  userId: number;
  commissionType: string; // papa, abuelo, bis_abuelo, leader_retention
  baseAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  leaderMarkupAmount?: number | null;
  markupPercentage?: number | null;
  currency: string;
  status: string; // pending, processed, etc.
  cryptoTransactionId?: number | null;
  createdAt: string;
  [key: string]: any; // Para otros campos adicionales
}

export interface ClaimsPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ClaimsResponse {
  items: Claim[];
  pagination: ClaimsPagination;
}

export interface ClaimsApiResponse {
  statusCode: number;
  message: string;
  data: ClaimsResponse;
}

export interface B2BCommissionTransaction {
  transactionId: string;
  expectedAmount: number;
  receivedAmount: number;
  exchangeRate: number;
  cryptocurrency: string;
  volumeMXN: number;
  createdAt: string;
  status: string;
}

export interface B2BCommissionCalculationDetails {
  userCreatedAt: string;
  originalJoinDate: string;
  periodStartDate: string;
  periodEndDate: string;
  transactions: B2BCommissionTransaction[];
  totalVolume: number;
  commissionPercentage: number;
  commissionAmount: number;
  calculatedAt: string;
}

export interface B2BCommission {
  id: number | null;
  teamId: number;
  teamName: string;
  level: number; // 1 = hija directa (0.3%), 2 = nieta (0.2%)
  commissionPercentage: number;
  periodType: string;
  periodStartDate: string;
  periodEndDate: string;
  totalVolume: number;
  commissionAmount: number;
  totalTransactions: number;
  currency: string;
  status: string;
  calculationDetails?: B2BCommissionCalculationDetails;
  createdAt: string;
}

export interface ClaimB2BCommissionRequest {
  teamId: number;
  level: number;
  periodStartDate: string;
  periodEndDate: string;
}

export interface ClaimMlmTransactionRequest {
  transactionId: number;
}

export interface ClaimMlmTransactionResponse {
  claim: Claim;
  message: string;
}

export interface B2BCommissionsPagination {
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface B2BCommissionsData {
  total: number;
  available: number;
  commissions: B2BCommission[];
  pagination: B2BCommissionsPagination;
}

export interface B2BCommissionsResponse {
  statusCode: number;
  message: string;
  data: B2BCommissionsData;
}

export interface TeamDetailsData {
  teamName: string;
  level: number;
  leaderEmail: string;
  leaderFullName: string;
  totalEarnings: number;
  availableBalance: number;
  activeReferrals: number;
  totalReferrals: number;
  totalVolume: number;
}

export interface TeamDetailsResponse {
  statusCode: number;
  message: string;
  data: TeamDetailsData;
}

