import { useEffect, useRef } from 'react';
import { confirm } from '@/src/components/ConfirmDialog';

interface AutoJoinOptions {
  autojoin?: string;
  data?: {
    joined?: boolean;
    title?: string;
    location?: string;
    startsAt?: string;
  } | null;
  whenText?: string;
  join: { isPending: boolean; mutate: () => void };
}

export function useAutoJoin({ autojoin, data, whenText, join }: AutoJoinOptions) {
  const inviteHandledRef = useRef(false);

  useEffect(() => {
    const shouldAuto = autojoin === '1' || autojoin === 'true';
    if (shouldAuto && data && !data.joined && !join.isPending && !inviteHandledRef.current) {
      inviteHandledRef.current = true;
      (async () => {
        const summary = [
          data.title ? `Title: ${data.title}` : null,
          whenText ? `When: ${whenText}` : null,
          data.location ? `Location: ${data.location}` : null,
        ]
          .filter(Boolean)
          .join('\n');
        const ok = await confirm({
          title: 'Join this game?',
          message: summary || 'You followed an invite. Do you want to join this game?',
          confirmText: 'Join',
        });
        if (ok) join.mutate();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autojoin, data?.joined, join.isPending, whenText]);
}

