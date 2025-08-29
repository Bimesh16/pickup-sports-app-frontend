import { Stack } from 'expo-router';

export default function GameStackLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerTitle: 'Game',
        headerBackTitle: 'Back',
        headerTintColor: '#DC2626', // Nepal crimson
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
      }} 
    />
  );
}
