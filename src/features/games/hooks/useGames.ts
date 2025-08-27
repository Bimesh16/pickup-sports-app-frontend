import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '../api';

export function useGames() {
  const { refetch, dataUpdatedAt, ...query } = useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  });

  return { ...query, refetch, dataUpdatedAt };
}
