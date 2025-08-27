import { useMutation } from '@tanstack/react-query';
import { removeCohost } from '../api';

export function useRemoveCohost(gameId: string | undefined) {
  return useMutation({
    mutationFn: (userId: string) => removeCohost(gameId as string, userId),
  });
}

