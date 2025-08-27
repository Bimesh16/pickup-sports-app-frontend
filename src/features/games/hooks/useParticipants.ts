import { useQuery } from '@tanstack/react-query';
import type { Participant } from '../types';
import { api } from '@/src/api/client';
import { queryRetry } from '@/src/utils/queryRetry';

async function fetchParticipantsApi(id: string): Promise<Participant[]> {
  const { data } = await api.get(`/games/${id}/participants`, { headers: { 'Cache-Control': 'no-store' } });
  return Array.isArray(data) ? (data as Participant[]) : [];
}

export function useParticipants(gameId: string | undefined) {
  return useQuery<Participant[], unknown>({
    queryKey: ['game', gameId, 'participants'],
    queryFn: () => fetchParticipantsApi(gameId as string),
    enabled: !!gameId,
    retry: (failureCount: number, error: unknown) => queryRetry(failureCount, error as any),
  });
}
