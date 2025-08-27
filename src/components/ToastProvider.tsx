import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

type ToastType = 'info' | 'success' | 'error';
type ToastOptions = { duration?: number };

type ToastContextValue = {
  show: (message: string, type?: ToastType, opts?: ToastOptions) => void;
  success: (message: string, opts?: ToastOptions) => void;
  error: (message: string, opts?: ToastOptions) => void;
  info: (message: string, opts?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>('info');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(translateY, { toValue: 20, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start(({ finished }) => {
      if (finished) setMessage(null);
    });
  }, [opacity, translateY]);

  const showBase = useCallback(
    (msg: string, t: ToastType = 'info', opts?: ToastOptions) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setMessage(msg);
      setType(t);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ]).start();
      const duration = opts?.duration ?? 3000;
      timeoutRef.current = setTimeout(() => hide(), duration);
    },
    [hide, opacity, translateY]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show: showBase,
      success: (m, o) => showBase(m, 'success', o),
      error: (m, o) => showBase(m, 'error', o),
      info: (m, o) => showBase(m, 'info', o),
    }),
    [showBase]
  );

  const bg =
    type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#334155';

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.container,
            { opacity, transform: [{ translateY }] },
          ]}
        >
          <View style={[styles.toast, { backgroundColor: bg }]}> 
            <Text style={styles.text} allowFontScaling numberOfLines={2}>
              {message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  text: { color: '#fff' },
});
