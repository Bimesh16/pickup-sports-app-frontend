import { useMutation } from '@tanstack/react-query';
import { unlockGame } from '../api';

export function useUnlockGame(id: string | undefined) {
  return useMutation({
    mutationFn: () => unlockGame(id as string),
  });
}

