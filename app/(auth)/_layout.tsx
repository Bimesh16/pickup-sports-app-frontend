import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '@/src/constants/Colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.nepal.crimson,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen 
        name="register" 
        options={{
          title: 'Create Account',
        }}
      />
    </Stack>
  );
}