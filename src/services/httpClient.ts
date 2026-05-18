import { log } from '../utils/logger';

export async function post(url: string, body: unknown): Promise<unknown> {
  log.http.group(`POST ${url}`);
  log.http.info('Body:', body);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (err) {
    log.http.error('Network error — request never reached the server');
    log.http.error('  type   :', err instanceof Error ? err.constructor.name : typeof err);
    log.http.error('  message:', err instanceof Error ? err.message : err);
    log.http.error('  causes : ad blocker · offline · CORS preflight rejected');
    log.http.end();
    throw err;
  }

  log.http.info('Status:', response.status, response.statusText);

  if (!response.ok) {
    const text = await response.text().catch(() => 'no body');
    log.http.error('Server error:', response.status, text);
    log.http.end();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const data: unknown = await response.json().catch(() => ({}));
  log.http.info('Response:', data);
  log.http.end();
  return data;
}
