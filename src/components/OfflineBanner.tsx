import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

const AnimatedView = Animated.createAnimatedComponent(View);

type OnlineListener = () => void;
const onlineListeners = new Set<OnlineListener>();

export function onOnline(listener: OnlineListener): () => void {
  onlineListeners.add(listener);
  return () => {
    onlineListeners.delete(listener);
  };
}

function emitOnline() {
  onlineListeners.forEach((l) => {
    try {
      l();
    } catch {
      // ignore listener errors
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

    // Optional NetInfo without static resolution
    let NetInfo: any = null;
    try {
      // eslint-disable-next-line no-eval
      const dynRequire = eval('require') as any;
      NetInfo = dynRequire ? dynRequire('@react-native-community/netinfo') : null;
    } catch {
      NetInfo = null;
    }

    if (NetInfo?.addEventListener) {
      const sub = NetInfo.addEventListener((state: any) => {
        update(!!state?.isConnected && !!state?.isInternetReachable);
      });
      unsubscribe = () => sub && sub();
    } else if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handler = () => update((navigator as any).onLine !== false);
      handler();
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
      unsubscribe = () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      };
    } else {
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
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!online) {
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    } else {
      opacity.setValue(0);
    }
  }, [online, opacity]);

  if (online) return null;

  return (
    <AnimatedView style={[styles.bar, { opacity }]}>
      <Text style={styles.text}>You’re offline</Text>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 1000,
  },
  text: { color: '#fff' },
});
