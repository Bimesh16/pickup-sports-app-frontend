import { useQuery } from '@tanstack/react-query';
import { fetchParticipants } from '../api';
import type { Participant } from '../types';

export function useParticipants(gameId: string | undefined) {
  return useQuery<Participant[]>({
    queryKey: ['game', gameId, 'participants'],
    queryFn: () => fetchParticipants(gameId as string),
    enabled: !!gameId,
  });
}
