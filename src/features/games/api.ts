import { api } from '@/src/api/client';
import type { CreateGameInput, Game } from './types';

export async function fetchGames(): Promise<Game[]> {
  const { data } = await api.get('/games', { headers: { 'Cache-Control': 'no-store' } });
  return data as Game[];
}

export async function createInvite(gameId: string): Promise<{ url: string }> {
  const { data } = await api.post(`/games/${gameId}/invites`, null, { headers: { 'Cache-Control': 'no-store' } });
  // Expect { url } or { token }; adapt if backend returns token
  if (typeof data?.url === 'string') return { url: data.url as string };
  if (typeof data?.token === 'string') {
    // Build a link using your app scheme; invite=true for acceptance path
    const url = `${process.env.EXPO_PUBLIC_APP_LINK ?? 'myapp://'}game/${gameId}?invite=true&token=${encodeURIComponent(
      data.token as string
    )}`;
    return { url };
  }
  throw new Error('Unable to create invite link');
}

type GamesFilters = { q?: string; joined?: boolean };

export async function fetchGamesPage(
  page = 1,
  limit = 20,
  filters: GamesFilters = {}
): Promise<{ items: Game[]; nextPage: number | null }> {
  const params: Record<string, any> = { page, limit };
  if (filters.q) params.q = filters.q;
  if (typeof filters.joined === 'boolean') params.joined = filters.joined ? 1 : 0;

  const { data } = await api.get('/games', {
    headers: { 'Cache-Control': 'no-store' },
    params,
  });
  const items = (Array.isArray(data) ? data : (data?.items ?? [])) as Game[];
  const nextPage = items.length >= limit ? page + 1 : null;
  return { items, nextPage };
}

export async function fetchGame(id: string): Promise<Game> {
  const { data } = await api.get(`/games/${id}`, { headers: { 'Cache-Control': 'no-store' } });
  return data as Game;
}

export async function joinGame(id: string): Promise<void> {
  await api.post(`/games/${id}/join`, null, { headers: { 'Cache-Control': 'no-store' } });
}

export async function leaveGame(id: string): Promise<void> {
  await api.post(`/games/${id}/leave`, null, { headers: { 'Cache-Control': 'no-store' } });
}

export async function createGame(input: CreateGameInput): Promise<Game> {
  const { data } = await api.post('/games', input, { headers: { 'Cache-Control': 'no-store' } });
  return data as Game;
}

export async function updateGame(id: string, input: Partial<CreateGameInput>): Promise<Game> {
  const { data } = await api.put(`/games/${id}`, input, { headers: { 'Cache-Control': 'no-store' } });
  return data as Game;
}

export async function deleteGame(id: string): Promise<void> {
  await api.delete(`/games/${id}`, { headers: { 'Cache-Control': 'no-store' } });
}
