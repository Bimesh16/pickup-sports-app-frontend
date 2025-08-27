import { useMutation } from '@tanstack/react-query';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';
type LoginBody = { username: string; password: string; mfaCode?: string; rememberDevice?: boolean };

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (body: LoginBody) => {
      const { data } = await api.post('/auth/login', body, { headers: { 'Cache-Control': 'no-store' } });
      if (data?.mfaRequired) {
        // surface challenge to caller
        return { mfaRequired: true, challenge: data.challenge };
      }
      await setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      const me = await api.get('/auth/me', { headers: { 'Cache-Control': 'no-store' } });
      return { user: me.data };
    },
    onSuccess: (res: any) => {
      if (res?.user) {
        setUser(res.user);
      }
    },
  });
}
