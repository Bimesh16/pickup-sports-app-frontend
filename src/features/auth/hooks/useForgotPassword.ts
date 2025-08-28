import { useMutation } from '@tanstack/react-query';
import { api } from '@/src/api/client';
import { buildRequestHeaders, parseRetryAfterSeconds } from '@/src/utils/http';
import { useResendCooldown } from '@/src/stores/resendCooldown';

type ForgotBody = {
  usernameOrEmail: string;
  captchaToken?: string;
  signal?: AbortSignal;
};

export function useForgotPassword() {
  return useMutation<void, Error, ForgotBody>({
    mutationKey: ['auth', 'forgot'],
    mutationFn: async (body: ForgotBody) => {
      try {
        const usernameOrEmail = body.usernameOrEmail?.trim();
        if (!usernameOrEmail) throw new Error('Enter a username or email.');
        const headers = buildRequestHeaders(body.captchaToken);
<<<<<<< Current (Your changes)
        await api.post('/api/v1/auth/forgot', { usernameOrEmail }, { headers, signal: body.signal });
=======
        await api.post('/auth/forgot-password', { email: usernameOrEmail }, { headers, signal: body.signal });
>>>>>>> Incoming (Background Agent changes)
      } catch (e: any) {
        const status = e?.response?.status;
        if (!e?.response) {
          throw new Error('Network unavailable. Please check your connection and try again.');
        }
        let msg = e?.response?.data?.message ?? e?.message ?? 'Request failed';
        if (status === 429) {
          const ra =
            e?.response?.headers?.['retry-after'] ??
            e?.response?.headers?.['Retry-After'] ??
            e?.response?.headers?.retryAfter;
          const secs = parseRetryAfterSeconds(ra);
          if (secs != null) {
            const identity = (body.usernameOrEmail?.trim() || 'unknown') as string;
            const key = `forgot:${identity}`;
            const interval = 60_000;
            const atMs = Date.now() - Math.max(0, interval - secs * 1000);
            useResendCooldown.getState().markSent(key, atMs);
          }
          msg = secs != null ? `Too many attempts. Try again in ${secs}s.` : 'Too many attempts. Please wait and try again.';
        }
        throw new Error(msg);
      }
    },
  });
}
