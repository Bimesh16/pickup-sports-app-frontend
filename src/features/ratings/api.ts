import { api } from '@/src/api/client';

export type RatingInput = { rating: number; comment?: string };

/**
 * Submit a rating for a game.
 * Backend endpoint assumed: POST /games/:id/ratings
 */
export async function submitRating(gameId: string, input: RatingInput): Promise<void> {
  await api.post(`/games/${gameId}/ratings`, input, { headers: { 'Cache-Control': 'no-store' } });
}
