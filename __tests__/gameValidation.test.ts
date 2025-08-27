import { parseLocalDateTime, validateCreateGame } from '@/src/utils/gameValidation';

describe('gameValidation', () => {
  test('parseLocalDateTime accepts ISO', () => {
    const d = parseLocalDateTime('2030-01-02T12:30:00Z');
    expect(d).toBeInstanceOf(Date);
  });

  test('parseLocalDateTime accepts YYYY-MM-DDTHH:mm (local)', () => {
    const d = parseLocalDateTime('2030-01-02T12:30');
    expect(d).toBeInstanceOf(Date);
  });

  test('parseLocalDateTime rejects invalid', () => {
    const d = parseLocalDateTime('not-a-date');
    expect(d).toBeNull();
  });

  // These tests assume the process timezone is set to a zone with DST,
  // e.g. run with `TZ=America/New_York`.
  describe('parseLocalDateTime DST edge cases', () => {
    test('handles nonexistent times by rolling forward', () => {
      const d = parseLocalDateTime('2021-03-14T02:30');
      expect(d).toBeInstanceOf(Date);
      expect(d?.toISOString()).toBe('2021-03-14T07:30:00.000Z');
    });

    test('handles ambiguous times by choosing first instance', () => {
      const d = parseLocalDateTime('2021-11-07T01:30');
      expect(d).toBeInstanceOf(Date);
      // First 01:30 occurs in EDT (UTC-4)
      expect(d?.toISOString()).toBe('2021-11-07T05:30:00.000Z');
    });
  });

  test('validateCreateGame requires title and future date', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    const { errors: e1, valid: v1 } = validateCreateGame({ title: '', startsAt: past, maxPlayers: '' });
    expect(v1).toBe(false);
    expect(e1.title).toBeTruthy();
    expect(e1.startsAt).toBeTruthy();

    const futureISO = new Date(Date.now() + 10 * 60_000).toISOString();
    const { errors: e2, valid: v2 } = validateCreateGame({ title: 'Pickup', startsAt: futureISO, maxPlayers: '' });
    expect(v2).toBe(true);
    expect(e2.title).toBeUndefined();
    expect(e2.startsAt).toBeUndefined();
  });

  test('validateCreateGame validates positive maxPlayers', () => {
    const futureISO = new Date(Date.now() + 10 * 60_000).toISOString();
    const { errors, valid } = validateCreateGame({ title: 'Pickup', startsAt: futureISO, maxPlayers: '-1' });
    expect(valid).toBe(false);
    expect(errors.maxPlayers).toBeTruthy();
  });
});
