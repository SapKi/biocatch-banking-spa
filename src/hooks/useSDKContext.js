/**
 * useSDKContext — called once per page to update the SDK's active screen.
 *
 * Why a hook?
 * Each page component simply calls useSDKContext("login_screen") and the
 * context change fires automatically on mount. This keeps SDK logic out of
 * JSX and guarantees the call happens exactly once per screen visit.
 *
 * The empty-array dependency means it fires on mount only — correct because
 * context names are static per screen.
 */

import { useEffect } from 'react';
import { changeContext } from '../services/sdkService';

export function useSDKContext(contextName) {
  useEffect(() => {
    changeContext(contextName);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
