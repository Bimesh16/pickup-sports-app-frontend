import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWSClient } from '@/src/api/ws';
import { fetchChatHistory, sendChatMessage } from '../api';
import type { ChatMessage } from '../types/chat';
import { useAuthStore } from '@/src/stores/auth';

export function useGameChat(gameId: string | undefined) {
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);

  const history = useQuery<ChatMessage[], unknown>({
    queryKey: ['game', gameId, 'chat'],
    queryFn: () => fetchChatHistory(gameId as string),
    enabled: !!gameId,
    staleTime: 5_000,
  });

  // Typing indicators
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimersRef = useRef<Map<string, any>>(new Map());

  // Subscribe to WS chat and append messages
  useEffect(() => {
    if (!gameId) return;
    const ws = getWSClient();
    const chatTopic = `/topic/games/${encodeURIComponent(gameId)}/chat`;
    const typingTopic = `/topic/games/${encodeURIComponent(gameId)}/typing`;

    const unsubChat = ws.subscribe(chatTopic, (payload: any) => {
      const msg: ChatMessage = payload?.message ?? payload;
      if (!msg || msg.gameId !== gameId) return;
      qc.setQueryData<ChatMessage[] | undefined>(['game', gameId, 'chat'], (prev) => {
        const arr = prev ?? [];
        // De-dup by id or tempId
        if (arr.some((m) => (msg.id && m.id === msg.id) || (msg.tempId && m.tempId === msg.tempId))) {
          return arr.map((m) => (msg.id && m.tempId && m.tempId === msg.tempId ? { ...msg, pending: false, tempId: undefined } : m));
        }
        return [...arr, { ...msg, pending: false, tempId: undefined }];
      });
    });

    const unsubTyping = ws.subscribe(typingTopic, (payload: any) => {
      const u = payload?.username as string | undefined;
      if (!u || (me?.username && u === me.username)) return;

      // Refresh expiry timer for this username
      const timers = typingTimersRef.current;
      const prevTimer = timers.get(u);
      if (prevTimer) clearTimeout(prevTimer);

      setTypingUsers((curr) => (curr.includes(u) ? curr : [...curr, u]));

      const t = setTimeout(() => {
        setTypingUsers((curr) => curr.filter((x) => x !== u));
        timers.delete(u);
      }, 3000);
      timers.set(u, t);
    });

    return () => {
      unsubChat?.();
      unsubTyping?.();
      // Clear timers
      typingTimersRef.current.forEach((t) => clearTimeout(t));
      typingTimersRef.current.clear();
      setTypingUsers([]);
    };
  }, [gameId, qc, me?.username]);

  const send = useMutation({
    mutationFn: async (content: string) => {
      if (!gameId) throw new Error('No game id');
      return sendChatMessage(gameId, content);
    },
    onMutate: async (content: string) => {
      if (!gameId) return;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimistic: ChatMessage = {
        id: tempId,
        tempId,
        gameId,
        user: { username: me?.username ?? 'me', displayName: me?.displayName, avatarUrl: me?.avatarUrl },
        content,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      qc.setQueryData<ChatMessage[] | undefined>(['game', gameId, 'chat'], (prev) => ([...(prev ?? []), optimistic]));
      return { tempId };
    },
    onSuccess: (msg, _variables, ctx) => {
      if (!gameId) return;
      qc.setQueryData<ChatMessage[] | undefined>(['game', gameId, 'chat'], (prev) => {
        const arr = prev ?? [];
        if (!ctx?.tempId) return [...arr, msg];
        return arr.map((m) => (m.tempId === ctx.tempId ? { ...msg, pending: false, tempId: undefined } : m));
      });
    },
    onError: (_err, _vars, ctx) => {
      if (!gameId || !ctx?.tempId) return;
      qc.setQueryData<ChatMessage[] | undefined>(['game', gameId, 'chat'], (prev) =>
        (prev ?? []).filter((m) => m.tempId !== ctx.tempId)
      );
    },
  });

  const sendTyping = (username?: string) => {
    if (!gameId) return;
    const ws = getWSClient();
    ws.publish(`/topic/games/${encodeURIComponent(gameId)}/typing`, {
      gameId,
      type: 'typing',
      username: username ?? me?.username ?? 'me',
      at: Date.now(),
    });
  };

  return {
    messages: history.data ?? [],
    isLoading: history.isLoading,
    isError: history.isError,
    refetch: history.refetch,
    send,
    typingUsers,
    sendTyping,
  };
}
