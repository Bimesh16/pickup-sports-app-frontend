import { useMutation } from '@tanstack/react-query';
import { confirmGame } from '../api';

export function useConfirmGame(id: string | undefined) {
  return useMutation({
    mutationFn: () => confirmGame(id as string),
  });
}

