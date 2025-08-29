import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

type TokenPair = { accessToken: string; refreshToken?: string; expiresAt?: number; nonce?: string };

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
// More robust web environment detection
const IS_WEB = typeof window !== 'undefined' && 
               typeof document !== 'undefined' && 
               typeof localStorage !== 'undefined' &&
               typeof window.localStorage !== 'undefined';

// Fallback: Check if we're in a web-like environment but localStorage might not be available
const IS_WEB_LIKE = typeof window !== 'undefined' && typeof document !== 'undefined';

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
  
  console.log('🔍 setTokens called:', {
    IS_WEB,
    hasAccessToken: !!tokens?.accessToken,
    hasRefreshToken: !!tokens?.refreshToken,
    accessTokenLength: tokens?.accessToken?.length || 0,
    refreshTokenLength: tokens?.refreshToken?.length || 0,
  });
  
  if (IS_WEB && typeof localStorage !== 'undefined') {
    // Web: Store tokens in localStorage for persistence
    console.log('🔍 Web: Storing tokens in localStorage');
    
    if (tokens?.accessToken) {
      try {
        localStorage.setItem('accessToken', tokens.accessToken);
        console.log('🔍 Web: Access token stored successfully');
      } catch (error) {
        console.error('🔍 Web: Error storing access token:', error);
      }
    } else {
      try {
        localStorage.removeItem('accessToken');
        console.log('🔍 Web: Access token removed');
      } catch (error) {
        console.error('🔍 Web: Error removing access token:', error);
      }
    }
    
    if (tokens?.refreshToken) {
      try {
        localStorage.setItem('refreshToken', tokens.refreshToken);
        console.log('🔍 Web: Refresh token stored successfully');
      } catch (error) {
        console.error('🔍 Web: Error storing refresh token:', error);
      }
    } else {
      try {
        localStorage.removeItem('refreshToken');
        console.log('🔍 Web: Refresh token removed');
      } catch (error) {
        console.error('🔍 Web: Error removing refresh token:', error);
      }
    }
    
    // Verify storage
    try {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      console.log('🔍 Web: Storage verification:', {
        accessTokenStored: !!storedAccessToken,
        refreshTokenStored: !!storedRefreshToken,
      });
    } catch (error) {
      console.error('🔍 Web: Error verifying storage:', error);
    }
    
    // Also set the in-memory accessToken for immediate use
    if (tokens?.accessToken) {
      accessToken = tokens.accessToken;
      console.log('🔍 Web: In-memory accessToken set for immediate use');
    }
  } else if (IS_WEB_LIKE && typeof localStorage === 'undefined') {
    // Web-like environment but localStorage not available (e.g., React Native Web)
    console.log('🔍 Web-like: localStorage not available, using in-memory only');
    
    // Set the in-memory accessToken for immediate use
    if (tokens?.accessToken) {
      accessToken = tokens.accessToken;
      console.log('🔍 Web-like: In-memory accessToken set for immediate use');
    }
  } else {
    // Native: Use SecureStore
    console.log('🔍 Native: Storing tokens in SecureStore');
    if (tokens?.refreshToken) {
      await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    } else {
      await SecureStore.deleteItemAsync('refreshToken');
    }
  }
}

export async function getStoredTokens(): Promise<{ refreshToken: string; accessToken?: string } | null> {
  if (IS_WEB && typeof localStorage !== 'undefined') {
    // Web: Get tokens from localStorage
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      
      if (refreshToken) {
        return { refreshToken, accessToken: accessToken || undefined };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving tokens from localStorage:', error);
      return null;
    }
  } else if (IS_WEB_LIKE && typeof localStorage === 'undefined') {
    // Web-like environment but localStorage not available
    console.log('🔍 Web-like: localStorage not available, cannot retrieve stored tokens');
    return null;
  } else {
    // Native: Get tokens from SecureStore
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        return { refreshToken };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving tokens from SecureStore:', error);
      return null;
    }
  }
}

// Keep the existing setTokens and getTokens (for in-memory access)
export function getTokens(): TokenPair | null {
  if (!accessToken) return null;
  return { accessToken };
}

// Function to log environment details for debugging
export function logEnvironmentDetails(): void {
  console.log('🔍 Environment Details:', {
    hasWindow: typeof window !== 'undefined',
    hasDocument: typeof document !== 'undefined',
    hasLocalStorage: typeof localStorage !== 'undefined',
    hasWindowLocalStorage: typeof window !== 'undefined' && typeof window.localStorage !== 'undefined',
    IS_WEB,
    IS_WEB_LIKE,
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  });
  
  // Test localStorage access if available
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('test', 'test-value');
      const testValue = localStorage.getItem('test');
      localStorage.removeItem('test');
      console.log('🔍 localStorage test:', { success: testValue === 'test-value' });
    } catch (error) {
      console.error('🔍 localStorage test failed:', error);
    }
  }
}

// Function to restore tokens from web storage on startup
export function restoreTokensFromWebStorage(): void {
  if (IS_WEB && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const storedAccessToken = localStorage.getItem('accessToken');
      if (storedAccessToken) {
        accessToken = storedAccessToken;
        console.log('🔍 Web: Restored access token from localStorage on startup');
      }
    } catch (error) {
      console.error('🔍 Web: Error restoring tokens from localStorage:', error);
    }
  } else if (IS_WEB_LIKE && typeof localStorage === 'undefined') {
    console.log('🔍 Web-like: localStorage not available, skipping token restoration');
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (IS_WEB && typeof localStorage !== 'undefined') {
    // Web: Get refresh token from localStorage
    try {
      return localStorage.getItem('refreshToken');
      } catch (error) {
      console.error('Error getting refresh token from localStorage:', error);
      return null;
    }
  } else {
    // Native: Get from SecureStore
    return (await SecureStore.getItemAsync('refreshToken')) ?? null;
  }
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
    console.log('🔍 API Request with token:', {
      url: config.url,
      hasToken: !!accessToken,
      tokenStart: accessToken.substring(0, 10) + '...',
    });
  } else {
    console.log('🔍 API Request without token:', config.url);
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
