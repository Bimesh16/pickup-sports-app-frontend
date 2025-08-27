export function parseLocalDateTime(input: string): Date | null {
  if (!input) return null;
  // Accept ISO or "YYYY-MM-DDTHH:mm"
  const iso = Date.parse(input);
  if (!Number.isNaN(iso)) return new Date(iso);
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/);
  if (!m) return null;
  const [_, y, mo, d, h, mi] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
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
