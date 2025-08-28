import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchComprehensiveRecommendations,
  fetchGameRecommendations,
  fetchPlayerRecommendations,
  fetchVenueRecommendations,
  submitRecommendationFeedback
} from '../api';
import type { RecommendationsQuery } from '@/src/types/api';

export function useComprehensiveRecommendations(userId?: number) {
  return useQuery({
    queryKey: ['recommendations', 'comprehensive', userId],
    queryFn: () => fetchComprehensiveRecommendations(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useGameRecommendations(query: RecommendationsQuery = {}) {
  return useQuery({
    queryKey: ['recommendations', 'games', query],
    queryFn: () => fetchGameRecommendations(query),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePlayerRecommendations(query: RecommendationsQuery = {}) {
  return useQuery({
    queryKey: ['recommendations', 'players', query],
    queryFn: () => fetchPlayerRecommendations(query),
    staleTime: 10 * 60 * 1000,
  });
}

export function useVenueRecommendations(query: RecommendationsQuery = {}) {
  return useQuery({
    queryKey: ['recommendations', 'venues', query],
    queryFn: () => fetchVenueRecommendations(query),
    staleTime: 10 * 60 * 1000,
  });
}

export function useRecommendationFeedback() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitRecommendationFeedback,
    onSuccess: () => {
      // Invalidate all recommendations to refresh with updated feedback
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
}