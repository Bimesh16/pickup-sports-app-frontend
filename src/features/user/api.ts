import { api } from '@/src/api/client';
import type { AuthUser } from '@/src/stores/auth';

type ProfileResponse = { profile: AuthUser; etag?: string };

export async function getProfile(): Promise<ProfileResponse> {
  const { data, headers } = await api.get('/profiles/me', { headers: { 'Cache-Control': 'no-store' } });
  return { profile: data as AuthUser, etag: headers['etag'] };
}

export async function updateProfile(
  input: Partial<Pick<AuthUser, 'displayName' | 'avatarUrl'>>,
  etag?: string
): Promise<ProfileResponse> {
  const { data, headers } = await api.put('/profiles/me', input, {
    headers: {
      'Cache-Control': 'no-store',
      ...(etag ? { 'If-Match': etag } : {}),
    },
  });
  return { profile: data as AuthUser, etag: headers['etag'] };
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function changeEmail(newEmail: string): Promise<void> {
  await api.post('/auth/change-email', { newEmail }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function getEmailVerificationStatus(): Promise<boolean> {
  const { data } = await api.get('/auth/verification-status', {
    headers: { 'Cache-Control': 'no-store' },
  });
  return !!data?.verified;
}

export async function resendVerificationEmail(): Promise<void> {
  await api.post('/auth/resend-verification', undefined, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

/**
 * Upload avatar image file and return absolute URL along with latest ETag.
 * Backend endpoint: POST /profiles/me/avatar -> { url: string }
 */
export async function uploadAvatar(
  fileUri: string,
  etag?: string,
  onProgress?: (progress01: number) => void,
  signal?: AbortSignal
): Promise<{ url: string; etag?: string }> {
  const form = new FormData();
  const name = fileUri.split('/').pop() || 'avatar.jpg';
  const type = name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  // @ts-ignore RN FormData file shape
  form.append('file', { uri: fileUri, name, type });

  const { data, headers } = await api.post('/profiles/me/avatar', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Cache-Control': 'no-store',
      ...(etag ? { 'If-Match': etag } : {}),
    },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) onProgress(evt.loaded / evt.total);
    },
    signal,
  });
  const url = typeof data?.url === 'string' ? (data.url as string) : (data?.avatarUrl as string | undefined);
  if (url) return { url, etag: headers['etag'] };
  throw new Error('Upload failed');
}

/** Delete current avatar image. */
export async function deleteAvatar(etag?: string): Promise<{ etag?: string }> {
  const { headers } = await api.delete('/profiles/me/avatar', {
    headers: {
      'Cache-Control': 'no-store',
      ...(etag ? { 'If-Match': etag } : {}),
    },
  });
  return { etag: headers['etag'] };
}
