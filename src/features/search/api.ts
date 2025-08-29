import { api } from '@/src/api/client';
import type { Game, User } from '@/src/types/api';

export type GameSearchParams = {
  sport?: string;
  location?: string;
  radiusKm?: number;
};

export type UserSearchParams = {
  q: string;
};

export type SavedSearchInput = {
  sport?: string;
  location?: string;
  radiusKm?: number;
};

export type SavedSearch = {
  id: number;
  userId: number;
  sport?: string;
  location?: string;
  radiusKm?: number;
  createdAt: string;
};

/**
 * Search games - matches your backend endpoint
 * GET /search/games
 */
export async function searchGames(params: GameSearchParams): Promise<Game[]> {
  const { data } = await api.get('/search/games', {
    params,
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

/**
 * Search users - matches your backend endpoint
 * GET /search/users
 */
export async function searchUsers(params: UserSearchParams): Promise<User[]> {
  const { data } = await api.get('/search/users', {
    params,
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

/**
 * Get saved searches - matches your backend endpoint
 * GET /saved-searches
 */
export async function getSavedSearches(): Promise<SavedSearch[]> {
  const { data } = await api.get('/saved-searches', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

/**
 * Create saved search - matches your backend endpoint
 * POST /saved-searches
 */
export async function createSavedSearch(input: SavedSearchInput): Promise<SavedSearch> {
  const { data } = await api.post('/saved-searches', input, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

/**
 * Delete saved search - matches your backend endpoint
 * DELETE /saved-searches/{id}
 */
export async function deleteSavedSearch(id: number): Promise<void> {
  await api.delete(`/saved-searches/${id}`, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
