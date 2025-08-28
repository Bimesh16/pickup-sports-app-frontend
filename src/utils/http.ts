import { generateRequestId } from '@/src/utils/ids';

/**
 * Parses a Retry-After header value into seconds (integer).
 * - Supports numeric seconds or HTTP-date format.
 * - Returns null if value cannot be parsed.
 */
export function parseRetryAfterSeconds(retryAfter: string | number | undefined): number | null {
  if (retryAfter == null) return null;
  if (typeof retryAfter === 'number') {
    return Number.isFinite(retryAfter) ? Math.max(0, Math.ceil(retryAfter)) : null;
  }
  const trimmed = String(retryAfter).trim();
  const asNum = Number(trimmed);
  if (!Number.isNaN(asNum)) return Math.max(0, Math.ceil(asNum));
  const ts = Date.parse(trimmed);
  if (!Number.isNaN(ts)) {
    const diffMs = ts - Date.now();
    return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
  }
  return null;
}

/**
 * Builds standard request headers for auth-related POSTs:
 * - Cache-Control: no-store
 * - X-Request-ID: short correlation id
 * - X-Captcha-Token: when provided
 */
export function buildRequestHeaders(captchaToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store',
    'X-Request-ID': generateRequestId(),
  };
  if (captchaToken) headers['X-Captcha-Token'] = captchaToken;
  return headers;
}
