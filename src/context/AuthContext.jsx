/**
 * AuthContext — single source of truth for session state.
 *
 * Stores:
 *   user      — logged-in user object (null when logged out)
 *   csid      — Customer Session ID for this session
 *   initDone  — true once the "init" API call has succeeded;
 *               gates the "getScore" call so it can't fire prematurely.
 *
 * Why sessionStorage for CSID?
 *   - sessionStorage is cleared when the tab closes — appropriate for a
 *     banking session. A new tab = a new session = a new CSID.
 *   - localStorage would persist across tabs and restarts, which would
 *     mean the same CSID follows the user across separate sessions.
 *
 * Why not Redux?
 *   This app has a single, linear user flow. Context + useReducer is
 *   sufficient and avoids a dependency that would need explanation.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { generateUUID } from '../utils/uuid';
import { setCustomerSessionId } from '../services/sdkService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [csid, setCsid] = useState(() => sessionStorage.getItem('csid') || null);
  const [initDone, setInitDone] = useState(false);

  const login = useCallback((userData) => {
    const newCsid = generateUUID();
    console.log('[Auth] New CSID generated →', newCsid);

    sessionStorage.setItem('csid', newCsid);
    setCsid(newCsid);
    setUser(userData);

    // Tell the SDK about this session's CSID immediately after generation.
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
    // Next login() call will generate a fresh CSID.
  }, []);

  return (
    <AuthContext.Provider value={{ user, csid, initDone, login, logout, markInitDone }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
