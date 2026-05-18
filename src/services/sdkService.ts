import { log } from '../utils/logger';

function getApi(): NonNullable<Window['cdApi']> | null {
  if (typeof window === 'undefined' || !window.cdApi) {
    log.sdk.warn('cdApi not available yet');
    return null;
  }
  return window.cdApi;
}

export function setCustomerSessionId(csid: string): void {
  const api = getApi();
  if (!api) return;
  log.sdk.info('setCustomerSessionId →', csid);
  api.setCustomerSessionId(csid);
}

export function changeContext(contextName: string): void {
  const api = getApi();
  if (!api) return;
  log.sdk.info('changeContext →', contextName);
  api.changeContext(contextName);
}

export function setCustomerBrand(brand: string): void {
  const api = getApi();
  if (!api) return;
  log.sdk.info('setCustomerBrand →', brand);
  api.setCustomerBrand(brand);
}
