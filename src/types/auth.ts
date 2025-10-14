// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  document_type: string;
  document_number: string;
  phone: string;
  country_code: string;
  dial_code: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  referred_by_code?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  document_type: string;
  document_number: string;
  phone: string;
  country_code: string;
  dial_code: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  referral_code: string;
  referred_by_code?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_document_verified: boolean;
  has_card: boolean;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export type UserStatus = "pending" | "active" | "suspended" | "blocked";

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
