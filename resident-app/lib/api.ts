/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Backend API client — Proxies requests to FastAPI
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/** Base URL for the FastAPI backend (server-side only) */
export const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/** Default resident ID for demo */
export const DEMO_RESIDENT_ID = process.env.DEMO_RESIDENT_ID || '1';

/**
 * Fetch wrapper for backend API calls (server-side).
 * Adds error handling and JSON parsing.
 */
export async function backendFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BACKEND_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Unknown error');
    throw new Error(`Backend ${res.status}: ${errorBody}`);
  }

  return res.json() as Promise<T>;
}
