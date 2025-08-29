import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.nepal.crimson,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopColor: Colors.border.light,
          borderTopWidth: 1,
          paddingBottom: 20,
          paddingTop: 12,
          height: 90,
          shadowColor: Colors.shadow.colored,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background.primary,
          borderBottomColor: Colors.border.light,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: Colors.text.primary,
          fontWeight: '600',
        },
        headerTintColor: Colors.nepal.crimson,
      }}>
      
      {/* Main App - Only 5 Essential Tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarLabel: 'Games',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable accessibilityLabel="About" accessibilityRole="link">
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={20}
                    color={Colors.text.primary}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      
      <Tabs.Screen
        name="two"
        options={{
          title: 'Create',
          tabBarLabel: 'Create',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="venues"
        options={{
          title: 'Venues',
          tabBarLabel: 'Venues',
          tabBarIcon: ({ color }) => <TabBarIcon name="map-marker" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="regions"
        options={{
          title: 'Regions',
          tabBarLabel: 'Regions',
          tabBarIcon: ({ color }) => <TabBarIcon name="globe" color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      
      {/* Hidden Screens - Accessible via profile or direct navigation */}
      <Tabs.Screen
        name="game"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      
      <Tabs.Screen
        name="account"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      
      <Tabs.Screen
        name="about"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      
      <Tabs.Screen
        name="my"
        options={{
          href: null, // Hide from tab bar - accessible via profile
        }}
      />
      
      <Tabs.Screen
        name="stats"
        options={{
          href: null, // Hide from tab bar - accessible via profile
        }}
      />
      
      <Tabs.Screen
        name="analytics"
        options={{
          href: null, // Hide from tab bar - accessible via profile
        }}
      />
    </Tabs>
  );
}
