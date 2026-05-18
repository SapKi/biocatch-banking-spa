import { generateUUID } from '../utils/uuid';
import { post } from './httpClient';
import { API_ENDPOINT, API_BRAND, API_SOLUTION, API_CUSTOMER_ID } from '../config';
import { Action, ActivityType, ApiPayload } from '../types';

function buildPayload(action: Action, activityType: ActivityType, csid: string, iam: string): ApiPayload {
  return {
    customerId: API_CUSTOMER_ID,
    action,
    customerSessionId: csid,
    activityType,
    uuid: generateUUID(),
    brand: API_BRAND,
    solution: API_SOLUTION,
    iam,
  };
}

function postAction(action: Action, activityType: ActivityType, csid: string, iam: string): Promise<unknown> {
  console.log(`[API] ${action} / ${activityType} — CSID: ${csid}`);
  return post(API_ENDPOINT, buildPayload(action, activityType, csid, iam));
}

export function triggerInit(csid: string, iam: string): Promise<unknown> {
  return postAction('init', 'LOGIN', csid, iam);
}

export function triggerGetScore(csid: string, iam: string): Promise<unknown> {
  return postAction('getScore', 'PAYMENT', csid, iam);
}

export function triggerRegister(csid: string, iam: string): Promise<unknown> {
  return postAction('init', 'REGISTRATION', csid, iam);
}
