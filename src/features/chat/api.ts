import { api } from '@/src/api/client';

export type ChatMessage = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

export async function fetchChat(gameId: string): Promise<ChatMessage[]> {
  const { data } = await api.get(`/games/${gameId}/chat`, { headers: { 'Cache-Control': 'no-store' } });
  return data as ChatMessage[];
}

export async function markChatRead(gameId: string, messageId: string): Promise<void> {
  await api.post(
    '/chat/read',
    { gameId, messageId },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

// Chat Moderation APIs matching your backend
export async function muteUserInChat(gameId: string, username: string): Promise<void> {
  await api.post(`/games/${gameId}/moderation/mute/${encodeURIComponent(username)}`, null, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

export async function unmuteUserInChat(gameId: string, username: string): Promise<void> {
  await api.delete(`/games/${gameId}/moderation/mute/${encodeURIComponent(username)}`, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
