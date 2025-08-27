export function validateDisplayName(name: string): string | null {
  const n = (name || '').trim();
  if (n.length === 0) return 'Display name is required';
  if (n.length < 2) return 'Display name must be at least 2 characters';
  if (n.length > 40) return 'Display name is too long';
  return null;
}

export function validateUrlOptional(url?: string | null): string | null {
  const u = (url || '').trim();
  if (!u) return null;
  try {
    const parsed = new URL(u);
    if (!/^https?:$/.test(parsed.protocol)) {
      return 'URL must start with http or https';
    }
  } catch {
    return 'Invalid URL';
  }
  return null;
}

export function validatePassword(pw: string): string | null {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters';
  const hasLetter = /[A-Za-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  if (!hasLetter || !hasNumber) return 'Use letters and numbers';
  return null;
}
