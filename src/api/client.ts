import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

type TokenPair = { accessToken: string; refreshToken?: string; expiresAt?: number; nonce?: string };

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const IS_WEB = typeof window !== 'undefined' && typeof document !== 'undefined';

let accessToken: string | null = null;
let isRefreshing = false;
let pendingQueue: Array<(t: string | null) => void> = [];

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // cookie refresh flow (backend must allow credentials for web)
  headers: { 'Cache-Control': 'no-store' },
});

export async function setTokens(tokens: TokenPair | null) {
  accessToken = tokens?.accessToken ?? null;
  if (!IS_WEB) {
    if (tokens?.refreshToken) {
      await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    } else {
      await SecureStore.deleteItemAsync('refreshToken');
    }
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (IS_WEB) return null; // expect HttpOnly cookie on web
  return (await SecureStore.getItemAsync('refreshToken')) ?? null;
}

function waitForRefresh(): Promise<string | null> {
  return new Promise((resolve) => pendingQueue.push(resolve));
}

function backoffDelay(retry: number) {
  const base = Math.min(1000 * 2 ** retry, 8000);
  return base + Math.floor(Math.random() * 250);
}

async function refreshTokens() {
  if (isRefreshing) return waitForRefresh();
  isRefreshing = true;
  try {
    const body: any = {};
    const rt = await getRefreshToken();
    if (rt) body.refreshToken = rt;
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, body, {
      withCredentials: true,
      headers: { 'Cache-Control': 'no-store' },
    });
    await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    pendingQueue.forEach((fn) => fn(data.accessToken));
    return data.accessToken as string;
  } catch (_e) {
    pendingQueue.forEach((fn) => fn(null));
    await setTokens(null);
    return null;
  } finally {
    pendingQueue = [];
    isRefreshing = false;
  }
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config!;
    // 401 -> attempt token refresh once
    if (status === 401 && !(original as any).__isRetry) {
      (original as any).__isRetry = true;
      const newToken = await refreshTokens();
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
    }
    // 429 -> backoff retry (max 3)
    if (status === 429) {
      const retries = ((original as any).__retries ?? 0) + 1;
      if (retries <= 3) {
        (original as any).__retries = retries;
        await new Promise((r) => setTimeout(r, backoffDelay(retries)));
        return api.request(original);
      }
    }
    // Normalize backend error payload {error, message, timestamp}
    const data: any = error.response?.data;
    const normalized = {
      error: data?.error ?? 'unknown_error',
      message: data?.message ?? error.message,
      timestamp: data?.timestamp ?? Date.now(),
      status,
    };
    return Promise.reject(normalized);
  }
);
