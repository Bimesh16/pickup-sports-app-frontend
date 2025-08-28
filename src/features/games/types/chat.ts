export type ChatMessage = {
  id: string;
  gameId: string;
  user: {
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  content: string;
  createdAt: string; // ISO
  pending?: boolean; // client-side optimistic flag
  tempId?: string; // for optimistic reconciliation
};
