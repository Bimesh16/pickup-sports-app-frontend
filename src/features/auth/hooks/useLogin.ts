import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';

export type LoginBody = {
  username: string;
  password: string;
  mfaCode?: string;
  rememberDevice?: boolean;
  // Optional CAPTCHA token if your backend expects it
  captchaToken?: string;
  // Optional abort signal for cancellation
  signal?: AbortSignal;
};

export type LoginResult =
  | { mfaRequired: true; challenge: string }
  | { user: any };

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  return useMutation<LoginResult, Error, LoginBody>({
    mutationKey: ['auth', 'login'],
    mutationFn: async (body: LoginBody) => {
      try {
        const headers: Record<string, string> = { 'Cache-Control': 'no-store' };
        if (body.captchaToken) headers['X-Captcha-Token'] = body.captchaToken;

        const { data } = await api.post('/api/v1/auth/login', body, {
          headers,
          signal: body.signal,
        });

        if (data?.mfaRequired) {
          // Surface MFA challenge to caller (e.g., to navigate to MFA screen)
          return { mfaRequired: true, challenge: data.challenge as string };
        }

        // Normal login path: store tokens and fetch current user
        if (data?.accessToken && data?.refreshToken) {
          await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        }

        const me = await api.get('/api/v1/auth/me', { headers: { 'Cache-Control': 'no-store' } });
        // Ensure the user object has the required structure
        const userData = {
          ...me.data,
          authenticated: true, // Always set this to true after successful login
        };
        return { user: userData };
      } catch (e: any) {
        // Provide clearer auth error messages
        const status = e?.response?.status;
        let msg =
          e?.response?.data?.message ??
          e?.message ??
          'Login failed. Please try again.';
        if (status === 401) {
          msg = 'Invalid credentials. Please check your username and password.';
        } else if (status === 423) {
          msg = 'Your account is locked or requires verification.';
        } else if (status === 429) {
          msg = 'Too many attempts. Please try again in a moment.';
        }
        throw new Error(msg);
      }
    },
    onSuccess: (res) => {
      if ('user' in res && res.user) {
        setUser(res.user);
        // Refresh queries that depend on auth state
        void qc.invalidateQueries();
      }
      // When MFA is required, the caller will handle navigation using the returned challenge
    },
  });
}
