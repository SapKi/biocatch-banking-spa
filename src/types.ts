export interface User {
  email: string;
  isNewUser: boolean;
}

export type ApiStatusKind = 'idle' | 'loading' | 'success' | 'error';

export interface ApiStatus {
  status: ApiStatusKind;
  message: string;
}

export interface AuthContextValue {
  user: User | null;
  csid: string | null;
  initDone: boolean;
  /** Step 1 — generate CSID + tell SDK. Call this before the API. Returns the new CSID. */
  startSession: () => string;
  /** Step 2 — set user + mark initDone. Call this only after the API succeeds. */
  completeAuth: (userData: User) => void;
  logout: () => void;
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
}

export type Action = 'init' | 'getScore';
export type ActivityType = 'LOGIN' | 'PAYMENT' | 'REGISTRATION';

export interface ApiPayload {
  customerId: string;
  action: Action;
  customerSessionId: string;
  activityType: ActivityType;
  uuid: string;
  brand: string;
  solution: string;
  iam: string;
}
