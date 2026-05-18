import { log } from '../utils/logger';

type Api = NonNullable<Window['cdApi']>;

function getApi(): Api | null {
  if (typeof window === 'undefined' || !window.cdApi) {
    log.sdk.warn('cdApi not available yet');
    return null;
  }
  return window.cdApi;
}

function invoke<K extends keyof Api>(method: K, value: string): void {
  const api = getApi();
  if (!api) return;
  log.sdk.info(`${String(method)} →`, value);
  (api[method] as (v: string) => void)(value);
}

export const setCustomerSessionId = (csid: string)  => invoke('setCustomerSessionId', csid);
export const changeContext         = (name: string)  => invoke('changeContext', name);
export const setCustomerBrand      = (brand: string) => invoke('setCustomerBrand', brand);
