import { useMutation } from '@tanstack/react-query';
import { verifyPasswordReset } from '@/src/features/auth/api';

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      verifyPasswordReset(token, password),
  });
}
