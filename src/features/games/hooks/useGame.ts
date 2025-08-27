import { useQuery } from '@tanstack/react-query';
import { fetchGame } from '../api';

export function useGame(id: string | undefined) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => fetchGame(id as string),
    enabled: !!id,
  });
}
