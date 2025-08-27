export function parseLocalDateTime(input: string): Date | null {
  if (!input) return null;
  // Accept ISO (UTC) or "YYYY-MM-DDTHH:mm" (local)
  let m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(\.\d+)?)?Z$/);
  if (m) {
    const [_, y, mo, d, h, mi, s] = m;
    const year = Number(y);
    const month = Number(mo);
    const day = Number(d);
    const hour = Number(h);
    const minute = Number(mi);
    const second = Number(s ?? '0');

    if (month < 1 || month > 12) return null;
    if (hour < 0 || hour > 23) return null;
    if (minute < 0 || minute > 59) return null;
    if (second < 0 || second > 59) return null;
    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) return null;

    return new Date(Date.UTC(year, month - 1, day, hour, minute, second, 0));
  }

  m = input.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/);
  if (!m) return null;
  const [_, y, mo, d, h, mi] = m;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  const hour = Number(h);
  const minute = Number(mi);

  if (month < 1 || month > 12) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) return null;

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function validateCreateGame(fields: { title: string; startsAt: string; maxPlayers?: string }) {
  const errors: Partial<Record<'title' | 'startsAt' | 'maxPlayers', string>> = {};
  const title = fields.title.trim();
  if (!title) errors.title = 'Title is required';

  const dt = parseLocalDateTime(fields.startsAt);
  if (!dt) {
    errors.startsAt = 'Enter a valid date and time';
  } else {
    // Require future time (5-minute grace to avoid edge cases)
    const now = Date.now();
    if (dt.getTime() < now + 5 * 60 * 1000) {
      errors.startsAt = 'Date/time must be in the future';
    }
  }

  const mp = fields.maxPlayers?.trim();
  if (mp) {
    const n = Number(mp);
    if (!Number.isFinite(n) || n <= 0) errors.maxPlayers = 'Must be a positive number';
  }
  return { errors, valid: Object.keys(errors).length === 0, date: dt ?? null };
}
