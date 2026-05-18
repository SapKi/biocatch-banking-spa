// ─── BioCatch API ────────────────────────────────────────────────────────────
export const API_ENDPOINT    = import.meta.env.VITE_API_ENDPOINT as string;
export const API_BRAND       = 'SD';
export const API_SOLUTION    = 'ATO';
export const API_CUSTOMER_ID = 'dummy';

// ─── Local database keys ─────────────────────────────────────────────────────
export const DB_USERS_KEY           = 'bc_users';
export const DB_TRANSACTIONS_PREFIX = 'bc_transactions_';

// ─── Business defaults ───────────────────────────────────────────────────────
export const INITIAL_CHECKING_BALANCE = 5_000.00;
export const INITIAL_SAVINGS_BALANCE  = 12_500.00;

// ─── Routing ─────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:    '/',
  LOGIN:   '/login',
  SIGNUP:  '/signup',
  ACCOUNT: '/account',
  PAYMENT: '/payment',
} as const;

// ─── SDK screen context names ─────────────────────────────────────────────────
export const SCREENS = {
  LOGIN:   'login_screen',
  SIGNUP:  'signup_screen',
  ACCOUNT: 'account_screen',
  PAYMENT: 'payment_screen',
} as const;

// ─── UI timing ───────────────────────────────────────────────────────────────
export const REDIRECT_DELAY_MS = 800;
