/**
 * sdkService — thin wrapper around window.cdApi.
 *
 * Why a wrapper?
 * - Centralises all SDK calls so there is one place to fix if the API changes.
 * - Guards against the SDK not being loaded yet (race condition on slow networks).
 * - Makes it easy to stub in tests without touching window.
 * - Provides a consistent console log signature for observability.
 */

function getApi() {
  if (typeof window === 'undefined' || !window.cdApi) {
    console.warn('[SDK] cdApi not available yet');
    return null;
  }
  return window.cdApi;
}

/**
 * Sets the Customer Session ID on the SDK.
 * Should be called once per session — immediately after generating a CSID on login.
 */
export function setCustomerSessionId(csid) {
  const api = getApi();
  if (!api) return;
  console.log('[SDK] setCustomerSessionId →', csid);
  api.setCustomerSessionId(csid);
}

/**
 * Updates the SDK's page context.
 * Called on every route/screen change so BioCatch knows which screen
 * the user is currently on — this affects scoring and anomaly detection.
 */
export function changeContext(contextName) {
  const api = getApi();
  if (!api) return;
  console.log('[SDK] changeContext →', contextName);
  api.changeContext(contextName);
}

/**
 * Sets the customer brand on the SDK.
 * Optional — useful when the same SDK instance serves multiple brands.
 */
export function setCustomerBrand(brand) {
  const api = getApi();
  if (!api) return;
  console.log('[SDK] setCustomerBrand →', brand);
  api.setCustomerBrand(brand);
}
