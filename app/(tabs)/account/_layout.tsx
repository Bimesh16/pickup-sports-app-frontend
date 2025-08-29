import { Stack } from 'expo-router';

export default function AccountStackLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerTitle: 'Account',
        headerBackTitle: 'Back',
        headerTintColor: '#DC2626', // Nepal crimson
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
      }} 
    />
  );
}
