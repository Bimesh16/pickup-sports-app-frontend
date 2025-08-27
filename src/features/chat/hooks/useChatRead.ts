import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markChatRead } from '../api';

export function useChatRead(gameId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => markChatRead(gameId, messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chat', gameId] });
    },
  });
}
