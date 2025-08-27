import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset } from '@/src/features/auth/api';

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (usernameOrEmail: string) => requestPasswordReset(usernameOrEmail),
  });
}
