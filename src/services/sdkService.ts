function getApi(): CdApi | null {
  if (typeof window === 'undefined' || !window.cdApi) {
    console.warn('[SDK] cdApi not available yet');
    return null;
  }
  return window.cdApi;
}

export function setCustomerSessionId(csid: string): void {
  const api = getApi();
  if (!api) return;
  console.log('[SDK] setCustomerSessionId →', csid);
  api.setCustomerSessionId(csid);
}

export function changeContext(contextName: string): void {
  const api = getApi();
  if (!api) return;
  console.log('[SDK] changeContext →', contextName);
  api.changeContext(contextName);
}

export function setCustomerBrand(brand: string): void {
  const api = getApi();
  if (!api) return;
  console.log('[SDK] setCustomerBrand →', brand);
  api.setCustomerBrand(brand);
}
