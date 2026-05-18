import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { generateUUID } from '../utils/uuid';
import { setCustomerSessionId } from '../services/sdkService';
import { User, AuthContextValue } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [csid, setCsid] = useState<string | null>(() => sessionStorage.getItem('csid'));
  const [initDone, setInitDone] = useState(false);

  const login = useCallback((userData: User) => {
    const newCsid = generateUUID();
    console.log('[Auth] New CSID generated →', newCsid);

    sessionStorage.setItem('csid', newCsid);
    setCsid(newCsid);
    setUser(userData);

    setCustomerSessionId(newCsid);
  }, []);

  const markInitDone = useCallback(() => {
    setInitDone(true);
  }, []);

  const logout = useCallback(() => {
    console.log('[Auth] Session ended — CSID cleared');
    sessionStorage.removeItem('csid');
    setCsid(null);
    setUser(null);
    setInitDone(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, csid, initDone, login, logout, markInitDone }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
