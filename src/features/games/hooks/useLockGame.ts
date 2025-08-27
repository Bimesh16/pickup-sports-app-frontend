import { useMutation } from '@tanstack/react-query';
import { lockGame } from '../api';

export function useLockGame(id: string | undefined) {
  return useMutation({
    mutationFn: () => lockGame(id as string),
  });
}

