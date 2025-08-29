import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchGames,
  searchUsers,
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
  type GameSearchParams,
  type UserSearchParams,
  type SavedSearchInput
} from '../api';

export function useGameSearch(params: GameSearchParams, enabled = false) {
  return useQuery({
    queryKey: ['search', 'games', params],
    queryFn: () => searchGames(params),
    enabled: enabled && (!!params.sport || !!params.location),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUserSearch(params: UserSearchParams, enabled = false) {
  return useQuery({
    queryKey: ['search', 'users', params],
    queryFn: () => searchUsers(params),
    enabled: enabled && !!params.q && params.q.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSavedSearches() {
  return useQuery({
    queryKey: ['saved-searches'],
    queryFn: getSavedSearches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: SavedSearchInput) => createSavedSearch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
}
