import { useMutation } from '@tanstack/react-query';
import { api } from '@/src/api/client';

export type RegisterBody = {
  username: string;
  email: string;
  password: string;
  captchaToken?: string;
};

export type RegisterResult =
  | { registered: true; verificationRequired?: boolean }
  | { mfaRequired: true; challenge: string };

export function useRegister() {
  return useMutation<RegisterResult, Error, RegisterBody>({
    mutationFn: async (body: RegisterBody) => {
      try {
        const headers: Record<string, string> = { 'Cache-Control': 'no-store' };
        if (body.captchaToken) headers['X-Captcha-Token'] = body.captchaToken;

        const { data } = await api.post('/users/register', body, { headers });

        if (data?.mfaRequired) {
          return { mfaRequired: true, challenge: data.challenge as string };
        }
        // Some backends require email verification; surface that to the caller
        return { registered: true, verificationRequired: !!data?.verificationRequired };
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ??
          e?.message ??
          'Registration failed. Please try again.';
        throw new Error(msg);
      }
    },
  });
}
