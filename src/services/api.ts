import type { ApiErrorBody } from '@/types/api';

// ─── Configuration ───────────────────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_REMIT_API_URL ||
  'https://remit-backend-yblg.onrender.com';

const AUTH_TOKEN_KEY = 'remit-auth-token';

// ─── Token helpers ───────────────────────────────────────────────────────────

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ─── Currency helpers (cents conversion) ─────────────────────────────────────

/** Convert a human-readable currency amount to cents (integer). */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert cents back to a human-readable currency amount. */
export function fromCents(cents: number): number {
  return cents / 100;
}

// ─── Phone validation ────────────────────────────────────────────────────────

const KE_PHONE_REGEX = /^(?:\+254|0)\d{9}$/;

/** Validate a Kenyan phone number (+254XXXXXXXXX or 0XXXXXXXXX). */
export function isValidKenyanPhone(phone: string): boolean {
  return KE_PHONE_REGEX.test(phone);
}

/** Convert any valid Kenyan phone to the 0XXXXXXXXX on-ramp format. */
export function toLocalPhone(phone: string): string {
  if (phone.startsWith('+254')) return '0' + phone.slice(4);
  return phone;
}

/** Convert any valid Kenyan phone to the +254XXXXXXXXX format. */
export function toInternationalPhone(phone: string): string {
  if (phone.startsWith('0')) return '+254' + phone.slice(1);
  return phone;
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody | null,
  ) {
    super(body?.error ?? body?.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
  }

  /** True when the backend returned 202 (queued / processing). */
  get isProcessing(): boolean {
    return this.status === 202;
  }

  /** True when the service is temporarily unavailable (503). */
  get isServiceBusy(): boolean {
    return this.status === 503;
  }

  /** True when the token is invalid or missing (401). */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

// ─── Core request function ───────────────────────────────────────────────────

interface RequestOptions {
  /** Skip attaching the Authorization header (for public endpoints like auth). */
  public?: boolean;
  /** Override the default 30 s timeout (in ms). */
  timeout?: number;
}

/**
 * Generic fetch wrapper for the Remit backend.
 *
 * - Attaches `Authorization: Bearer <token>` automatically (unless `public`).
 * - Parses JSON responses.
 * - Throws `ApiError` for non-2xx responses (except 202 which is returned normally).
 * - Handles 401 by clearing the stored token.
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { public: isPublic = false, timeout = 30_000 } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!isPublic) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // 401 — clear stale token
    if (response.status === 401) {
      clearAuthToken();
      const errorBody = await parseJsonSafe<ApiErrorBody>(response);
      throw new ApiError(401, errorBody);
    }

    // Non-2xx (but not 202) → throw
    if (!response.ok && response.status !== 202) {
      const errorBody = await parseJsonSafe<ApiErrorBody>(response);
      throw new ApiError(response.status, errorBody);
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(408, { error: 'Request timed out' });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Convenience methods ─────────────────────────────────────────────────────

export function apiGet<T>(path: string, options?: RequestOptions) {
  return apiRequest<T>('GET', path, undefined, options);
}

export function apiPost<T>(path: string, body?: unknown, options?: RequestOptions) {
  return apiRequest<T>('POST', path, body, options);
}

// ─── Internal helpers ────────────────────────────────────────────────────────

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
