import React, { useState } from 'react';
import { Button, StyleSheet, View as RNView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import Avatar from '@/src/components/Avatar';
import { useAuthStore } from '@/src/stores/auth';
import { logout } from '@/src/features/auth/api';
import { useToast } from '@/src/components/ToastProvider';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const onLogout = async () => {
    try {
      setPending(true);
      await logout();
      setUser(null);
      router.replace('/(auth)/login');
    } catch (e: any) {
      toast.error(e?.message ?? 'Logout failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user ? (
        <>
          <RNView style={{ alignItems: 'center', marginBottom: 8 }}>
            <Avatar name={user.displayName || user.username} uri={user.avatarUrl ?? undefined} size={72} />
          </RNView>
          <Text style={styles.name}>{user.displayName || user.username}</Text>
          <Text>Username: {user.username}</Text>
          {Array.isArray(user.roles) ? <Text>Roles: {user.roles.join(', ')}</Text> : null}
          <View style={{ height: 16 }} />
          <Button title="Edit profile" onPress={() => router.push('/(tabs)/account/edit')} />
          <Button title="Change password" onPress={() => router.push('/(tabs)/account/password')} />
          <View style={{ height: 8 }} />
        </>
      ) : (
        <>
          <Text>You are not signed in.</Text>
          <View style={{ height: 16 }} />
          <Button title="Go to Sign in" onPress={() => router.replace('/(auth)/login')} />
        </>
      )}
      <Button title={pending ? 'Signing out...' : 'Sign out'} onPress={onLogout} disabled={pending || !user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
});
