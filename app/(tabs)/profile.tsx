import React, { useState } from 'react';
import { Button, StyleSheet, View as RNView, ScrollView, RefreshControl } from 'react-native';
import { usePrefs } from '@/src/stores/prefs';
import { useLogout } from '@/src/features/auth/hooks/useLogout';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import Avatar from '@/src/components/Avatar';
import { useAuthStore } from '@/src/stores/auth';
import { logout } from '@/src/features/auth/api';
import { useToast } from '@/src/components/ToastProvider';
import { useUserStats } from '@/src/features/user/hooks/useUserStats';
import { useUserAchievements } from '@/src/features/user/hooks/useUserAchievements';
import { useUserSocialConnections } from '@/src/features/user/hooks/useUserSocialConnections';
import { useUserGameHistory } from '@/src/features/user/hooks/useUserGameHistory';
import UserStatsCard from '@/src/features/user/components/UserStatsCard';
import UserPreferencesCard from '@/src/features/user/components/UserPreferencesCard';
import UserAchievementsCard from '@/src/features/user/components/UserAchievementsCard';
import UserSocialConnectionsCard from '@/src/features/user/components/UserSocialConnectionsCard';
import UserGameHistoryCard from '@/src/features/user/components/UserGameHistoryCard';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data only when authenticated
  const { data: stats, refetch: refetchStats } = useUserStats(user?.authenticated ? user.username : undefined);
  const { data: achievements, refetch: refetchAchievements } = useUserAchievements(user?.authenticated ? user.username : undefined);
  const { data: socialConnections, refetch: refetchSocial } = useUserSocialConnections(user?.authenticated ? user.username : undefined);
  const { data: gameHistory, refetch: refetchHistory } = useUserGameHistory(user?.authenticated ? user.username : undefined);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
        refetchAchievements(),
        refetchSocial(),
        refetchHistory(),
      ]);
    } catch (error) {
      console.error('Error refreshing profile data:', error);
    } finally {
      setRefreshing(false);
    }
  };

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

  const onGamePress = (gameId: string) => {
    router.push(`/(tabs)/game/${gameId}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Profile</Text>
        
        {user ? (
          <>
            {/* Profile Header */}
            <RNView style={styles.profileHeader}>
              <Avatar name={user.displayName || user.username} uri={user.avatarUrl ?? undefined} size={80} />
              <Text style={styles.name}>{user.displayName || user.username}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              {Array.isArray(user.roles) && user.roles.length > 0 && (
                <RNView style={styles.rolesContainer}>
                  {user.roles.map((role, index) => (
                    <RNView key={role} style={styles.roleBadge}>
                      <Text style={styles.roleText}>{role}</Text>
                    </RNView>
                  ))}
                </RNView>
              )}
            </RNView>

            {/* Action Buttons */}
            <RNView style={styles.actionButtons}>
              <Button title="Edit profile" onPress={() => router.push('/(tabs)/account/edit')} />
              <Button title="Change password" onPress={() => router.push('/(tabs)/account/password')} />
              <Button title="Change email" onPress={() => router.push('/(tabs)/account/email')} />
            </RNView>

            {/* Stats Section */}
            {stats && <UserStatsCard stats={stats} />}
            
            {/* Preferences Section */}
            {stats && <UserPreferencesCard stats={stats} />}
            
            {/* Achievements Section */}
            {achievements && <UserAchievementsCard achievements={achievements} />}
            
            {/* Social Connections Section */}
            {socialConnections && <UserSocialConnectionsCard connections={socialConnections} />}
            
            {/* Game History Section */}
            {gameHistory?.pages?.[0]?.content && (
              <UserGameHistoryCard 
                gameHistory={gameHistory.pages.flatMap(page => page.content)} 
                onGamePress={onGamePress}
              />
            )}

            {/* Preferences Section */}
            <RNView style={{ height: 16 }} />
            <PrefsSection />
            <RNView style={{ height: 8 }} />
            <SignOutRow />
          </>
        ) : (
          <>
            <Text>You are not signed in.</Text>
            <View style={{ height: 16 }} />
            <Button title="Go to Sign in" onPress={() => router.replace('/(auth)/login')} />
          </>
        )}
        
        <Button 
          title={pending ? 'Signing out...' : 'Sign out'} 
          onPress={onLogout} 
          disabled={pending || !user} 
        />
      </ScrollView>
    </View>
  );
}

function PrefsSection() {
  const { defaultCalDuration, setDefaultCalDuration } = usePrefs();
  const next = defaultCalDuration === 60 ? 90 : defaultCalDuration === 90 ? 120 : 60;
  return (
    <RNView style={{ gap: 6 }}>
      <Text>Calendar default duration: {defaultCalDuration} minutes</Text>
      <Button title={`Change to ${next} minutes`} onPress={() => setDefaultCalDuration(next)} />
    </RNView>
  );
}

function SignOutRow() {
  const logout = useLogout();
  return (
    <RNView style={{ marginTop: 12 }}>
      <Button
        title={logout.isPending ? 'Signing out…' : 'Sign out'}
        color="#b91c1c"
        onPress={() => logout.mutate()}
        disabled={logout.isPending}
      />
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  username: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 8 },
  rolesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  roleBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleText: { fontSize: 12, fontWeight: '500', color: '#333' },
  profileHeader: { alignItems: 'center', marginBottom: 16 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  scrollView: { flex: 1 },
});
