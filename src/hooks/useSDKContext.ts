import { useEffect, useRef } from 'react';
import { changeContext } from '../services/sdkService';

export function useSDKContext(contextName: string): void {
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    changeContext(contextName);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
