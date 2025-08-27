import { useMutation } from '@tanstack/react-query';
import { addCohost } from '../api';

export function useAddCohost(gameId: string | undefined) {
  return useMutation({
    mutationFn: (userId: string) => addCohost(gameId as string, userId),
  });
}

