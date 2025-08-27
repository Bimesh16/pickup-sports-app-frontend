import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    retry: queryRetry,
  });
}
