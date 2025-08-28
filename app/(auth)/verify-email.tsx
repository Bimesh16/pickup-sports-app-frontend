import React, { useEffect, useMemo, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useToast } from '@/src/components/ToastProvider';
import { useResendVerification } from '@/src/features/auth/hooks/useResendVerification';
import { getRemainingSeconds, useResendCooldown } from '@/src/stores/resendCooldown';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string; username?: string }>();
  const [email, setEmail] = useState((params.email ?? '').toString());
  const [username, setUsername] = useState((params.username ?? '').toString());
  const [captchaToken, setCaptchaToken] = useState('');
  const resend = useResendVerification();
  const toast = useToast();
  const router = useRouter();
  const { markSent } = useResendCooldown();

  const error = useMemo(() => {
    if (!email.trim() && !username.trim()) return 'Enter email or username';
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'Enter a valid email';
    return null;
  }, [email, username]);

  // Cooldown (60s) per identity
  const key = useMemo(() => `verify:${email || username}`, [email, username]);
  const [cooldownLeft, setCooldownLeft] = useState<number>(0);
  useEffect(() => {
    setCooldownLeft(getRemainingSeconds(key, 60_000));
    const t = setInterval(() => setCooldownLeft(getRemainingSeconds(key, 60_000)), 1000);
    return () => clearInterval(t);
  }, [key]);

  const onSubmit = async () => {
    if (error || resend.isPending || cooldownLeft > 0) return;
    try {
      await resend.mutateAsync({
        email: email.trim() || undefined,
        username: username.trim() || undefined,
        captchaToken: captchaToken.trim() || undefined,
      });
      markSent(key);
      setCooldownLeft(60);
      toast.success('Verification email sent');
      router.replace('/(auth)/login' as any);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to send verification email');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Verify email' }} />
        <Text style={styles.title}>Resend verification email</Text>
        <RNView style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Email (or username below)"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={onSubmit}
            blurOnSubmit
          />
        </RNView>
        <RNView style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Username (optional if email provided)"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={onSubmit}
            blurOnSubmit
          />
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={resend.isPending ? 'Sending…' : cooldownLeft > 0 ? `Send (${cooldownLeft}s)` : 'Send verification'}
          onPress={onSubmit}
          disabled={!!error || resend.isPending || cooldownLeft > 0}
        />
        <RNView style={{ marginTop: 8 }}>
          <Button title="Back to Sign in" onPress={() => router.replace('/(auth)/login' as any)} />
        </RNView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  row: { marginBottom: 8 },
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
