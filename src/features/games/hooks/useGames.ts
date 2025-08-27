import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useGames() {
  const { refetch, dataUpdatedAt, ...query } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    retry: queryRetry,
  });

  return { ...query, refetch, dataUpdatedAt };
}
