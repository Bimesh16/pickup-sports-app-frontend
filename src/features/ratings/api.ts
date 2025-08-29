import { api } from '@/src/api/client';

export type RatingInput = { rating: number; comment?: string };

export type UserRatingInput = { 
  ratedUserId: number; 
  rating: number; 
  comment?: string; 
};

export type UserRatingSummary = {
  averageRating: number;
  totalRatings: number;
  ratingsBreakdown: {
    [key: number]: number;
  };
};

export type UserRating = {
  id: number;
  raterUserId: number;
  ratedUserId: number;
  rating: number;
  comment?: string;
  createdAt: string;
};

/**
 * Submit a rating for a game.
 * Backend endpoint assumed: POST /games/:id/ratings
 */
export async function submitRating(gameId: string, input: RatingInput): Promise<void> {
  await api.post(`/games/${gameId}/ratings`, input, { headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Rate another user - matches your backend endpoint
 * POST /ratings
 */
export async function rateUser(input: UserRatingInput): Promise<void> {
  await api.post('/ratings', input, { headers: { 'Cache-Control': 'no-store' } });
}

/**
 * Get user rating summary - matches your backend endpoint
 * GET /ratings/users/{userId}/summary
 */
export async function getUserRatingSummary(userId: number): Promise<UserRatingSummary> {
  const { data } = await api.get(`/ratings/users/${userId}/summary`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}

/**
 * Get recent ratings for a user - matches your backend endpoint
 * GET /ratings/users/{userId}/recent
 */
export async function getRecentUserRatings(userId: number): Promise<UserRating[]> {
  const { data } = await api.get(`/ratings/users/${userId}/recent`, {
    headers: { 'Cache-Control': 'no-store' }
  });
  return data;
}
