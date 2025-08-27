import React from 'react';
import GamesList from '@/src/features/games/components/GamesList';

export default function MyGamesScreen() {
  return <GamesList initialShowJoined allowToggle />;
}
