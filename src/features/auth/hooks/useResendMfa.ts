import { useMutation } from '@tanstack/react-query';
import { api } from '@/src/api/client';
import { buildRequestHeaders, parseRetryAfterSeconds } from '@/src/utils/http';
import { useResendCooldown } from '@/src/stores/resendCooldown';

type ResendBody = {
  username?: string;
  email?: string;
  captchaToken?: string;
  signal?: AbortSignal;
};

export function useResendMfa() {
  return useMutation<void, Error, ResendBody>({
    mutationKey: ['auth', 'mfa', 'resend'],
    mutationFn: async (body: ResendBody) => {
      try {
        const username = body.username?.trim();
        const email = body.email?.trim();

        if (!username && !email) {
          throw new Error('Provide a username or email to resend the code.');
        }
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          throw new Error('Enter a valid email address.');
        }

        const headers = buildRequestHeaders(body.captchaToken);
        await api.post('/api/v1/auth/mfa/resend', { username, email }, { headers, signal: body.signal });
      } catch (e: any) {
        const status = e?.response?.status;
        // If there is no response at all, treat as offline/network issue
        if (!e?.response) {
          throw new Error('Network unavailable. Please check your connection and try again.');
        }
        let msg = e?.response?.data?.message ?? e?.message ?? 'Failed to resend code';
        if (status === 401) {
          msg = 'Not authorized to resend the code.';
        } else if (status === 423) {
          msg = 'Account locked or verification required.';
        } else if (status === 429) {
          // Honor Retry-After header if provided: mark cooldown so UI matches server
          const raHeader =
            e?.response?.headers?.['retry-after'] ??
            e?.response?.headers?.['Retry-After'] ??
            e?.response?.headers?.retryAfter;
          const secs = parseRetryAfterSeconds(raHeader);
          if (secs != null) {
            const identity = (body.username?.trim() || body.email?.trim() || 'unknown') as string;
            const key = `mfa:${identity}`;
            const interval = 30_000;
            // Mark as if we sent now - (interval - secs*1000) so remaining ≈ secs
            const atMs = Date.now() - Math.max(0, interval - secs * 1000);
            useResendCooldown.getState().markSent(key, atMs);
          }
          msg = secs != null
            ? `Too many attempts. Try again in ${secs}s.`
            : 'Too many attempts. Please wait and try again.';
        }
        throw new Error(msg);
      }
    },
  });
}
