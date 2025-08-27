import React, { useEffect, useState } from 'react';
import Banner from './Banner';

type OnlineListener = () => void;
const onlineListeners = new Set<OnlineListener>();

export function onOnline(listener: OnlineListener): () => void {
  onlineListeners.add(listener);
  return () => onlineListeners.delete(listener);
}

function emitOnline() {
  onlineListeners.forEach((l) => {
    try {
      l();
    } catch {
      // Ignore listener errors
    }
  });
}

export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const update = (next: boolean) => {
      setOnline((prev) => {
        if (!prev && next) emitOnline();
        return next;
      });
    };

    // Try optional NetInfo without triggering Metro static resolution
    const modName = '@react-native-community/netinfo';
    let NetInfo: any = null;
    try {
      // eslint-disable-next-line no-eval
      const dynRequire = eval('require') as any;
      NetInfo = dynRequire ? dynRequire(modName) : null;
    } catch {
      NetInfo = null;
    }

    if (NetInfo?.addEventListener) {
      const sub = NetInfo.addEventListener((state: any) => {
        update(!!state?.isConnected && !!state?.isInternetReachable);
      });
      unsubscribe = () => sub && sub();
    } else if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      // Web fallback
      const handler = () => update((navigator as any).onLine !== false);
      handler();
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
      unsubscribe = () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      };
    } else {
      // No detection available; assume online to avoid blocking UX
      update(true);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return online;
}

export default function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return <Banner text="You’re offline" backgroundColor="#dc2626" />;
}
