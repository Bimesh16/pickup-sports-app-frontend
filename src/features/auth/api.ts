import { api, setTokens } from '@/src/api/client';
import type { User, LoginRequest, RegisterRequest } from '@/src/types/api';

export type AuthSession = {
  id: string;
  userAgent?: string;
  createdAt?: string;
  lastActiveAt?: string;
  current?: boolean;
};

// Login API matching backend spec
export async function login(credentials: LoginRequest): Promise<{
  token: string;
  user: User;
}> {
  const { data } = await api.post('/api/v1/auth/login', credentials, {
    headers: { 'Cache-Control': 'no-store' }
  });
  await setTokens({ accessToken: data.token });
  return data;
}

// Register API matching backend spec
export async function register(userData: RegisterRequest): Promise<{
  token: string;
  user: User;
}> {
  const { data } = await api.post('/api/v1/auth/register', userData, {
    headers: { 'Cache-Control': 'no-store' }
  });
  await setTokens({ accessToken: data.token });
  return data;
}

export async function refresh(body: { refreshToken?: string } = {}) {
  const { data } = await api.post('/api/v1/auth/refresh', body, { headers: { 'Cache-Control': 'no-store' } });
  await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function verifyMfa(body: {
  username: string;
  code: string;
  rememberDevice?: boolean;
}) {
  const { data } = await api.post('/api/v1/auth/mfa/verify', body, { headers: { 'Cache-Control': 'no-store' } });
  await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data;
}

export async function enrollMfa(body: { code: string }) {
  const { data } = await api.post('/api/v1/auth/mfa/enroll', body, { headers: { 'Cache-Control': 'no-store' } });
  return data;
}

export async function listSessions(): Promise<AuthSession[]> {
  const { data } = await api.get('/api/v1/auth/sessions', { headers: { 'Cache-Control': 'no-store' } });
  return data;
}

export async function revokeSession(id: string): Promise<void> {
  await api.delete(`/api/v1/auth/sessions/${id}`, { headers: { 'Cache-Control': 'no-store' } });
}

export async function requestPasswordReset(usernameOrEmail: string): Promise<void> {
  await api.post('/api/v1/auth/forgot', { usernameOrEmail }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function verifyPasswordReset(token: string, password: string): Promise<void> {
  await api.post('/api/v1/auth/reset', { token, password }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/v1/auth/logout', null, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    // ignore network/backend logout errors; we'll still clear local state
  } finally {
    await setTokens(null);
  }
}
