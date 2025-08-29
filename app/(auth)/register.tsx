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
import { useRegister } from '@/src/features/auth/hooks/useRegister';
import { Colors } from '@/src/constants/Colors';
import Theme from '@/src/constants/Theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const registerMutation = useRegister();

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      if (result.registered) {
        Alert.alert(
          'Success!', 
          'Account created successfully! Please sign in.',
          [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    }
  };

  const handleBackToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.everest}
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
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.nepal.white} />
              </TouchableOpacity>
            </View>

            {/* Logo Section */}
            <View style={styles.logoSection}>
              <AppLogo size="large" variant="icon" />
              <Text style={styles.welcomeText}>Join the Community</Text>
              <Text style={styles.subtitleText}>समुदायमा सामेल हुनुहोस्</Text>
            </View>

            {/* Register Form */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>नयाँ खाता बनाउनुहोस्</Text>

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
                    name="mail-outline" 
                    size={20} 
                    color={Colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={Colors.text.secondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
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
                    returnKeyType="next"
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

                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="checkmark-circle-outline" 
                    size={20} 
                    color={Colors.text.secondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={Colors.text.secondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>
              </View>

              <PrimaryButton
                title={registerMutation.isPending ? "Creating Account..." : "Create Account"}
                onPress={handleRegister}
                disabled={registerMutation.isPending}
                loading={registerMutation.isPending}
                fullWidth
                style={styles.registerButton}
              />

              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleBackToLogin}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </Card>
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
    paddingHorizontal: Theme.spacing[6],
    paddingVertical: Theme.spacing[4],
  },
  
  header: {
    position: 'absolute',
    top: Theme.spacing[12],
    left: Theme.spacing[6],
    zIndex: 1,
  },
  
  backButton: {
    padding: Theme.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Theme.borderRadius.lg,
  },
  
  logoSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing[6],
  },
  
  welcomeText: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.nepal.crimson,
    marginTop: Theme.spacing[4],
    marginBottom: Theme.spacing[1],
  },
  
  subtitleText: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.nepal.blue,
    textAlign: 'center',
    fontWeight: Theme.typography.fontWeight.medium,
  },
  
  formCard: {
    padding: Theme.spacing[6],
  },
  
  formTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
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
    paddingRight: Theme.spacing[10],
  },
  
  passwordToggle: {
    position: 'absolute',
    right: Theme.spacing[4],
    padding: Theme.spacing[2],
  },
  
  registerButton: {
    marginBottom: Theme.spacing[4],
  },
  
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loginLinkText: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.text.secondary,
  },
  
  loginLink: {
    fontSize: Theme.typography.fontSize.base,
    color: Colors.nepal.crimson,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
});