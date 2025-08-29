import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppLogo } from '@/src/components/branding/AppLogo';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  // Floating animation for background elements
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start floating animations
    const createFloatingAnimation = (animatedValue: Animated.Value, duration: number, delay: number = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start background and floating animations
    Animated.parallel([
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      createFloatingAnimation(float1, 3000, 0),
      createFloatingAnimation(float2, 4000, 1000),
      createFloatingAnimation(float3, 3500, 2000),
    ]).start();

    // Main logo animation sequence
    const logoAnimation = Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Tagline entrance
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]);

    // Start the main animation after a brief delay
    const timer = setTimeout(() => {
      logoAnimation.start(() => {
        // Animation complete, notify parent after a brief pause
        setTimeout(() => {
          onAnimationComplete?.();
        }, 1000);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const getFloatingStyle = (animatedValue: Animated.Value, translateY: number) => ({
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, translateY],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated Background */}
      <Animated.View 
        style={[
          styles.backgroundContainer,
          { opacity: backgroundOpacity }
        ]}
      >
        <LinearGradient
          colors={Colors.gradients.nepal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Floating Background Elements */}
          <Animated.View 
            style={[
              styles.floatingElement,
              styles.floatingElement1,
              getFloatingStyle(float1, -20),
              { opacity: backgroundOpacity }
            ]}
          />
          <Animated.View 
            style={[
              styles.floatingElement,
              styles.floatingElement2,
              getFloatingStyle(float2, -30),
              { opacity: backgroundOpacity }
            ]}
          />
          <Animated.View 
            style={[
              styles.floatingElement,
              styles.floatingElement3,
              getFloatingStyle(float3, -25),
              { opacity: backgroundOpacity }
            ]}
          />
        </LinearGradient>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }
          ]}
        >
          <AppLogo size="xl" variant="icon" />
        </Animated.View>

        {/* App Name */}
        <Animated.View 
          style={[
            styles.titleContainer,
            { opacity: logoOpacity }
          ]}
        >
          <Text style={styles.appName}>
            <Text style={styles.appNameBold}>Pickup</Text>
            <Text style={styles.appNameRegular}>Sports</Text>
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View 
          style={[
            styles.taglineContainer,
            { opacity: taglineOpacity }
          ]}
        >
          <Text style={styles.tagline}>Find Your Game</Text>
          <View style={styles.taglineUnderline} />
        </Animated.View>
      </View>

      {/* Loading Indicator */}
      <Animated.View 
        style={[
          styles.loadingContainer,
          { opacity: taglineOpacity }
        ]}
      >
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.loadingDot, { opacity: float1 }]} />
          <Animated.View style={[styles.loadingDot, { opacity: float2 }]} />
          <Animated.View style={[styles.loadingDot, { opacity: float3 }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.nepal.crimson,
  },
  
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  
  gradient: {
    flex: 1,
    position: 'relative',
  },
  
  floatingElement: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
  },
  
  floatingElement1: {
    width: 120,
    height: 120,
    top: height * 0.15,
    left: width * 0.1,
  },
  
  floatingElement2: {
    width: 80,
    height: 80,
    top: height * 0.25,
    right: width * 0.15,
  },
  
  floatingElement3: {
    width: 60,
    height: 60,
    bottom: height * 0.2,
    left: width * 0.2,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing[8],
  },
  
  logoContainer: {
    marginBottom: Theme.spacing[6],
  },
  
  titleContainer: {
    marginBottom: Theme.spacing[4],
  },
  
  appName: {
    fontSize: 48,
    textAlign: 'center',
    letterSpacing: -1,
  },
  
  appNameBold: {
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  
  appNameRegular: {
    fontWeight: Theme.typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  taglineContainer: {
    alignItems: 'center',
  },
  
  tagline: {
    fontSize: Theme.typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Theme.typography.fontWeight.medium,
    letterSpacing: 1,
    marginBottom: Theme.spacing[2],
  },
  
  taglineUnderline: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
  
  loadingContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  
  loadingDots: {
    flexDirection: 'row',
    gap: Theme.spacing[2],
  },
  
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
