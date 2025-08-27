import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchGamesPage } from '../../games/api';

const PAGE_SIZE = 20;

export type GamesFilters = { q?: string; joined?: boolean };

export function useInfiniteGames(filters: GamesFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['games', filters],
    queryFn: ({ pageParam = 1 }) => fetchGamesPage(pageParam, PAGE_SIZE, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
