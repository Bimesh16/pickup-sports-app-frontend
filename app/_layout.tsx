import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    // Wait for auth bootstrap to complete before doing routing
    // We know bootstrap is done when either user is set (authenticated) or explicitly null (not authenticated)
    const isBootstrapComplete = user !== undefined;
    
    if (!isBootstrapComplete && isInitialLoad) {
      return; // Wait for bootstrap to complete
    }

    if (isInitialLoad) {
      setIsInitialLoad(false);
    }

    if (!user?.authenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user?.authenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, router, segments, isInitialLoad]);

  // Deep link handling: /game/:id?join=1 or invite=true
  useEffect(() => {
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
