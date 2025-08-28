import { api } from '@/src/api/client';
import type { User, SkillLevel } from '@/src/types/api';
import type { UserStats, GameParticipation, UserAchievement, SocialConnection, UserPreferences } from './types';

// User Management APIs matching backend spec
export async function fetchProfile(): Promise<User> {
  const { data } = await api.get('/auth/me', {
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

/** Fetch user statistics */
export async function fetchUserStats(username: string): Promise<UserStats> {
  const { data } = await api.get(`/api/v1/users/${encodeURIComponent(username)}/stats`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data as UserStats;
}

/** Fetch user game participation history */
export async function fetchUserGameHistory(
  username: string, 
  page = 0, 
  size = 20
): Promise<{ content: GameParticipation[]; totalElements: number; totalPages: number }> {
  const { data } = await api.get(`/api/v1/users/${encodeURIComponent(username)}/game-history`, {
    params: { page, size },
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

/** Fetch user achievements */
export async function fetchUserAchievements(username: string): Promise<UserAchievement[]> {
  const { data } = await api.get(`/api/v1/users/${encodeURIComponent(username)}/achievements`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return Array.isArray(data) ? data : [];
}

/** Fetch user social connections */
export async function fetchUserSocialConnections(username: string): Promise<SocialConnection[]> {
  const { data } = await api.get(`/api/v1/users/${encodeURIComponent(username)}/social-connections`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return Array.isArray(data) ? data : [];
}

/** Fetch user preferences */
export async function fetchUserPreferences(username: string): Promise<UserPreferences> {
  const { data } = await api.get(`/api/v1/users/${encodeURIComponent(username)}/preferences`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data as UserPreferences;
}

/** Update user preferences */
export async function updateUserPreferences(
  username: string, 
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
  const { data } = await api.put(`/api/v1/users/${encodeURIComponent(username)}/preferences`, preferences, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data as UserPreferences;
}