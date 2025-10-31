// API Configuration
// Uses VITE_API_URL from environment variables, falls back to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REGISTER_REFERRAL: "/auth/register-referral",
    FORGOT_PASSWORD: "/auth/request-password-reset",
    VERIFY_RESET_CODE: "/auth/verify-reset-code",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    VERIFY_EMAIL: "/user/verify-email",
    VERIFY_PHONE: "/user/verify-phone",
  },
  CARDS: {
    LIST: "/cards",
    CREATE: "/cards",
    GET_BY_ID: "/cards/:id",
    ACTIVATE: "/cards/:id/activate",
    BLOCK: "/cards/:id/block",
    UNBLOCK: "/cards/:id/unblock",
  },
  TRANSACTIONS: {
    LIST: "/transactions",
    CREATE: "/transactions",
    GET_BY_ID: "/transactions/:id",
  },
  REFERRALS: {
    LIST: "/referrals",
    CREATE_CODE: "/referrals/code",
    CHECK_CODE: "/referrals/check/:code",
  },
  NETWORK: {
    GET: "/Network",
    SUBTREE: "/network/descendant/:descendantId/subtree",
  },
  CRYPTO: {
    WALLETS: "/crypto/wallets",
    DEPOSITS: "/crypto/deposits",
    CREATE_WALLET: "/crypto/wallets/create",
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
