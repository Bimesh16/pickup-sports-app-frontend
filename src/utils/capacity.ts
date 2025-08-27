export function isFull(joined: boolean, maxPlayers?: number, playersCount?: number): boolean {
  return (
    !joined &&
    typeof maxPlayers === 'number' &&
    typeof playersCount === 'number' &&
    playersCount >= maxPlayers
  );
}

export function slotsLeft(maxPlayers?: number, playersCount?: number): number | undefined {
  if (typeof maxPlayers !== 'number' || typeof playersCount !== 'number') {
    return undefined;
  }
  return Math.max(maxPlayers - playersCount, 0);
}
