import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';

type MfaVerifyBody = {
  username: string;
  mfaCode: string;
  rememberDevice?: boolean;
  captchaToken?: string;
};

type MfaVerifyResult = { user: any };

export function useMfaVerify() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  return useMutation<MfaVerifyResult, Error, MfaVerifyBody>({
    mutationFn: async (body: MfaVerifyBody) => {
      try {
        const headers: Record<string, string> = { 'Cache-Control': 'no-store' };
        if (body.captchaToken) headers['X-Captcha-Token'] = body.captchaToken;

        const { data } = await api.post('/auth/mfa/challenge', body, { headers });

        if (data?.accessToken && data?.refreshToken) {
          await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        }

        // Get user info from MFA response (should include user data)
        const userData = {
          ...data.user,
          authenticated: true, // Always set this to true after successful MFA verification
        };
        return { user: userData };
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ??
          e?.message ??
          'MFA verification failed. Please try again.';
        throw new Error(msg);
      }
    },
    onSuccess: async (res) => {
      if (res?.user) {
        setUser(res.user);
        // Refresh any auth-dependent queries
        await qc.invalidateQueries();
      }
    },
  });
}
