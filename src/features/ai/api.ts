import { api } from '@/src/api/client';
import type { 
  GameRecommendation, 
  PlayerRecommendation, 
  VenueRecommendation,
  UserBehaviorAnalysis,
  DemandForecast,
  TrendAnalysis,
  RecommendationsQuery,
  Algorithm 
} from '@/src/types/api';

// AI Recommendations APIs
export async function fetchComprehensiveRecommendations(userId?: number) {
  const { data } = await api.get('/api/v1/ai/recommendations/comprehensive', {
    params: userId ? { userId } : {},
    headers: { 'Cache-Control': 'no-store' }
  });
  return data as {
    gameRecommendations: GameRecommendation[];
    playerRecommendations: PlayerRecommendation[];
    venueRecommendations: VenueRecommendation[];
  };
}

export async function fetchGameRecommendations(query: RecommendationsQuery = {}): Promise<GameRecommendation[]> {
  const { data } = await api.get('/api/v1/ai/recommendations/games', {
    params: {
      algorithm: query.algorithm,
      limit: query.limit || 10
    },
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchPlayerRecommendations(query: RecommendationsQuery = {}): Promise<PlayerRecommendation[]> {
  const { data } = await api.get('/api/v1/ai/recommendations/players', {
    params: {
      algorithm: query.algorithm,
      limit: query.limit || 10
    },
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchVenueRecommendations(query: RecommendationsQuery = {}): Promise<VenueRecommendation[]> {
  const { data } = await api.get('/api/v1/ai/recommendations/venues', {
    params: {
      algorithm: query.algorithm,
      limit: query.limit || 10
    },
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function submitRecommendationFeedback(feedback: {
  recommendationType: 'GAME' | 'PLAYER' | 'VENUE';
  recommendedItemId: number;
  feedback: 'POSITIVE' | 'NEGATIVE';
  reason?: string;
}): Promise<void> {
  await api.post('/api/v1/ai/recommendations/feedback', feedback, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

// Advanced Analytics APIs
export async function fetchUserBehaviorAnalysis(userId: number): Promise<UserBehaviorAnalysis> {
  const { data } = await api.get(`/api/v1/ai/analytics/user-behavior/${userId}`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchDemandForecast(params: {
  sport?: string;
  venueId?: number;
  timeRange?: 'NEXT_WEEK' | 'NEXT_MONTH';
} = {}): Promise<{
  forecasts: DemandForecast[];
  accuracy: number;
  lastUpdated: string;
}> {
  const { data } = await api.get('/api/v1/ai/analytics/demand-forecast', {
    params,
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchTrends(): Promise<TrendAnalysis> {
  const { data } = await api.get('/api/v1/ai/analytics/trends', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function fetchGameOptimization(): Promise<{
  recommendations: Array<{
    type: 'SCHEDULE_OPTIMIZATION' | 'SKILL_MATCHING' | 'VENUE_SELECTION';
    description: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    implementation: string;
  }>;
  optimizationScore: number;
  potentialImprovements: {
    participationRate: number;
    userSatisfaction: number;
    venueUtilization: number;
  };
}> {
  const { data } = await api.get('/api/v1/ai/analytics/game-optimization', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

// ML Model Training APIs
export async function fetchMLModels(): Promise<Array<{
  id: string;
  name: string;
  type: 'COLLABORATIVE_FILTERING' | 'CONTENT_BASED' | 'NEURAL_NETWORK';
  version: string;
  status: 'TRAINING' | 'ACTIVE' | 'DEPRECATED';
  accuracy: number;
  lastTrained: string;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}>> {
  const { data } = await api.get('/api/v1/ai/ml/models', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

export async function trainModel(modelId: string, config: {
  hyperparameters: {
    learningRate: number;
    epochs: number;
    batchSize: number;
  };
  trainingData: {
    startDate: string;
    endDate: string;
  };
}): Promise<void> {
  await api.post(`/api/v1/ai/ml/models/${modelId}/train`, config, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

export async function fetchABTestExperiments(): Promise<Array<{
  id: string;
  name: string;
  description: string;
  status: 'RUNNING' | 'COMPLETED' | 'STOPPED';
  variants: Array<{
    name: string;
    trafficPercentage: number;
    performance: {
      conversions: number;
      clickThroughRate: number;
      userSatisfaction: number;
    };
  }>;
  startDate: string;
  endDate: string;
}>> {
  const { data } = await api.get('/api/v1/ai/ml/ab-testing/experiments', {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}