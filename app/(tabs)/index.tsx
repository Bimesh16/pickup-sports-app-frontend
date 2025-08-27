import React from 'react';
import GamesList from '@/src/features/games/components/GamesList';

export default function GamesScreen() {
  return <GamesList initialShowJoined={false} allowToggle />;
}
