/**
 * 🔍 Authentication Debug Utilities
 * Helper functions to debug auth flow and token handling
 */

export function debugLoginResponse(response: any) {
  console.log('🔍 Login Response Debug:', {
    responseKeys: Object.keys(response || {}),
    hasToken: !!response?.token,
    hasAccessToken: !!response?.accessToken,
    hasRefreshToken: !!response?.refreshToken,
    hasUser: !!response?.user,
    userKeys: response?.user ? Object.keys(response.user) : null,
    fullResponse: response,
  });
}

export function debugTokenStorage(tokens: any) {
  console.log('🔍 Token Storage Debug:', {
    accessToken: tokens?.accessToken ? 'Present' : 'Missing',
    refreshToken: tokens?.refreshToken ? 'Present' : 'Missing',
    tokenLength: tokens?.accessToken?.length || 0,
  });
}

export function debugApiRequest(config: any) {
  console.log('🔍 API Request Debug:', {
    url: config.url,
    method: config.method,
    hasAuthHeader: !!config.headers?.Authorization,
    authHeader: config.headers?.Authorization?.substring(0, 20) + '...',
  });
}
