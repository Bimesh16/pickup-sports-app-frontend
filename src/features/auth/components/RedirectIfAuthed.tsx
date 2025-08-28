import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View } from '@/components/Themed';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '@/src/stores/auth';
import { useAuthBootstrap } from '@/src/features/auth/hooks/useAuthBootstrap';

/**
 * RedirectIfAuthed redirects authenticated users away from public/auth pages
 * to the main app tabs: /(tabs).
 */
export default function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((s) => s.user);
  const { isBootstrapping } = useAuthBootstrap();

  if (isBootstrapping) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    if (user && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [user, segments, router]);

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
