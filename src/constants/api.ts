// API Configuration
// Uses VITE_API_URL from environment variables
// 
// PRIORIDAD (en orden):
// 1. Variable de entorno VITE_API_URL (Cloudflare o .env local) - SIEMPRE tiene máxima prioridad
// 2. Fallback solo para desarrollo local si no hay .env configurado
//
// IMPORTANTE: 
// - En Cloudflare: la variable VITE_API_URL debe estar configurada en cada ambiente (preview, production, etc.)
//   Cloudflare SIEMPRE usará la variable configurada, NO el fallback del código
// - En desarrollo local: usa el archivo .env (VITE_API_URL=https://dev.kivooapp.co)
//   Si no hay .env, usa el fallback a localhost solo para desarrollo
// - NUNCA cambiar el fallback para producción, siempre usar variables de entorno en Cloudflare
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  // Fallback SOLO para desarrollo local si no hay .env
  // En Cloudflare, VITE_API_URL siempre debe estar configurada
  import.meta.env.DEV ? "http://localhost:3001" : "https://dev.kivooapp.co"
);
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
    USER_BY_EMAIL: "/auth/user-by-email",
    UPDATE_PROFILE: "/auth/update-profile",
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
    MIS_TARJETAS: "/cards/mis-tarjetas",
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
    SINGLE_LEVEL: "/network/single-level",
    B2C_EXCLUDING_B2B_B2T: "/network/b2c-excluding-b2b-b2t",
    AVAILABLE_MODEL: "/network/available-model",
    B2B_LEADERS_OWNED_TO_B2C: "/network/b2b-leaders-owned-to-b2c",
    B2T_LEADERS_OWNED_TO_B2C: "/network/b2t-leaders-owned-to-b2c",
    CLAIMS: "/network/claims",
    TEAM_DETAILS: "/network/team/:teamId/details",
    B2B_COMMISSIONS: "/network/b2c-from-b2b-commissions/available",
    CLAIM_B2B_COMMISSION: "/network/b2c-from-b2b-commissions/claim",
    MATERIALIZE_B2B_COMMISSION: "/network/b2c-from-b2b-commissions/materialize",
    CLAIM_MLM_TRANSACTION: "/network/mlm-transactions/claim",
    REQUEST_ALL_CLAIMS: "/network/claims/requestAll",
    TOTAL_USDT: "/network/claims/total-usdt",
    ORDERS: "/network/orders",
    ORDER_CLAIMS: "/network/claim-orders/:id/claims",
    MANUAL_COMMISSIONS: "/network/manual-commissions",
    NOTIFICATIONS: "/network/notifications",
    NOTIFICATION_MARK_READ: "/network/notifications/:id/read",
    NOTIFICATIONS_MARK_ALL_READ: "/network/notifications/read-all",
  },
  DASHBOARD: {
    METRICS: "/dashboard/metrics",
    RESUME: "/dashboard/resume",
    RECENT_TRANSACTIONS: "/dashboard/recent-transactions",
    CLAIMS_REPORT: "/dashboard/reports/claims-report",
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
