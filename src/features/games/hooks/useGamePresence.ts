import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWSClient } from '@/src/api/ws';
import type { GameEvent } from '../types/events';
import type { Game } from '../types';
import type { Participant } from '../types';

export function useGamePresence(gameId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!gameId) return;

    const topic = `/topic/games/${encodeURIComponent(gameId)}`;
    const ws = getWSClient();

    const unsub = ws.subscribe(topic, (payload: any) => {
      const evt = payload as GameEvent;

      if (!evt || (evt as any).gameId !== gameId) return;

      if (evt.type === 'participant_joined' || evt.type === 'participant_left') {
        // Update participants list cache
        qc.setQueryData<Participant[] | undefined>(['game', gameId, 'participants'], (prev) => {
          const p = prev ?? [];
          if (evt.type === 'participant_joined') {
            const exists = p.some((x) => x.username === evt.participant.username);
            return exists ? p : [{ ...evt.participant } as Participant, ...p];
          }
          // participant_left
          return p.filter((x) => x.username !== evt.participant.username);
        });
        // Update game details counts
        qc.setQueryData<Game | undefined>(['game', gameId], (g) => {
          if (!g) return g;
          const playersCount =
            typeof evt.playersCount === 'number'
              ? evt.playersCount
              : Math.max((g.playersCount ?? 0) + (evt.type === 'participant_joined' ? 1 : -1), 0);
          return { ...g, playersCount };
        });
      } else if (evt.type === 'capacity_changed') {
        qc.setQueryData<Game | undefined>(['game', gameId], (g) => {
          if (!g) return g;
          return { ...g, playersCount: evt.playersCount, maxPlayers: evt.maxPlayers };
        });
      } else if (evt.type === 'game_updated') {
        qc.setQueryData<Game | undefined>(['game', gameId], (g) => (g ? { ...g, ...evt.fields } : g));
      }
    });

    return () => {
      unsub?.();
    };
  }, [gameId, qc]);
}
