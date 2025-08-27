import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitRating, RatingInput } from '../api';
import { useToast } from '@/src/components/ToastProvider';

export function useSubmitRating(gameId: string) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: RatingInput) => submitRating(gameId, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['game', gameId] });
      toast.success('Rating submitted');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Rating failed'),
  });
}
