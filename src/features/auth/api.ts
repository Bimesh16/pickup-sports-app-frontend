import { api, setTokens } from '@/src/api/client';

export type AuthSession = {
  id: string;
  userAgent?: string;
  createdAt?: string;
  lastActiveAt?: string;
  current?: boolean;
};

export async function refresh(body: { refreshToken?: string } = {}) {
  const { data } = await api.post('/auth/refresh', body, { headers: { 'Cache-Control': 'no-store' } });
  await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function verifyMfa(body: {
  username: string;
  code: string;
  rememberDevice?: boolean;
}) {
  const { data } = await api.post('/auth/mfa/verify', body, { headers: { 'Cache-Control': 'no-store' } });
  await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function enrollMfa(body: { code: string }) {
  const { data } = await api.post('/auth/mfa/enroll', body, { headers: { 'Cache-Control': 'no-store' } });
  return data;
}

export async function listSessions(): Promise<AuthSession[]> {
  const { data } = await api.get('/auth/sessions', { headers: { 'Cache-Control': 'no-store' } });
  return data;
}

export async function revokeSession(id: string): Promise<void> {
  await api.delete(`/auth/sessions/${id}`, { headers: { 'Cache-Control': 'no-store' } });
}

export async function requestPasswordReset(usernameOrEmail: string): Promise<void> {
  await api.post('/auth/forgot', { usernameOrEmail }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function verifyPasswordReset(token: string, password: string): Promise<void> {
  await api.post('/auth/reset', { token, password }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout', null, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    // ignore network/backend logout errors; we'll still clear local state
  } finally {
    await setTokens(null);
  }
}
