import { useEffect, useState } from 'react';
import { useAuthStore } from '@/src/stores/auth';

/**
 * Bootstraps the authenticated user session on app start.
 * - Provides loading state while app initializes
 * - Does not interfere with login process
 * - Exposes an isBootstrapping flag for gating initial UI
 */
export function useAuthBootstrap() {
  const [isBootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        console.log('🔍 AuthBootstrap: Starting bootstrap...');
        
        // Log environment details for debugging
        if (typeof window !== 'undefined') {
          const { logEnvironmentDetails } = await import('@/src/api/client');
          logEnvironmentDetails();
        }
        
        // Restore tokens from web storage on startup
        if (typeof window !== 'undefined') {
          const { restoreTokensFromWebStorage } = await import('@/src/api/client');
          restoreTokensFromWebStorage();
        }
        
        // Check if we have stored refresh tokens
        const { getStoredTokens } = await import('@/src/api/client');
        const storedTokens = await getStoredTokens();
        
        console.log('🔍 AuthBootstrap: Stored refresh token found:', !!storedTokens?.refreshToken);
        
        // Web-specific debugging
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          console.log('🔍 AuthBootstrap: Web environment detected');
          try {
            const webAccessToken = localStorage.getItem('accessToken');
            const webRefreshToken = localStorage.getItem('refreshToken');
            console.log('🔍 AuthBootstrap: Web storage tokens:', {
              accessToken: !!webAccessToken,
              refreshToken: !!webRefreshToken,
              accessTokenLength: webAccessToken?.length || 0,
              refreshTokenLength: webRefreshToken?.length || 0,
            });
          } catch (error) {
            console.error('🔍 AuthBootstrap: Error accessing localStorage:', error);
          }
        }
        
        if (storedTokens?.refreshToken && !cancelled) {
          // We have a refresh token, try to get new access token and user data
          try {
            console.log('🔍 AuthBootstrap: Attempting token refresh...');
            const { api, setTokens } = await import('@/src/api/client');
            
            // Use refresh token to get new access token
            const { data } = await api.post('/auth/refresh', { 
              refreshToken: storedTokens.refreshToken 
            }, { 
              headers: { 'Cache-Control': 'no-store' } 
            });
            
            if (data?.accessToken && !cancelled) {
              // Store the new tokens
              await setTokens({ 
                accessToken: data.accessToken, 
                refreshToken: data.refreshToken || storedTokens.refreshToken 
              });
              
              // Now fetch user data with the new access token
              const userResponse = await api.get('/auth/me', { 
                headers: { 'Cache-Control': 'no-store' } 
              });
              
              if (userResponse.data?.user && !cancelled) {
                console.log('🔍 AuthBootstrap: User data fetched successfully');
                const userData = {
                  username: userResponse.data.user.username || 'user',
                  roles: userResponse.data.user.roles || ['USER'],
                  authenticated: true,
                  displayName: userResponse.data.user.displayName || userResponse.data.user.username,
                  avatarUrl: userResponse.data.user.avatarUrl || null,
                  id: userResponse.data.user.id,
                  email: userResponse.data.user.email,
                  firstName: userResponse.data.user.firstName,
                  lastName: userResponse.data.user.lastName,
                  skillLevel: userResponse.data.user.skillLevel || 'BEGINNER',
                  createdAt: userResponse.data.user.createdAt,
                  updatedAt: userResponse.data.user.updatedAt,
                };
                setUser(userData);
                console.log('🔍 AuthBootstrap: User session restored successfully');
              }
            }
          } catch (e) {
            console.log('🔍 AuthBootstrap: Token refresh failed, clearing tokens:', e);
            // Refresh failed, clear stored tokens
            const { setTokens } = await import('@/src/api/client');
            await setTokens(null);
          }
        } else {
          console.log('🔍 AuthBootstrap: No stored tokens found, user will remain null');
        }
      } catch (e) {
        if (!cancelled) {
          console.error('🔍 AuthBootstrap: Error during bootstrap:', e);
          setError(e as Error);
        }
      } finally {
        if (!cancelled) {
          console.log('🔍 AuthBootstrap: Bootstrap completed, setting isBootstrapping to false');
          setBootstrapping(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  return { isBootstrapping, error };
}
