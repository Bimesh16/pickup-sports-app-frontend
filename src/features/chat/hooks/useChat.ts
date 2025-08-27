import { useQuery } from '@tanstack/react-query';
import { fetchChat, ChatMessage } from '../api';
import { queryRetry } from '@/src/utils/queryRetry';

export function useChat(gameId: string) {
  return useQuery<ChatMessage[], unknown>({
    queryKey: ['chat', gameId],
    queryFn: () => fetchChat(gameId),
    enabled: !!gameId,
    retry: (failureCount, error: unknown) => queryRetry(failureCount, error as any),
  });
}
