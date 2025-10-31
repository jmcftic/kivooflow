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


