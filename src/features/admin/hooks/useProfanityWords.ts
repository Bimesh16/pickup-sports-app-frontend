import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfanityWords,
  addProfanityWord,
  updateProfanityWord,
  deleteProfanityWord,
} from '../api';
import { queryRetry } from '@/src/utils/queryRetry';
import { useToast } from '@/src/components/ToastProvider';

export function useProfanityWords() {
  const qc = useQueryClient();
  const toast = useToast();

  const list = useQuery<string[], unknown>({
    queryKey: ['admin', 'profanity'],
    queryFn: fetchProfanityWords,
    retry: (failureCount, error) => queryRetry(failureCount, error as any),
  });

  const add = useMutation({
    mutationFn: (word: string) => addProfanityWord(word),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'profanity'] });
      toast.success('Word added');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Add failed'),
  });

  const update = useMutation({
    mutationFn: ({ oldWord, newWord }: { oldWord: string; newWord: string }) =>
      updateProfanityWord(oldWord, newWord),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'profanity'] });
      toast.success('Word updated');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Update failed'),
  });

  const remove = useMutation({
    mutationFn: (word: string) => deleteProfanityWord(word),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'profanity'] });
      toast.info('Word deleted');
    },
    onError: (e: any) => toast.error(e?.message ?? 'Delete failed'),
  });

  return { ...list, add, update, remove };
}
