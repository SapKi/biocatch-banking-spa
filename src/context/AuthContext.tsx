import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { generateUUID } from '../utils/uuid';
import { setCustomerSessionId } from '../services/sdkService';
import { log } from '../utils/logger';
import { User, AuthContextValue } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [csid, setCsid] = useState<string | null>(() => sessionStorage.getItem('csid'));
  const [initDone, setInitDone] = useState(false);

  const startSession = useCallback((): string => {
    const newCsid = generateUUID();
    log.auth.info('New CSID generated →', newCsid);
    sessionStorage.setItem('csid', newCsid);
    setCsid(newCsid);
    setCustomerSessionId(newCsid);
    return newCsid;
  }, []);

  const completeAuth = useCallback((userData: User) => {
    log.auth.info('Session confirmed for', userData.email);
    setUser(userData);
    setInitDone(true);
  }, []);

  const logout = useCallback(() => {
    log.auth.info('Session ended — CSID cleared');
    sessionStorage.removeItem('csid');
    setCsid(null);
    setUser(null);
    setInitDone(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, csid, initDone, startSession, completeAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
