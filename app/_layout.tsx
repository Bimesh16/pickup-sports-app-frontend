import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AppProviders } from '@/src/providers/AppProviders';
import { useAuthStore } from '@/src/stores/auth';
import OfflineBanner from '@/src/components/OfflineBanner';
import CachedDataBanner from '@/src/components/CachedDataBanner';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((s) => s.user);
  const [isReady, setIsReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // Wait for segments to be ready before attempting navigation
  useEffect(() => {
    // Ensure we have segments and they're not empty
    if (segments.length > 0 && segments[0]) {
      // Add a small delay to ensure the layout is fully mounted
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [segments]);

  // Wait for auth state to be determined
  useEffect(() => {
    // Set auth as ready after a brief delay to ensure auth store is initialized
    const timer = setTimeout(() => {
      setAuthReady(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
      // Only navigate after the layout is ready, segments are loaded, and auth is ready
  if (!isReady || !authReady) return;
    
    const inAuthGroup = segments[0] === '(auth)';
    if (!user?.authenticated && !inAuthGroup) {
      // Use setTimeout to ensure navigation happens after render
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 0);
    } else if (user?.authenticated && inAuthGroup) {
      // Use setTimeout to ensure navigation happens after render
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 0);
    }
  }, [user, router, segments, isReady]);

  // Deep link handling: /game/:id?join=1 or invite=true
  useEffect(() => {
    // Only handle deep links after the layout is ready and auth is ready
    if (!isReady || !authReady) return;
    
    const handle = (url: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      const path = (parsed.path ?? '').replace(/^\//, '');
      const params = parsed.queryParams ?? {};
      const join = params.join === '1' || params.join === 'true' || params.invite === 'true';
      const m = path.match(/^game\/([^/?#]+)/i);
      if (m && m[1]) {
        const id = decodeURIComponent(m[1]);
        const to = join ? `/(tabs)/game/${id}?autojoin=1` : `/(tabs)/game/${id}`;
        setTimeout(() => router.push(to as any), 0);
      }
    };

    // initial URL
    Linking.getInitialURL().then((u) => handle(u)).catch(() => {});
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => sub.remove();
  }, [router]);

  // Don't render anything until ready to prevent navigation errors
  if (!isReady || !authReady) {
    return (
      <AppProviders>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        </ThemeProvider>
      </AppProviders>
    );
  }

  return (
    <AppProviders>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <OfflineBanner />
          <CachedDataBanner />
        </>
      </ThemeProvider>
    </AppProviders>
  );
}
