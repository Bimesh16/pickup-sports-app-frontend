export type Game = {
  id: string;
  title: string;
  sport?: string;
  description?: string;
  location?: string;
  startsAt: string; // ISO
  maxPlayers?: number;
  playersCount?: number;
  joined?: boolean; // whether current user joined
  createdBy?: { username: string };
};

export type Participant = {
  id?: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
};

export type CreateGameInput = {
  title: string;
  sport?: string;
  description?: string;
  location?: string;
  startsAt: string; // ISO
  maxPlayers?: number;
};
