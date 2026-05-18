import { useEffect } from 'react';
import { changeContext } from '../services/sdkService';

export function useSDKContext(contextName: string): void {
  useEffect(() => {
    changeContext(contextName);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
