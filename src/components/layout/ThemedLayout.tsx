import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SplashScreen } from '@/src/components/screens/SplashScreen';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';
import { useColorScheme } from '@/components/useColorScheme';

interface ThemedLayoutProps {
  children: React.ReactNode;
  showSplash?: boolean;
  backgroundColor?: string;
}

export function ThemedLayout({ 
  children, 
  showSplash = false,
  backgroundColor 
}: ThemedLayoutProps) {
  const [splashVisible, setSplashVisible] = useState(showSplash);
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const bgColor = backgroundColor || (isDark ? Colors.background.dark : Colors.background.primary);

  const handleSplashComplete = () => {
    setSplashVisible(false);
  };

  if (splashVisible) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} />;
  }

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {children}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
