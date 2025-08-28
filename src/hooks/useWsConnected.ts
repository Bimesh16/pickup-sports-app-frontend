import { useEffect, useState } from 'react';
import { getWSClient } from '@/src/api/ws';

export function useWsConnected(): boolean {
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const ws = getWSClient();
    const unsub = ws.subscribeConnection((c) => setConnected(c));
    return () => {
      unsub?.();
    };
  }, []);

  return connected;
}
