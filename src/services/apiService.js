/**
 * apiService — all network calls in one place.
 *
 * Why a dedicated service?
 * - UI components never construct raw fetch calls — they just call named functions.
 * - The endpoint URL, headers, and payload shape live here, not scattered across pages.
 * - Easy to swap the endpoint or add auth headers without touching UI code.
 *
 * API architecture:
 *   Login  → triggerInit()   (action: "init",     activityType: "LOGIN")
 *   Payment → triggerGetScore() (action: "getScore", activityType: "PAYMENT")
 *   getScore is intentionally blocked until init succeeds (enforced in AuthContext).
 */

import { generateUUID } from '../utils/uuid';

const ENDPOINT = 'https://hooks.zapier.com/hooks/catch/1888053/bgwofce/';
const IAM = 'sapirkikoz@gmail.com';
const BRAND = 'SD';
const SOLUTION = 'ATO';
const CUSTOMER_ID = 'dummy';

async function postAction(action, activityType, csid) {
  const payload = {
    customerId: CUSTOMER_ID,
    action,
    customerSessionId: csid,
    activityType,
    uuid: generateUUID(),
    brand: BRAND,
    solution: SOLUTION,
    iam: IAM,
  };

  console.log(`[API] Request → ${action}`, payload);

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'no body');
    console.error(`[API] Error ← ${action}`, response.status, text);
    throw new Error(`API error ${response.status}: ${text}`);
  }

  const data = await response.json().catch(() => ({}));
  console.log(`[API] Response ← ${action}`, data);
  return data;
}

export function triggerInit(csid) {
  return postAction('init', 'LOGIN', csid);
}

export function triggerGetScore(csid) {
  return postAction('getScore', 'PAYMENT', csid);
}
