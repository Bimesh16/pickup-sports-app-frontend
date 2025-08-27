import type * as gv from '@/src/utils/gameValidation';
import {describe} from "node:test";

const ORIGINAL_TZ = process.env.TZ;
const OriginalDate = Date;

let parseLocalDateTime: typeof gv.parseLocalDateTime;
let validateCreateGame: typeof gv.validateCreateGame;

function mockTimezone(tz: string) {
  const RealDate = OriginalDate;
  function MockDate(this: any, ...args: any[]) {
    if (!(this instanceof MockDate)) {
      // Called without `new`
      // @ts-ignore
      return RealDate();
    }
    if (args.length >= 3) {
      const [y, m, d, h = 0, mi = 0, s = 0, ms = 0] = args.map(Number);
      const utcMillis = RealDate.UTC(y, m, d, h, mi, s, ms);
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const parts = fmt.formatToParts(new RealDate(utcMillis));
      const vals: Record<string, number> = {};
      for (const p of parts) {
        if (p.type !== 'literal') vals[p.type] = Number(p.value);
      }
      const tzLocalMillis = RealDate.UTC(
        vals.year!,
        vals.month! - 1,
        vals.day!,
        vals.hour!,
        vals.minute!,
        vals.second!
      );
      const offset = tzLocalMillis - utcMillis;
      return new RealDate(utcMillis - offset);
    }
    // @ts-ignore
    return new RealDate(...args);
  }
  MockDate.prototype = RealDate.prototype;
  MockDate.now = RealDate.now.bind(RealDate);
  MockDate.parse = (str: string) => {
    const m = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:Z)?$/);
    if (m && !str.endsWith('Z')) {
      const [, y, mo, d, h, mi, s] = m;
      return new (global as any).Date(
        Number(y),
        Number(mo) - 1,
        Number(d),
        Number(h),
        Number(mi),
        s ? Number(s) : 0,
        0
      ).getTime();
    }
    return RealDate.parse(str);
  };
  MockDate.UTC = RealDate.UTC.bind(RealDate);
  // @ts-ignore
  global.Date = MockDate;
}

function resetTimezoneMock() {
  // @ts-ignore
  global.Date = OriginalDate;
}

beforeAll(() => {
  process.env.TZ = 'America/New_York';
  mockTimezone('America/New_York');
  ({ parseLocalDateTime, validateCreateGame } = require('@/src/utils/gameValidation'));
});

afterAll(() => {
  resetTimezoneMock();
  if (ORIGINAL_TZ === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = ORIGINAL_TZ;
  }
});

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

  test('parseLocalDateTime rejects out-of-range values', () => {
    expect(parseLocalDateTime('2020-13-10T10:00')).toBeNull(); // month
    expect(parseLocalDateTime('2020-00-10T10:00')).toBeNull(); // month
    expect(parseLocalDateTime('2021-02-29T10:00')).toBeNull(); // day
    expect(parseLocalDateTime('2020-01-32T10:00')).toBeNull(); // day
    expect(parseLocalDateTime('2020-01-10T24:00')).toBeNull(); // hour
    expect(parseLocalDateTime('2020-01-10T10:60')).toBeNull(); // minute
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
    const fixedNow = new Date('2030-01-01T00:00:00Z').getTime();
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

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

    nowSpy.mockRestore();
  });

  test('validateCreateGame validates positive maxPlayers', () => {
    const futureISO = new Date(Date.now() + 10 * 60_000).toISOString();
    const { errors, valid } = validateCreateGame({ title: 'Pickup', startsAt: futureISO, maxPlayers: '-1' });
    expect(valid).toBe(false);
    expect(errors.maxPlayers).toBeTruthy();
  });
});
