import { Transaction } from '../types';
import { DB_TRANSACTIONS_PREFIX } from '../config';
import { log } from './logger';

function key(email: string): string {
  return `${DB_TRANSACTIONS_PREFIX}${email}`;
}

export function getTransactions(email: string): Transaction[] {
  try {
    return JSON.parse(localStorage.getItem(key(email)) ?? '[]') as Transaction[];
  } catch {
    return [];
  }
}

export function addTransaction(email: string, tx: Transaction): void {
  const existing = getTransactions(email);
  localStorage.setItem(key(email), JSON.stringify([tx, ...existing]));
  log.db.info('Transaction saved →', tx);
}

export function clearTransactions(email: string): void {
  localStorage.removeItem(key(email));
}
