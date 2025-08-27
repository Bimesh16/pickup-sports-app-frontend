import { useMutation } from '@tanstack/react-query';
import { holdGame } from '../api';

export function useHoldGame(id: string | undefined) {
  return useMutation({
    mutationFn: () => holdGame(id as string),
  });
}

