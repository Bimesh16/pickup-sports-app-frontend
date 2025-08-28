import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { api, setTokens } from '@/src/api/client';

/**
 * Sets up a response interceptor that:
 * - On 401/419, attempts to refresh tokens via /auth/refresh
 * - If refresh succeeds, retries the original request once
 * - If refresh fails, clears tokens and rejects
 *
 * Pass a specific Axios instance (defaults to the shared api client).
 */
export function setupAuthInterceptors(instance: AxiosInstance = api) {
  let isRefreshing = false;
  let pendingQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  const processQueue = (error: any, tokenSet?: { accessToken: string; refreshToken: string }) => {
    pendingQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(tokenSet);
    });
    pendingQueue = [];
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Only handle auth-related statuses and avoid infinite loops
      if ((status === 401 || status === 419) && !original._retry) {
        if (isRefreshing) {
          // Queue the request until refresh completes
          return new Promise((resolve, reject) => {
            pendingQueue.push({
              resolve: async () => {
                try {
                  original._retry = true;
                  resolve(await instance(original));
                } catch (e) {
                  reject(e);
                }
              },
              reject,
            });
          });
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const { data } = await instance.post(
            '/api/v1/auth/refresh',
            null,
            { headers: { 'Cache-Control': 'no-store' } }
          );

          if (data?.accessToken && data?.refreshToken) {
            await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          }

          processQueue(null, data);
          // Retry the original request with new tokens
          return instance(original);
        } catch (refreshErr) {
          // Clear tokens and reject all queued requests
          try {
            await setTokens(null);
          } catch {
            // ignore
          }
          processQueue(refreshErr, undefined);
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
