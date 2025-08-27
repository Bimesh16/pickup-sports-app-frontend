import { useMutation } from '@tanstack/react-query';
import { promoteFromWaitlist } from '../api';

export function usePromoteFromWaitlist(gameId: string | undefined) {
  return useMutation({
    mutationFn: (userId: string) => promoteFromWaitlist(gameId as string, userId),
  });
}

