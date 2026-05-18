import { generateUUID } from '../utils/uuid';
import { Action, ActivityType, ApiPayload } from '../types';

const ENDPOINT = 'https://hooks.zapier.com/hooks/catch/1888053/bgwofce/';
const IAM = 'sapirkikoz@gmail.com';
const BRAND = 'SD';
const SOLUTION = 'ATO';
const CUSTOMER_ID = 'dummy';

async function postAction(action: Action, activityType: ActivityType, csid: string): Promise<unknown> {
  const payload: ApiPayload = {
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

  const data: unknown = await response.json().catch(() => ({}));
  console.log(`[API] Response ← ${action}`, data);
  return data;
}

export function triggerInit(csid: string): Promise<unknown> {
  return postAction('init', 'LOGIN', csid);
}

export function triggerGetScore(csid: string): Promise<unknown> {
  return postAction('getScore', 'PAYMENT', csid);
}
