import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchComprehensiveRecommendations,
  fetchGameRecommendations,
  fetchPlayerRecommendations,
  fetchVenueRecommendations,
  submitRecommendationFeedback
} from '../api';
import type { RecommendationsQuery } from '@/src/types/api';
import { useAuthStore } from '@/src/stores/auth';

export function useComprehensiveRecommendations(userId?: number) {
  const user = useAuthStore((s) => s.user);
  
  return useQuery({
    queryKey: ['recommendations', 'comprehensive', userId],
    queryFn: () => fetchComprehensiveRecommendations(userId),
    enabled: !!userId, // Only run query when userId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user?.authenticated, // Only run when authenticated
  });
}

export function useGameRecommendations(query: RecommendationsQuery = {}) {
  const user = useAuthStore((s) => s.user);
  
  return useQuery({
    queryKey: ['recommendations', 'games', query],
    queryFn: () => fetchGameRecommendations(query),
    enabled: !!query.userId, // Only run query when userId is provided
    staleTime: 10 * 60 * 1000,
    enabled: !!user?.authenticated,
  });
}

export function usePlayerRecommendations(query: RecommendationsQuery = {}) {
  const user = useAuthStore((s) => s.user);
  
  return useQuery({
    queryKey: ['recommendations', 'players', query],
    queryFn: () => fetchPlayerRecommendations(query),
    enabled: !!query.userId, // Only run query when userId is provided
    staleTime: 10 * 60 * 1000,
    enabled: !!user?.authenticated,
  });
}

export function useVenueRecommendations(query: RecommendationsQuery = {}) {
  const user = useAuthStore((s) => s.user);
  
  return useQuery({
    queryKey: ['recommendations', 'venues', query],
    queryFn: () => fetchVenueRecommendations(query),
    enabled: !!query.userId, // Only run query when userId is provided
    staleTime: 10 * 60 * 1000,
    enabled: !!user?.authenticated,
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