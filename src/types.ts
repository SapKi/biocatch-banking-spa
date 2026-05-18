export interface User {
  username: string;
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
  login: (userData: User) => void;
  logout: () => void;
  markInitDone: () => void;
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
