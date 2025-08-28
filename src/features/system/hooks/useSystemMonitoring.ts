import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchMonitoringDashboard,
  fetchPerformanceMetrics,
  fetchSystemDashboard,
  fetchSystemHealth,
  optimizeSystem
} from '../api';

export function useMonitoringDashboard() {
  return useQuery({
    queryKey: ['monitoring', 'dashboard'],
    queryFn: fetchMonitoringDashboard,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  });
}

export function usePerformanceMetrics(params: {
  timeRange: 'LAST_HOUR' | 'LAST_DAY' | 'LAST_WEEK' | 'LAST_MONTH';
  algorithm?: string;
}) {
  return useQuery({
    queryKey: ['monitoring', 'performance', params],
    queryFn: () => fetchPerformanceMetrics(params),
    refetchInterval: 60 * 1000, // Refresh every minute
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSystemDashboard() {
  return useQuery({
    queryKey: ['system', 'dashboard'],
    queryFn: fetchSystemDashboard,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: fetchSystemHealth,
    refetchInterval: 15 * 1000, // Refresh every 15 seconds
    staleTime: 5 * 1000, // 5 seconds
  });
}

export function useOptimizeSystem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: optimizeSystem,
    onSuccess: () => {
      // Refresh system data after optimization
      queryClient.invalidateQueries({ queryKey: ['system'] });
      queryClient.invalidateQueries({ queryKey: ['monitoring'] });
    },
  });
}