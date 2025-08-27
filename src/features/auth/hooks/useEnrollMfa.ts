import { useMutation } from '@tanstack/react-query';
import { enrollMfa } from '@/src/features/auth/api';
import { useAuthStore } from '@/src/stores/auth';

export function useEnrollMfa() {
  const setMfaEnabled = useAuthStore((s) => s.setMfaEnabled);

  return useMutation({
    mutationFn: (body: { code: string }) => enrollMfa(body),
    onSuccess: () => {
      setMfaEnabled(true);
    },
  });
}
