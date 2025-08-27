import { useMutation } from '@tanstack/react-query';
import { unrsvpGame } from '../api';

export function useUnrsvpGame(id: string | undefined) {
  return useMutation({
    mutationFn: () => unrsvpGame(id as string),
  });
}

