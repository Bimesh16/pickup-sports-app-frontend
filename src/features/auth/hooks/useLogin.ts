import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, setTokens } from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth';
import { debugLoginResponse, debugTokenStorage } from '@/src/utils/auth-debug';

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

        const { data } = await api.post('/auth/login', body, {
          headers,
          signal: body.signal,
        });

        // Debug the login response
        debugLoginResponse(data);

        if (data?.mfaRequired) {
          // Surface MFA challenge to caller (e.g., to navigate to MFA screen)
          return { mfaRequired: true, challenge: data.challenge as string };
        }

        // Normal login path: store tokens and fetch current user
        // Check both possible token field names from backend
        const accessToken = data?.accessToken || data?.token;
        const refreshToken = data?.refreshToken;
        
        if (accessToken) {
          const tokens = { 
            accessToken, 
            refreshToken: refreshToken || undefined 
          };
          debugTokenStorage(tokens);
          
          // Add web-specific debugging
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            console.log('🔍 Web Login: Setting tokens for web environment');
            console.log('🔍 Web Login: Access token length:', accessToken.length);
            console.log('🔍 Web Login: Refresh token exists:', !!refreshToken);
          }
          
          await setTokens(tokens);
          
          // Verify tokens were stored (web-specific)
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            try {
              const storedAccessToken = localStorage.getItem('accessToken');
              const storedRefreshToken = localStorage.getItem('refreshToken');
              console.log('🔍 Web Login: Tokens stored successfully:', {
                accessTokenStored: !!storedAccessToken,
                refreshTokenStored: !!storedRefreshToken,
                accessTokenLength: storedAccessToken?.length || 0,
                refreshTokenLength: storedRefreshToken?.length || 0,
              });
            } catch (error) {
              console.error('🔍 Web Login: Error verifying token storage:', error);
            }
          }
        }

        // Create user object from login response and username
        const userData = {
          username: body.username,
          authenticated: true,
          roles: data.user?.roles || ['USER'], // Default role if none provided
          displayName: data.user?.displayName || body.username,
          avatarUrl: data.user?.avatarUrl || null,
          id: data.user?.id,
          email: data.user?.email,
          firstName: data.user?.firstName,
          lastName: data.user?.lastName,
          skillLevel: data.user?.skillLevel || 'BEGINNER',
          createdAt: data.user?.createdAt,
          updatedAt: data.user?.updatedAt,
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
        console.log('🔍 Login Success: Setting user in auth store:', res.user);
        setUser(res.user);
        
        // Web-specific debugging
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          try {
            console.log('🔍 Web Login: User set in auth store, checking web storage');
            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('🔍 Web Login: Final web storage state:', {
              accessToken: !!accessToken,
              refreshToken: !!refreshToken,
              userSet: true,
            });
          } catch (error) {
            console.error('🔍 Web Login: Error checking web storage:', error);
          }
        }
        
        // Refresh queries that depend on auth state
        void qc.invalidateQueries();
      }
      // When MFA is required, the caller will handle navigation using the returned challenge
    },
  });
}
