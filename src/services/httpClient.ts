/**
 * httpClient — generic fetch wrapper.
 *
 * Responsible only for the HTTP mechanics:
 * - Sending a POST request
 * - Logging request and response
 * - Normalising errors into thrown Error instances
 *
 * It knows nothing about BioCatch payloads, CSIDs, or business logic.
 * apiService owns that layer.
 */

export async function post(url: string, body: unknown): Promise<unknown> {
  console.group(`[HTTP] POST ${url}`);
  console.log('Body:', body);

  let response: Response;
  try {
    // No Content-Type header — avoids CORS preflight.
    // Zapier parses JSON from the raw body regardless of Content-Type.
    response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[HTTP] Network error — request never reached the server');
    console.error('  type   :', err instanceof Error ? err.constructor.name : typeof err);
    console.error('  message:', err instanceof Error ? err.message : err);
    console.error('  causes : ad blocker · offline · CORS preflight rejected');
    console.groupEnd();
    throw err;
  }

  console.log('[HTTP] Status:', response.status, response.statusText);

  if (!response.ok) {
    const text = await response.text().catch(() => 'no body');
    console.error('[HTTP] Server error:', response.status, text);
    console.groupEnd();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const data: unknown = await response.json().catch(() => ({}));
  console.log('[HTTP] Response:', data);
  console.groupEnd();
  return data;
}
