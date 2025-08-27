import { useMutation } from '@tanstack/react-query';
import { rsvpGame } from '../api';

export function useRsvpGame(id: string | undefined) {
  return useMutation({
    mutationFn: () => rsvpGame(id as string),
  });
}

