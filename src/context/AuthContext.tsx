import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { generateUUID } from '../utils/uuid';
import { setCustomerSessionId } from '../services/sdkService';
import { User, AuthContextValue } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [csid, setCsid] = useState<string | null>(() => sessionStorage.getItem('csid'));
  const [initDone, setInitDone] = useState(false);

  // Step 1: generate CSID + tell SDK. User is NOT set here — call before the API.
  const startSession = useCallback((): string => {
    const newCsid = generateUUID();
    console.log('[Auth] New CSID generated →', newCsid);
    sessionStorage.setItem('csid', newCsid);
    setCsid(newCsid);
    setCustomerSessionId(newCsid);
    return newCsid;
  }, []);

  // Step 2: set user + initDone. Call only after the API call succeeds.
  const completeAuth = useCallback((userData: User) => {
    console.log('[Auth] Session confirmed for', userData.username);
    setUser(userData);
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
