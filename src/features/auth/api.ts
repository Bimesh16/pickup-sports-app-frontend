import { api, setTokens } from '@/src/api/client';

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout', null, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    // ignore network/backend logout errors; we'll still clear local state
  } finally {
    await setTokens(null);
  }
}
