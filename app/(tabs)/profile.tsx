import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/src/stores/auth';
import { useLogout } from '@/src/features/auth/hooks/useLogout';
import { useUserStats } from '@/src/features/user/hooks/useUserStats';
import { useUserAchievements } from '@/src/features/user/hooks/useUserAchievements';
import { useUserSocialConnections } from '@/src/features/user/hooks/useUserSocialConnections';
import { useUserGameHistory } from '@/src/features/user/hooks/useUserGameHistory';
import Avatar from '@/src/components/Avatar';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

type ProfileTab = 'overview' | 'stats' | 'achievements' | 'connections' | 'history' | 'settings';

export default function ProfileScreen() {
  // Add defensive programming for auth store
  let user: any = null;
  let logout: any = null;
  
  try {
    // Check if auth store is available
    if (typeof useAuthStore === 'function') {
      user = useAuthStore((s) => s.user);
      console.log('🔍 ProfileScreen: Auth store accessed successfully, user:', user);
    } else {
      console.error('🔍 ProfileScreen: useAuthStore is not a function');
      user = null;
    }
    
    if (typeof useLogout === 'function') {
      logout = useLogout();
    } else {
      console.error('🔍 ProfileScreen: useLogout is not a function');
      logout = { mutateAsync: async () => {} };
    }
  } catch (error) {
    console.error('🔍 ProfileScreen: Error accessing auth store:', error);
    // Fallback to safe defaults
    user = null;
    logout = { mutateAsync: async () => {} };
  }
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Create a safe user object to prevent undefined access
  const safeUser = user || {
    username: '',
    roles: [],
    authenticated: false,
    displayName: '',
    avatarUrl: null,
    id: undefined,
    email: undefined,
    firstName: undefined,
    lastName: undefined,
    skillLevel: 'BEGINNER' as const,
    createdAt: undefined,
    updatedAt: undefined,
  };

  // Debug logging
  console.log('🔍 ProfileScreen Debug:', {
    user: user ? { ...user, roles: user.roles } : null,
    safeUser: { ...safeUser, roles: safeUser.roles },
    isLoading,
    hasUser: !!user,
    isAuthenticated: user?.authenticated,
    hasUsername: !!user?.username,
    userType: typeof user,
    userIsNull: user === null,
    userIsUndefined: user === undefined,
    loadingState: isLoading ? 'LOADING' : 'NOT_LOADING',
  });

  // Add loading state and error handling
  useEffect(() => {
    // Give auth store time to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Additional effect to handle loading state based on user data
  useEffect(() => {
    if (user !== undefined) {
      // User data is available (either null or actual user object)
      setIsLoading(false);
    }
  }, [user]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.log('🔍 ProfileScreen: Fallback timeout reached, forcing loading to false');
      setIsLoading(false);
    }, 3000); // 3 second fallback

    return () => clearTimeout(fallbackTimer);
  }, []);

  // IMPORTANT: Call ALL hooks BEFORE any conditional returns to follow Rules of Hooks
  // Fetch user data - these hooks will handle their own error states
  // Only call hooks if we have a valid username to prevent errors
  const { data: stats } = useUserStats(user?.username && user.username.trim() ? user.username : undefined);
  const { data: achievements } = useUserAchievements(user?.username && user.username.trim() ? user.username : undefined);
  const { data: socialConnections } = useUserSocialConnections(user?.username && user.username.trim() ? user.username : undefined);
  const { data: gameHistory } = useUserGameHistory(user?.username && user.username.trim() ? user.username : undefined);

  // NOW handle conditional rendering AFTER all hooks are called
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
          <Text style={styles.loadingSubtext}>Please wait while we load your profile data</Text>
          <Text style={styles.loadingDebug}>Debug: isLoading={isLoading.toString()}, user={user ? 'EXISTS' : 'NULL'}</Text>
          <View style={{ height: 20 }} />
          <Button 
            title="Retry" 
            onPress={() => {
              console.log('🔍 ProfileScreen: Manual retry triggered');
              setIsLoading(false);
            }}
            variant="outline"
            size="small"
          />
          <View style={{ height: 10 }} />
          <Button 
            title="Debug: Set Test User" 
            onPress={() => {
              console.log('🔍 ProfileScreen: Setting test user for debugging');
              try {
                const { useAuthStore } = require('@/src/stores/auth');
                console.log('🔍 ProfileScreen: useAuthStore imported:', typeof useAuthStore);
                const setUser = useAuthStore.getState().setUser;
                console.log('🔍 ProfileScreen: setUser function:', typeof setUser);
                setUser({
                  username: 'testuser',
                  roles: ['USER'],
                  authenticated: true,
                  displayName: 'Test User',
                  avatarUrl: null,
                  id: 1,
                  email: 'test@example.com',
                  firstName: 'Test',
                  lastName: 'User',
                  skillLevel: 'BEGINNER',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                console.log('🔍 ProfileScreen: Test user set successfully');
                setIsLoading(false);
              } catch (error) {
                console.error('🔍 ProfileScreen: Error setting test user:', error);
              }
            }}
            variant="secondary"
            size="small"
          />
          <View style={{ height: 10 }} />
          <Button 
            title="Debug: Check Store" 
            onPress={() => {
              console.log('🔍 ProfileScreen: Checking auth store state');
              try {
                const { useAuthStore } = require('@/src/stores/auth');
                const state = useAuthStore.getState();
                console.log('🔍 ProfileScreen: Auth store state:', state);
                console.log('🔍 ProfileScreen: Current user:', state.user);
              } catch (error) {
                console.error('🔍 ProfileScreen: Error checking store:', error);
              }
            }}
            variant="outline"
            size="small"
          />
          <View style={{ height: 10 }} />
          <Button 
            title="Debug: Check Web Storage" 
            onPress={() => {
              console.log('🔍 ProfileScreen: Checking web storage');
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  const accessToken = localStorage.getItem('accessToken');
                  const refreshToken = localStorage.getItem('refreshToken');
                  console.log('🔍 ProfileScreen: Web storage tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
                  console.log('🔍 ProfileScreen: Access token start:', accessToken ? accessToken.substring(0, 20) + '...' : 'none');
                } else {
                  console.log('🔍 ProfileScreen: Not in web environment or localStorage not available');
                }
              } catch (error) {
                console.error('🔍 ProfileScreen: Error checking web storage:', error);
              }
            }}
            variant="outline"
            size="small"
          />
        </View>
      </SafeAreaView>
    );
  }

  // More robust user check
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Profile Not Available</Text>
          <Text style={styles.errorText}>User data not loaded</Text>
          <View style={{ height: 16 }} />
          <Button title="Go to Sign in" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user.authenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Profile Not Available</Text>
          <Text style={styles.errorText}>You are not signed in</Text>
          <View style={{ height: 16 }} />
          <Button title="Go to Sign in" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </SafeAreaView>
    );
  }

  // Additional safety check for required user properties
  if (!user.username) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Profile Incomplete</Text>
          <Text style={styles.errorText}>User profile data is incomplete</Text>
          <View style={{ height: 16 }} />
          <Button title="Go to Sign in" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </SafeAreaView>
    );
  }

  const onLogout = async () => {
    try {
      await logout.mutateAsync();
      router.replace('/(auth)/login');
    } catch (e: any) {
      console.error('Logout failed:', e);
    }
  };

  const onGamePress = (gameId: string) => {
    router.push(`/(tabs)/game/${gameId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab user={safeUser} stats={stats} />;
      case 'stats':
        return <StatsTab stats={stats} />;
      case 'achievements':
        return <AchievementsTab achievements={achievements} />;
      case 'connections':
        return <ConnectionsTab connections={socialConnections} />;
      case 'history':
        return <HistoryTab gameHistory={gameHistory} onGamePress={onGamePress} />;
      case 'settings':
        return <SettingsTab user={safeUser} router={router} />;
      default:
        return <OverviewTab user={safeUser} stats={stats} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <View style={styles.content}>
        {/* Sidebar Navigation */}
        <View style={styles.sidebar}>
          <View style={styles.profileCard}>
            <Avatar 
              name={safeUser.displayName || safeUser.username} 
              uri={safeUser.avatarUrl ?? undefined} 
              size={60} 
            />
            <Text style={styles.profileName}>{safeUser.displayName || safeUser.username}</Text>
            <Text style={styles.profileUsername}>@{safeUser.username}</Text>
            {safeUser.roles && Array.isArray(safeUser.roles) && safeUser.roles.length > 0 && (
              <View style={styles.rolesContainer}>
                {safeUser.roles.map((role: string, index: number) => (
                  <View key={role || index} style={styles.roleBadge}>
                    <Text style={styles.roleText}>{role || 'USER'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.navItems}>
            {[
              { id: 'overview', label: 'Overview', icon: 'person' },
              { id: 'stats', label: 'Statistics', icon: 'bar-chart' },
              { id: 'achievements', label: 'Achievements', icon: 'trophy' },
              { id: 'connections', label: 'Connections', icon: 'people' },
              { id: 'history', label: 'Game History', icon: 'time' },
              { id: 'settings', label: 'Settings', icon: 'settings' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  activeTab === item.id && styles.navItemActive
                ]}
                onPress={() => setActiveTab(item.id as ProfileTab)}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={activeTab === item.id ? Colors.nepal.crimson : Colors.text.secondary} 
                />
                <Text style={[
                  styles.navItemText,
                  activeTab === item.id && styles.navItemTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error[500]} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {renderTabContent()}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Overview Tab Component
function OverviewTab({ user, stats }: { user: any; stats: any }) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Profile Overview</Text>
      
      {/* Quick Stats Grid */}
      {stats && (
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.gamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.gamesCreated || 0}</Text>
            <Text style={styles.statLabel}>Games Created</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Week Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.attendanceRate ? `${Math.round(stats.attendanceRate)}%` : 'N/A'}</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </Card>
        </View>
      )}

      {/* Profile Info */}
      <Card style={styles.profileInfoCard}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username:</Text>
          <Text style={styles.infoValue}>@{user.username}</Text>
        </View>
        {user.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        )}
        {user.skillLevel && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Skill Level:</Text>
            <Text style={styles.infoValue}>{user.skillLevel}</Text>
          </View>
        )}
        {user.createdAt && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since:</Text>
            <Text style={styles.infoValue}>{new Date(user.createdAt).toLocaleDateString()}</Text>
          </View>
        )}
      </Card>
    </View>
  );
}

// Stats Tab Component
function StatsTab({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Statistics</Text>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No statistics available yet.</Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Detailed Statistics</Text>
      
      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Game Statistics</Text>
        <View style={styles.detailedStats}>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Total Games Played</Text>
            <Text style={styles.statRowValue}>{stats.gamesPlayed || 0}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Games Created</Text>
            <Text style={styles.statRowValue}>{stats.gamesCreated || 0}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Current Streak</Text>
            <Text style={styles.statRowValue}>{stats.currentStreak || 0} weeks</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Longest Streak</Text>
            <Text style={styles.statRowValue}>{stats.longestStreak || 0} weeks</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Attendance Rate</Text>
            <Text style={styles.statRowValue}>{stats.attendanceRate ? `${Math.round(stats.attendanceRate)}%` : 'N/A'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statRowLabel}>Total Play Time</Text>
            <Text style={styles.statRowValue}>{stats.totalPlayTime ? `${Math.floor(stats.totalPlayTime / 60)}h ${stats.totalPlayTime % 60}m` : 'N/A'}</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

// Achievements Tab Component
function AchievementsTab({ achievements }: { achievements: any }) {
  if (!achievements || achievements.length === 0) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Achievements</Text>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No achievements earned yet.</Text>
          <Text style={styles.emptySubtext}>Keep playing to earn badges!</Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Achievements & Badges</Text>
      
      <View style={styles.achievementsList}>
        {achievements.map((achievement: any, index: number) => (
          <Card key={achievement.id || index} style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
              <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(achievement.rarity) }]}>
                <Text style={styles.rarityText}>{achievement.rarity?.toUpperCase() || 'COMMON'}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

// Connections Tab Component
function ConnectionsTab({ connections }: { connections: any }) {
  if (!connections || connections.length === 0) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Social Connections</Text>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No connections yet.</Text>
          <Text style={styles.emptySubtext}>Join more games to meet players!</Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Social Connections</Text>
      
      <View style={styles.connectionsList}>
        {connections.map((connection: any, index: number) => (
          <Card key={connection.username || index} style={styles.connectionCard}>
            <View style={styles.connectionHeader}>
              <Avatar 
                name={connection.displayName || connection.username} 
                uri={connection.avatarUrl ?? undefined} 
                size={40} 
              />
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>
                  {connection.displayName || connection.username}
                </Text>
                <Text style={styles.connectionStats}>
                  {connection.gamesPlayedTogether || 0} games together
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
}

// History Tab Component
function HistoryTab({ gameHistory, onGamePress }: { gameHistory: any; onGamePress: (id: string) => void }) {
  if (!gameHistory?.pages?.[0]?.content || gameHistory.pages[0].content.length === 0) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Game History</Text>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No games played yet.</Text>
          <Text style={styles.emptySubtext}>Join your first game to get started!</Text>
        </Card>
      </View>
    );
  }

  const games = gameHistory.pages.flatMap((page: any) => page.content);

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Recent Game History</Text>
      
      <View style={styles.gamesList}>
        {games.slice(0, 10).map((game: any, index: number) => (
          <TouchableOpacity
            key={game.id || index}
            style={styles.gameCard}
            onPress={() => onGamePress(game.gameId || game.id)}
          >
            <View style={styles.gameHeader}>
              <Text style={styles.gameTitle}>{game.gameTitle || 'Untitled Game'}</Text>
              <Text style={styles.gameDetails}>
                {game.sport || 'Unknown Sport'} • {game.venueName || 'Unknown Venue'}
              </Text>
            </View>
            <View style={styles.gameFooter}>
              <Text style={styles.gameTime}>
                {game.startsAt ? new Date(game.startsAt).toLocaleDateString() : 'Unknown Date'}
              </Text>
              <Text style={styles.gameStatus}>{game.status || 'Unknown'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// Settings Tab Component
function SettingsTab({ user, router }: { user: any; router: any }) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Account Settings</Text>
      
      <View style={styles.settingsList}>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/account/edit')}
        >
          <Ionicons name="person-outline" size={24} color={Colors.text.secondary} />
          <Text style={styles.settingLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/account/password')}
        >
          <Ionicons name="lock-closed-outline" size={24} color={Colors.text.secondary} />
          <Text style={styles.settingLabel}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/account/email')}
        >
          <Ionicons name="mail-outline" size={24} color={Colors.text.secondary} />
          <Text style={styles.settingLabel}>Change Email</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Helper function for rarity colors
function getRarityColor(rarity: string) {
  switch (rarity?.toLowerCase()) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#9932CC';
    case 'rare': return '#4169E1';
    case 'uncommon': return '#32CD32';
    default: return '#808080';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  
  sidebar: {
    width: 280,
    backgroundColor: Colors.background.secondary,
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
    paddingVertical: 20,
  },
  
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    marginBottom: 20,
  },
  
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  
  profileUsername: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  
  roleBadge: {
    backgroundColor: Colors.nepal.crimson,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  roleText: {
    fontSize: 12,
    color: Colors.nepal.white,
    fontWeight: '500',
  },
  
  navItems: {
    paddingHorizontal: 20,
  },
  
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  
  navItemActive: {
    backgroundColor: Colors.nepal.crimson + '20',
  },
  
  navItemText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginLeft: 12,
    fontWeight: '500',
  },
  
  navItemTextActive: {
    color: Colors.nepal.crimson,
    fontWeight: '600',
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.error[50],
  },
  
  logoutText: {
    fontSize: 16,
    color: Colors.error[500],
    marginLeft: 12,
    fontWeight: '500',
  },
  
  mainContent: {
    flex: 1,
    padding: 20,
  },
  
  scrollView: {
    flex: 1,
  },
  
  tabContent: {
    gap: 20,
  },
  
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
  },
  
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.nepal.crimson,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  
  profileInfoCard: {
    padding: 20,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  
  infoLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  
  infoValue: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  
  statsCard: {
    padding: 20,
  },
  
  detailedStats: {
    gap: 12,
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  
  statRowLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  
  statRowValue: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  
  emptyText: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  
  achievementsList: {
    gap: 12,
  },
  
  achievementCard: {
    padding: 16,
  },
  
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  achievementIcon: {
    fontSize: 24,
  },
  
  achievementInfo: {
    flex: 1,
  },
  
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  achievementDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  rarityText: {
    fontSize: 10,
    color: Colors.nepal.white,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  connectionsList: {
    gap: 12,
  },
  
  connectionCard: {
    padding: 16,
  },
  
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  connectionInfo: {
    flex: 1,
  },
  
  connectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  connectionStats: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  
  gamesList: {
    gap: 12,
  },
  
  gameCard: {
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  gameHeader: {
    marginBottom: 8,
  },
  
  gameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  gameDetails: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  gameTime: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  
  gameStatus: {
    fontSize: 12,
    color: Colors.nepal.blue,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  
  settingsList: {
    gap: 8,
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
  
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text.primary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },

  loadingText: {
    fontSize: 18,
    color: Colors.text.secondary,
  },

  loadingSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },

  loadingDebug: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background.primary,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 10,
  },

  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
});
