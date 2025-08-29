import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '@/src/components/branding/AppLogo';
import { PrimaryButton, OutlineButton } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { useLogin } from '@/src/features/auth/hooks/useLogin';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const loginMutation = useLogin();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        username: username.trim(),
        password: password.trim(),
      });

      if ('user' in result) {
        // Login successful, navigation will be handled by root layout
        Alert.alert('Success', 'नमस्ते! Welcome to PickupSports!');
      } else if (result.mfaRequired) {
        // Handle MFA if your backend supports it
        Alert.alert('MFA Required', 'Please complete multi-factor authentication');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    }
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.nepal}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <AppLogo size="xl" variant="full" showTagline />
              <Text style={styles.welcomeText}>🇳🇵 नमस्ते!</Text>
              <Text style={styles.subtitleText}>Welcome to Nepal's Sports Community</Text>
            </View>

            {/* Login Form */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Sign In</Text>
              <Text style={styles.formSubtitle}>लगइन गर्नुहोस्</Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={Colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor={Colors.text.secondary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={Colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Password"
                    placeholderTextColor={Colors.text.secondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={Colors.text.secondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <PrimaryButton
                title={loginMutation.isPending ? "Signing In..." : "Sign In"}
                onPress={handleLogin}
                disabled={loginMutation.isPending}
                loading={loginMutation.isPending}
                fullWidth
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <OutlineButton
                title="Create Account"
                onPress={handleRegister}
                fullWidth
                style={styles.registerButton}
              />
            </Card>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🏔️ From Himalaya to Terai - Find Your Game
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  background: {
    flex: 1,
  },
  
  keyboardContainer: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Theme.spacing[6],
  },
  
  logoSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing[8],
  },
  
  welcomeText: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.nepal.white,
    marginTop: Theme.spacing[4],
    marginBottom: Theme.spacing[2],
  },
  
  subtitleText: {
    fontSize: Theme.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  
  formCard: {
    padding: Theme.spacing[6],
    marginBottom: Theme.spacing[6],
  },
  
  formTitle: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing[1],
  },
  
  formSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.nepal.blue,
    textAlign: 'center',
    marginBottom: Theme.spacing[6],
    fontWeight: Theme.typography.fontWeight.medium,
  },
  
  inputContainer: {
    gap: Theme.spacing[4],
    marginBottom: Theme.spacing[6],
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: Theme.spacing[4],
  },
  
  inputIcon: {
    marginRight: Theme.spacing[3],
  },
  
  input: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    color: Colors.text.primary,
    paddingVertical: Theme.spacing[4],
  },
  
  passwordInput: {
    paddingRight: Theme.spacing[10], // Space for toggle button
  },
  
  passwordToggle: {
    position: 'absolute',
    right: Theme.spacing[4],
    padding: Theme.spacing[2],
  },
  
  loginButton: {
    marginBottom: Theme.spacing[4],
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing[4],
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  
  dividerText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Colors.text.secondary,
    marginHorizontal: Theme.spacing[4],
  },
  
  registerButton: {
    marginTop: Theme.spacing[2],
  },
  
  footer: {
    alignItems: 'center',
  },
  
  footerText: {
    fontSize: Theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: Theme.typography.fontWeight.medium,
  },
});