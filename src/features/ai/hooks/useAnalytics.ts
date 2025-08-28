import { useQuery } from '@tanstack/react-query';
import { 
  fetchUserBehaviorAnalysis,
  fetchDemandForecast,
  fetchTrends,
  fetchGameOptimization,
  fetchMLModels,
  fetchABTestExperiments
} from '../api';

export function useUserBehaviorAnalysis(userId: number) {
  return useQuery({
    queryKey: ['analytics', 'user-behavior', userId],
    queryFn: () => fetchUserBehaviorAnalysis(userId),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useDemandForecast(params: {
  sport?: string;
  venueId?: number;
  timeRange?: 'NEXT_WEEK' | 'NEXT_MONTH';
} = {}) {
  return useQuery({
    queryKey: ['analytics', 'demand-forecast', params],
    queryFn: () => fetchDemandForecast(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useTrends() {
  return useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: fetchTrends,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useGameOptimization() {
  return useQuery({
    queryKey: ['analytics', 'game-optimization'],
    queryFn: fetchGameOptimization,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useMLModels() {
  return useQuery({
    queryKey: ['ai', 'ml-models'],
    queryFn: fetchMLModels,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useABTestExperiments() {
  return useQuery({
    queryKey: ['ai', 'ab-experiments'],
    queryFn: fetchABTestExperiments,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}