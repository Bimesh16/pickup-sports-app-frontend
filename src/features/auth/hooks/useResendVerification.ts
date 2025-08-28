import { useMutation } from '@tanstack/react-query';
import { api } from '@/src/api/client';
import {generateRequestId} from "@/src/utils/ids";
import {buildRequestHeaders} from "@/src/utils/http";

type ResendVerificationBody = {
  email?: string;
  username?: string;
  captchaToken?: string;
};

export function useResendVerification() {
  return useMutation<void, Error, ResendVerificationBody>({
    mutationFn: async (body: ResendVerificationBody) => {
      try {
        const headers = buildRequestHeaders(body.captchaToken);
        // Support either email or username
        await api.post('/auth/verify/resend', body, { headers });
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? e?.message ?? 'Could not resend verification email';
        throw new Error(msg);
      }
    },
  });
}
