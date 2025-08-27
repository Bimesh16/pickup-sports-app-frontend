import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

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
        setOnline(!!state?.isConnected && !!state?.isInternetReachable);
      });
      unsubscribe = () => sub && sub();
    } else if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      // Web fallback
      const handler = () => setOnline((navigator as any).onLine !== false);
      handler();
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
      unsubscribe = () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      };
    } else {
      // No detection available; assume online to avoid blocking UX
      setOnline(true);
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
  return (
    <View style={styles.bar}>
      <Text style={styles.text}>You’re offline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1000,
  },
  text: { color: '#fff' },
});
