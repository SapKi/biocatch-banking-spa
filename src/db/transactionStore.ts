import { Transaction } from '../types';
import { DB_TRANSACTIONS_PREFIX } from '../config';
import { readStorage } from '../utils/storage';
import { generateUUID } from '../utils/uuid';
import { log } from '../utils/logger';

function key(email: string): string {
  return `${DB_TRANSACTIONS_PREFIX}${email}`;
}

export function getTransactions(email: string): Transaction[] {
  const stored = readStorage<Transaction[]>(key(email), []);
  if (stored.every(tx => tx.id)) return stored;

  // Migrate legacy records that pre-date the id field
  const migrated = stored.map(tx => tx.id ? tx : { ...tx, id: generateUUID() });
  localStorage.setItem(key(email), JSON.stringify(migrated));
  log.db.info('Transactions migrated — ids backfilled:', migrated.length);
  return migrated;
}

export function addTransaction(email: string, tx: Omit<Transaction, 'id'>): void {
  const record: Transaction = { id: generateUUID(), ...tx };
  const existing = getTransactions(email);
  localStorage.setItem(key(email), JSON.stringify([record, ...existing]));
  log.db.info('Transaction saved →', record.id);
}

export function clearTransactions(email: string): void {
  localStorage.removeItem(key(email));
}
