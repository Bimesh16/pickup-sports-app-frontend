import { api } from '@/src/api/client';
import type { SystemHealth } from '@/src/types/api';

// Performance Monitoring APIs
export async function fetchMonitoringDashboard(): Promise<{
  systemOverview: {
    totalRecommendations: number;
    successRate: number;
    averageResponseTime: number;
    activeUsers: number;
  };
  algorithmPerformance: Array<{
    algorithm: string;
    accuracy: number;
    responseTime: number;
    usage: number;
  }>;
  userEngagement: {
    clickThroughRate: number;
    conversionRate: number;
    userSatisfaction: number;
  };
  systemHealth: {
    status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    uptime: number;
    errorRate: number;
  };
}> {
  const { data } = await api.get('/api/v1/ai/monitoring/dashboard', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchPerformanceMetrics(params: {
  timeRange: 'LAST_HOUR' | 'LAST_DAY' | 'LAST_WEEK' | 'LAST_MONTH';
  algorithm?: string;
}): Promise<{
  metrics: Array<{
    timestamp: string;
    responseTime: number;
    accuracy: number;
    throughput: number;
    errorRate: number;
  }>;
  aggregates: {
    averageResponseTime: number;
    totalRequests: number;
    successRate: number;
  };
}> {
  const { data } = await api.get('/api/v1/ai/monitoring/performance', {
    params,
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

// System Optimization APIs
export async function fetchSystemDashboard(): Promise<{
  performance: {
    cacheHitRate: number;
    connectionUtilization: number;
    queryPerformance: number;
    systemLoad: number;
  };
  loadBalancing: {
    strategy: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'WEIGHTED' | 'IP_HASH';
    healthyServers: number;
    totalServers: number;
    currentLoad: number;
  };
  monitoring: {
    systemStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    activeAlerts: number;
    lastHealthCheck: string;
  };
  optimization: {
    cacheOptimization: any;
    connectionOptimization: any;
    queryOptimization: any;
  };
}> {
  const { data } = await api.get('/api/v1/system/dashboard', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  const { data } = await api.get('/api/v1/system/health', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function optimizeSystem(): Promise<{
  cache: {
    optimizations: string[];
    improvementPotential: number;
  };
  connectionPool: {
    optimizations: string[];
    recommendedSettings: any;
  };
  queries: {
    slowQueries: string[];
    optimizations: string[];
  };
  scaling: {
    action: 'SCALE_UP' | 'SCALE_DOWN' | 'MAINTAIN';
    currentInstances: number;
    recommendedInstances: number;
  };
  healthCheck: {
    overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    details: any;
  };
}> {
  const { data } = await api.post('/api/v1/system/optimize', null, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}