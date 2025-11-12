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
  has_b2c_descendants: boolean;
  has_b2t_descendants: boolean;
  has_b2b_descendants: boolean;
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


