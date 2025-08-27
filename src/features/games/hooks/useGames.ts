import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '../api';

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
  });
}
