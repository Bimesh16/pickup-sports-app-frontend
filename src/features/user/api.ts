import { api } from '@/src/api/client';
import type { AuthUser } from '@/src/stores/auth';

export async function getProfile(): Promise<AuthUser> {
  const { data } = await api.get('/users/me', { headers: { 'Cache-Control': 'no-store' } });
  return data as AuthUser;
}

export async function updateProfile(input: Partial<Pick<AuthUser, 'displayName' | 'avatarUrl'>>): Promise<AuthUser> {
  const { data } = await api.put('/users/me', input, { headers: { 'Cache-Control': 'no-store' } });
  return data as AuthUser;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword }, { headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Upload avatar image file and return absolute URL.
 * Backend endpoint assumed: POST /users/me/avatar -> { url: string }
 */
export async function uploadAvatar(fileUri: string, onProgress?: (progress01: number) => void): Promise<string> {
  const form = new FormData();
  const name = fileUri.split('/').pop() || 'avatar.jpg';
  const type = name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  // @ts-ignore RN FormData file shape
  form.append('file', { uri: fileUri, name, type });

  const { data } = await api.post('/users/me/avatar', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Cache-Control': 'no-store',
    },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) onProgress(evt.loaded / evt.total);
    },
  });
  if (typeof data?.url === 'string') return data.url as string;
  if (typeof data?.avatarUrl === 'string') return data.avatarUrl as string;
  throw new Error('Upload failed');
}
