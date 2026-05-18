/**
 * Coloured console logger for browser DevTools.
 * Each domain gets its own colour so log lines are easy to spot during a demo.
 *
 * Usage:
 *   import { log } from '../utils/logger';
 *   log.auth('Session confirmed for', email);
 *   log.sdk('changeContext →', screen);
 */

interface DomainLogger {
  info  : (msg: string, ...args: unknown[]) => void;
  warn  : (msg: string, ...args: unknown[]) => void;
  error : (msg: string, ...args: unknown[]) => void;
  group : (msg: string) => void;
  end   : () => void;
}

function make(label: string, color: string): DomainLogger {
  const tag   = `%c${label}`;
  const style = `color:${color}; font-weight:700; font-size:11px;`;
  return {
    info  : (msg, ...a) => console.log  (tag, style, msg, ...a),
    warn  : (msg, ...a) => console.warn (tag, style, msg, ...a),
    error : (msg, ...a) => console.error(tag, style, msg, ...a),
    group : (msg)       => console.group(`%c${label} ${msg}`, style),
    end   : ()          => console.groupEnd(),
  };
}

export const log = {
  app     : make('[App]',     '#94a3b8'),   // slate  — boot messages
  auth    : make('[Auth]',    '#3b82f6'),   // blue   — session / CSID
  sdk     : make('[App→SDK]', '#10b981'),   // green  — app-side SDK calls (before invoking cdApi)
  api     : make('[API]',     '#f59e0b'),   // amber  — payload builder
  http    : make('[HTTP]',    '#0ea5e9'),   // cyan   — raw fetch layer
  db      : make('[DB]',      '#8b5cf6'),   // violet — localStorage DB
  payment : make('[Payment]', '#f97316'),   // orange — payment results
};
