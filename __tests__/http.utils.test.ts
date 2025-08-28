import { parseRetryAfterSeconds, buildRequestHeaders } from '@/src/utils/http';

describe('parseRetryAfterSeconds', () => {
  test('parses numeric seconds (string)', () => {
    expect(parseRetryAfterSeconds('120')).toBe(120);
    expect(parseRetryAfterSeconds('0')).toBe(0);
  });

  test('parses numeric seconds (number)', () => {
    expect(parseRetryAfterSeconds(5)).toBe(5);
  });

  test('parses HTTP-date into seconds', () => {
    const futureMs = Date.now() + 45_000; // 45 seconds ahead
    const httpDate = new Date(futureMs).toUTCString();
    const secs = parseRetryAfterSeconds(httpDate);
    expect(typeof secs).toBe('number');
    // Should be around 45s (allow some drift)
    expect(secs!).toBeGreaterThanOrEqual(40);
    expect(secs!).toBeLessThanOrEqual(60);
  });

  test('returns null for invalid values', () => {
    expect(parseRetryAfterSeconds(undefined)).toBeNull();
    expect(parseRetryAfterSeconds('not-a-date')).toBeNull();
  });
});

describe('buildRequestHeaders', () => {
  test('includes required headers and a request id', () => {
    const h = buildRequestHeaders();
    expect(h['Cache-Control']).toBe('no-store');
    expect(typeof h['X-Request-ID']).toBe('string');
    expect(h['X-Request-ID'].length).toBeGreaterThan(0);
    expect(h['X-Captcha-Token']).toBeUndefined();
  });

  test('adds CAPTCHA header when provided', () => {
    const token = 'abc123';
    const h = buildRequestHeaders(token);
    expect(h['X-Captcha-Token']).toBe(token);
  });
});
