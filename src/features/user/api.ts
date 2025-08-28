import { api } from '@/src/api/client';
import type { User, SkillLevel } from '@/src/types/api';

// User Management APIs matching backend spec
export async function fetchProfile(): Promise<User> {
  const { data } = await api.get('/api/v1/users/profile', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function updateProfile(profileData: {
  firstName?: string;
  lastName?: string;
  skillLevel?: SkillLevel;
}): Promise<User> {
  const { data } = await api.put('/api/v1/users/profile', profileData, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get('/api/v1/users', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

// Legacy API - keeping for backward compatibility but updating to use new types
type ProfileResponse = { profile: User; etag?: string };

export async function getProfile(): Promise<ProfileResponse> {
  const profile = await fetchProfile();
  return { profile };
}

export async function updateProfileLegacy(
  input: Partial<Pick<User, 'firstName' | 'lastName'>>,
  etag?: string
): Promise<ProfileResponse> {
  const profile = await updateProfile(input);
  return { profile };
}