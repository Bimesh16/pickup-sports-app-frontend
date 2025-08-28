// Core API types that match the backend specification

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type GameStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type Algorithm = 'COLLABORATIVE' | 'CONTENT_BASED' | 'HYBRID' | 'CONTEXTUAL';
export type TrendType = 'RISING' | 'FALLING' | 'STABLE';
export type ActivityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ModelStatus = 'TRAINING' | 'ACTIVE' | 'DEPRECATED';
export type SystemStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL';

// User model matching backend
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  skillLevel: SkillLevel;
  createdAt: string;
  updatedAt: string;
}

// Venue model matching backend
export interface Venue {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  amenities: string[];
  sports: string[];
  pricePerHour: number;
  capacity: number;
  rating: number;
  images: string[];
}

// Game model matching backend
export interface Game {
  id: number;
  sport: string;
  venue: Venue;
  time: string;
  maxParticipants: number;
  currentParticipants: number;
  skillLevel: SkillLevel;
  description: string;
  status: GameStatus;
  creator: User;
  participants: User[];
}

// Venue Booking model
export interface VenueBooking {
  id: number;
  venue: Venue;
  user: User;
  startTime: string;
  endTime: string;
  purpose: string;
  participants: number;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
}

// Recommendation models
export interface Recommendation<T> {
  item: T;
  algorithm: Algorithm;
  score: number;
  reasons: string[];
}

export interface GameRecommendation {
  game: Game;
  algorithm: Algorithm;
  score: number;
  reasons: string[];
}

export interface PlayerRecommendation {
  player: User;
  algorithm: Algorithm;
  score: number;
  reasons: string[];
}

export interface VenueRecommendation {
  venue: Venue;
  algorithm: Algorithm;
  score: number;
  reasons: string[];
}

// Analytics models
export interface UserBehaviorAnalysis {
  userId: number;
  preferredSports: string[];
  preferredTimeSlots: string[];
  skillLevelProgression: {
    current: string;
    trend: TrendType;
  };
  activityLevel: ActivityLevel;
  socialConnections: number;
  averageGameDuration: number;
  predictionAccuracy: number;
}

export interface DemandForecast {
  date: string;
  sport: string;
  venueId: number;
  predictedDemand: number;
  confidence: number;
  factors: string[];
}

export interface TrendAnalysis {
  sportPopularity: Array<{
    sport: string;
    trend: TrendType;
    growthRate: number;
    currentPopularity: number;
  }>;
  timeSlotPopularity: Array<{
    timeSlot: string;
    popularity: number;
    trend: string;
  }>;
  venueUtilization: Array<{
    venueId: number;
    venueName: string;
    utilizationRate: number;
    trend: string;
  }>;
}

// Performance monitoring models
export interface SystemHealth {
  performance: {
    status: 'healthy' | 'degraded';
    cacheHitRate: number;
    connectionUtilization: number;
  };
  loadBalancing: {
    status: 'healthy' | 'unhealthy';
    healthyServers: number;
    overallSuccessRate: number;
  };
  monitoring: {
    status: SystemStatus;
    lastHealthCheck: string;
    activeAlerts: number;
  };
  system: {
    status: 'healthy';
    timestamp: number;
    version: string;
  };
}

// API Response wrappers
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Array<{
    field: string;
    message: string;
    rejectedValue: any;
  }>;
}

// Request models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  skillLevel: SkillLevel;
}

export interface CreateGameRequest {
  sport: string;
  venueId: number;
  time: string;
  maxParticipants: number;
  skillLevel: SkillLevel;
  description: string;
}

export interface CreateVenueRequest {
  name: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  amenities: string[];
  sports: string[];
  pricePerHour: number;
  capacity: number;
}

export interface CreateVenueBookingRequest {
  venueId: number;
  startTime: string;
  endTime: string;
  purpose: string;
  participants: number;
}

// Query parameters
export interface GamesQuery {
  sport?: string;
  skillLevel?: SkillLevel;
  venueId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface VenuesQuery {
  name?: string;
  city?: string;
  sport?: string;
  page?: number;
  size?: number;
}

export interface RecommendationsQuery {
  algorithm?: Algorithm;
  limit?: number;
}