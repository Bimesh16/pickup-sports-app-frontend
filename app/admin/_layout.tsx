import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/stores/auth';

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user?.roles?.includes('admin')) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  return (
    <Stack 
      screenOptions={{ 
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: '#DC2626', // Nepal crimson
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
      }} 
    />
  );
}
