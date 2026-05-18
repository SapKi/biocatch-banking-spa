import { DB_USERS_KEY, INITIAL_CHECKING_BALANCE } from '../config';
import { readStorage } from '../utils/storage';
import { log } from '../utils/logger';

interface StoredUser {
  email: string;
  password: string;
  checkingBalance: number;
  createdAt: string;
}

function getAll(): StoredUser[] {
  return readStorage<StoredUser[]>(DB_USERS_KEY, []);
}

function save(users: StoredUser[]): void {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
}

export function registerUser(email: string, password: string): { ok: true } | { ok: false; error: string } {
  const users = getAll();
  if (users.find(u => u.email === email)) {
    return { ok: false, error: 'This email is already registered.' };
  }
  users.push({
    email,
    password,
    checkingBalance: INITIAL_CHECKING_BALANCE,
    createdAt: new Date().toISOString(),
  });
  save(users);
  log.db.info('User registered →', email);
  return { ok: true };
}

export function loginUser(email: string, password: string): { ok: true } | { ok: false; error: string } {
  const user = getAll().find(u => u.email === email);
  if (!user || user.password !== password) return { ok: false, error: 'Invalid email or password.' };
  log.db.info('User authenticated →', email);
  return { ok: true };
}

export function getBalance(email: string): number {
  return getAll().find(u => u.email === email)?.checkingBalance ?? 0;
}

export function deductFromChecking(email: string, amount: number): void {
  const users = getAll();
  const user  = users.find(u => u.email === email);
  if (user) {
    user.checkingBalance = parseFloat((user.checkingBalance - amount).toFixed(2));
    save(users);
    log.db.info('Balance updated → checking:', user.checkingBalance);
  }
}

export function removeUser(email: string): void {
  save(getAll().filter(u => u.email !== email));
  log.db.info('User removed →', email);
}

export function clearUsers(): void {
  localStorage.removeItem(DB_USERS_KEY);
}
