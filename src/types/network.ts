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
  comisiones_generadas?: number;
  volumen?: number;
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
  comisiones_generadas?: number;
}

export interface DescendantSubtreeSummary {
  activeReferrals: number;
  lastMonthCommissions: number;
  totalVolume: number;
}

export interface DescendantSubtreeResponse {
  isAuthorized: boolean;
  requesterLevelToDescendant: number | null;
  totalLevels: number;
  totalDescendants: number;
  hasMore?: boolean;
  summary?: DescendantSubtreeSummary;
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
  comisiones_generadas?: number;
  volumen?: number;
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
  comisiones_generadas?: number;
  volumen?: number;
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
  baseAmount: number | string; // Puede venir como string desde el backend
  commissionPercentage: number | string; // Puede venir como string desde el backend
  commissionAmount: number | string; // Puede venir como string desde el backend
  leaderMarkupAmount?: number | null;
  markupPercentage?: number | null;
  currency: string;
  status: string; // pending, processed, etc.
  cryptoTransactionId?: number | null;
  createdAt: string;
  calculationDetails?: B2BCommissionCalculationDetails | MlmTransactionCalculationDetails;
  [key: string]: any; // Para otros campos adicionales
}

export interface ClaimsPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ClaimsSummary {
  totalCommissions: number;
  gainsFromRecharges: number;
  gainsFromCards: number;
  totalCommissionsPercentageChange?: number;
  gainsFromRechargesPercentageChange?: number;
  gainsFromCardsPercentageChange?: number;
  totalGananciasPorReclamar?: number;
  claimedUltimoMes?: number;
}

export interface ClaimsResponse {
  summary?: ClaimsSummary | null;
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

export interface DefaultCard {
  id: number;
  payco_card_id: string;
  card_number: string;
  holder_name: string;
  nomina: string;
  is_default: boolean;
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
  userFullName?: string | null;
  DefaultCard?: DefaultCard | null;
}

export interface MlmTransactionCalculationDetails {
  generatedBy: number;
  ancestorDepth: number;
  ancestorLevelName: string;
  ancestorRelativeLevel: number;
  ancestorMlmCode: string;
  source: string;
  generatedAt: string;
  userFullName?: string | null;
  DefaultCard?: DefaultCard | null;
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
  commissionType?: string; // papa, abuelo, bis_abuelo, leader_retention
  userEmail?: string; // Email del usuario que generó la comisión
  isMaterialized?: boolean; // Indica si la comisión ya está materializada
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

export interface B2BCommissionsSummary {
  totalGains: number;
  gainsFromRecharges: number;
  gainsFromCards: number;
  totalGainsPercentageChange?: number;
  gainsFromRechargesPercentageChange?: number;
  gainsFromCardsPercentageChange?: number;
  totalGananciasPorReclamar?: number;
  claimedUltimoMes?: number;
}

export interface B2BCommissionsData {
  total: number;
  available: number;
  commissions: B2BCommission[];
  pagination: B2BCommissionsPagination;
  summary?: B2BCommissionsSummary | null;
}

export interface B2BCommissionsResponse {
  statusCode: number;
  message: string;
  data: B2BCommissionsData;
}

export interface RequestAllClaimsResponse {
  statusCode: number;
  message: string;
  data: {
    success: boolean;
    message: string;
    mlmTransactionsRequested: number;
    b2cFromB2BCommissionsRequested: number;
    totalRequested: number;
    errors: string[];
  };
}

export interface TotalToClaimInUSDTResponse {
  statusCode: number;
  message: string;
  data: {
    totalInUSDT: number;
    mlmTransactionsTotal: number;
    b2cCommissionsTotalMXN: number;
    b2cCommissionsTotalUSDT: number;
    mlmTransactionsCount: number;
    b2cCommissionsCount: number;
    exchangeRateMXNToUSDT: number;
    userEmail?: string; // Email del usuario para el mensaje de WhatsApp
  };
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

// Tipos para órdenes de claims
export interface Order {
  id: number;
  userId: number;
  status: 'pending' | 'paid' | 'cancelled';
  totalAmount: number;
  currency: string;
  paymentReference: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

export interface OrdersPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OrdersResponse {
  statusCode: number;
  message: string;
  data: {
    items: Order[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Tipos para claims dentro de una orden (estructura real del API)
export interface OrderClaimItem {
  id: number;
  baseTransactionId: number | null;
  cryptoTransactionId: string | null;
  userId: number;
  teamId: number | null;
  commissionType: string;
  baseAmount: number;
  commissionPercentage: number | null;
  commissionAmount: number;
  markupPercentage: number | null;
  leaderMarkupAmount: number | null;
  currency: string;
  status: 'available' | 'requested' | 'claimed';
  processedAt: string | null;
  createdAt: string;
  origin: 'mlm_transaction' | 'b2c_from_b2b_commission';
  calculationDetails: OrderClaimCalculationDetails;
}

// Tipo unión para calculationDetails que puede ser de mlm_transaction o b2c_from_b2b_commission
export type OrderClaimCalculationDetails = 
  | MlmTransactionOrderCalculationDetails 
  | B2BCommissionOrderCalculationDetails;

// CalculationDetails para mlm_transaction en órdenes
export interface MlmTransactionOrderCalculationDetails {
  source: string;
  DefaultCard?: DefaultCard | null;
  generatedAt?: string;
  generatedBy?: number;
  userFullName?: string | null;
  userEmail?: string;
  ancestorDepth?: number;
  ancestorMlmCode?: string;
  ancestorLevelName?: string;
  ancestorRelativeLevel?: string;
  // Campos adicionales para B2B
  markupOnly?: boolean;
  exchangeRate?: number;
  isRootLeader?: boolean;
  baseAmountFiat?: number;
  cryptocurrency?: string;
  leaderInAncestors?: boolean;
  leaderMarkupAmountFiat?: number;
  commissionAmountFiat?: number;
  usesCustomDistribution?: boolean;
  customCommissionPercentage?: number;
  standardCommissionPercentage?: number;
}

// CalculationDetails para b2c_from_b2b_commission en órdenes
export interface B2BCommissionOrderCalculationDetails {
  DefaultCard?: DefaultCard | null;
  totalVolume?: number;
  calculatedAt?: string;
  transactions?: B2BCommissionTransaction[];
  userFullName?: string | null;
  periodEndDate?: string;
  userCreatedAt?: string;
  periodStartDate?: string;
  commissionAmount?: number;
  originalJoinDate?: string;
  commissionPercentage?: number;
  source: string;
  teamId?: number;
  teamName?: string;
  level?: number;
}

export interface OrderClaimsResponse {
  statusCode: number;
  message: string;
  data: {
    orderId: number;
    orderStatus: 'pending' | 'paid' | 'cancelled';
    orderTotalAmount: number;
    items: OrderClaimItem[];
    total: number;
  };
}

