import React, { useMemo, useState } from 'react';
import { Button, Pressable, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text, View } from '@/components/Themed';
import { useToast } from '@/src/components/ToastProvider';
import { useRegister } from '@/src/features/auth/hooks/useRegister';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [usernameBlurred, setUsernameBlurred] = useState(false);
  const [email, setEmail] = useState('');
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const register = useRegister();
  const toast = useToast();
  const router = useRouter();

  const errors = useMemo(() => {
    return {
      username: !username.trim() && usernameBlurred ? 'Username is required' : null,
      email: emailBlurred && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) ? 'Enter a valid email' : null,
      password: passwordBlurred && password.length < 8 ? 'Password must be at least 8 characters' : null,
    };
  }, [username, usernameBlurred, email, emailBlurred, password, passwordBlurred]);

  const canSubmit = useMemo(() => {
    if (!username.trim()) return false;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return false;
    if (password.length < 8) return false;
    return true;
  }, [username, email, password]);

  const onSubmit = async () => {
    if (!canSubmit || register.isPending) return;
    try {
      const res = await register.mutateAsync({
        username: username.trim(),
        email: email.trim(),
        password,
        captchaToken: captchaToken.trim() || undefined,
      });
      if ('mfaRequired' in res && res.mfaRequired) {
        toast.info('MFA required. Continue to verification.');
        router.push({ pathname: '/(auth)/mfa', params: { username: username.trim(), challenge: res.challenge } } as any);
        return;
      }
      if ((res as any)?.verificationRequired) {
        toast.info('Check your inbox to verify your email');
        router.replace({ pathname: '/(auth)/verify-email', params: { email: email.trim(), username: username.trim() } } as any);
        return;
      }
      toast.success('Account created');
      router.replace('/(auth)/login' as any);
    } catch (e: any) {
      toast.error(e?.message ?? 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create account' }} />
      <Text style={styles.title}>Create account</Text>
      <RNView style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          onBlur={() => setUsernameBlurred(true)}
          onSubmitEditing={onSubmit}
          blurOnSubmit
        />
        {errors.username ? <Text style={styles.error}>{errors.username}</Text> : null}
      </RNView>
      <RNView style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailBlurred(true)}
          onSubmitEditing={onSubmit}
          blurOnSubmit
        />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
      </RNView>
      <RNView style={styles.row}>
        <RNView style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onBlur={() => setPasswordBlurred(true)}
            onSubmitEditing={onSubmit}
            blurOnSubmit
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
            <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={18} />
          </Pressable>
        </RNView>
        {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
      </RNView>
      <RNView style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="CAPTCHA token (optional)"
          autoCapitalize="none"
          value={captchaToken}
          onChangeText={setCaptchaToken}
          onSubmitEditing={onSubmit}
          blurOnSubmit
        />
      </RNView>
      <Button title={register.isPending ? 'Creating…' : 'Create account'} onPress={onSubmit} disabled={!canSubmit || register.isPending} />
      <RNView style={{ marginTop: 8 }}>
        <Button title="Back to Sign in" onPress={() => router.replace('/(auth)/login' as any)} />
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  row: { marginBottom: 8 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  error: { color: '#ef4444', marginTop: 4 },
});
