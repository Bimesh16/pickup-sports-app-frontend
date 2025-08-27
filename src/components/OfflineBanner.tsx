import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { spacing, radius } from '@/constants/Spacing';

const AnimatedView = Animated.createAnimatedComponent(View);

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
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!online) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      opacity.setValue(0);
    }
  }, [online, opacity]);

  if (online) return null;
  return (
    <AnimatedView
      style={[styles.bar, { opacity }]}
      lightColor="#dc2626"
      darkColor="#b91c1c"
    >
      <Text style={styles.text} lightColor="#fff" darkColor="#fee2e2">
        You’re offline
      </Text>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    zIndex: 1000,
  },
  text: {},
});
