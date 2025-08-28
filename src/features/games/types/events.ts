export type ParticipantEvent = {
  type: 'participant_joined' | 'participant_left';
  gameId: string;
  participant: {
    id?: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  playersCount?: number;
  waitlistCount?: number;
};

export type GameUpdatedEvent = {
  type: 'game_updated';
  gameId: string;
  fields?: Partial<{
    title: string;
    description: string;
    startsAt: string;
    location: string;
    maxPlayers: number;
    playersCount: number;
  }>;
};

export type CapacityChangedEvent = {
  type: 'capacity_changed';
  gameId: string;
  playersCount: number;
  maxPlayers: number;
};

export type GameEvent = ParticipantEvent | GameUpdatedEvent | CapacityChangedEvent;
