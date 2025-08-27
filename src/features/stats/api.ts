import { api } from '@/src/api/client';

export type Stats = Record<string, number>;

/** Fetch aggregate statistics. */
export async function fetchStats(): Promise<Stats> {
  const { data } = await api.get('/stats', { headers: { 'Cache-Control': 'no-store' } });
  return (data ?? {}) as Stats;
}
