import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useToast } from '@/src/components/ToastProvider';
import { useMfaVerify } from '@/src/features/auth/hooks/useMfaVerify';
import { useResendMfa } from '@/src/features/auth/hooks/useResendMfa';
import { getRemainingSeconds, useResendCooldown } from '@/src/stores/resendCooldown';

export default function MfaScreen() {
  const { username, challenge } = useLocalSearchParams<{ username?: string; challenge?: string }>();
  const [code, setCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const toast = useToast();
  const router = useRouter();
  const verify = useMfaVerify();
  const resend = useResendMfa();
  const { markSent } = useResendCooldown();

  const canSubmit = useMemo(() => code.trim().length >= 6 && !!username, [code, username]);

  // Cooldown management (30s)
  const key = useMemo(() => `mfa:${(username ?? '').toString()}`, [username]);
  const [cooldownLeft, setCooldownLeft] = useState<number>(0);
  useEffect(() => {
    // Initialize from persisted timestamp
    setCooldownLeft(getRemainingSeconds(key, 30_000));
    const t = setInterval(() => {
      setCooldownLeft(getRemainingSeconds(key, 30_000));
    }, 1000);
    return () => clearInterval(t);
  }, [key]);

  const onSubmit = async () => {
    try {
      await verify.mutateAsync({
        username: (username ?? '').toString(),
        mfaCode: code.trim(),
        rememberDevice,
      });
      toast.success('Verified!');
      router.replace('/(tabs)' as any);
    } catch (e: any) {
      toast.error(e?.message ?? 'Verification failed');
    }
  };

  const onResend = async () => {
    if (!username || cooldownLeft > 0) return;
    try {
      await resend.mutateAsync({ username: (username ?? '').toString() });
      // Start cooldown
      markSent(key);
      setCooldownLeft(30);
      toast.info('Code sent');
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not resend code');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Verify code' }} />
      <Text style={styles.title}>Enter code</Text>
      {challenge ? <Text style={{ opacity: 0.7, marginBottom: 6 }}>Challenge: {challenge}</Text> : null}
      <RNView style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          autoCapitalize="none"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          maxLength={6}
          onSubmitEditing={onSubmit}
          blurOnSubmit
        />
      </RNView>
      <RNView style={styles.row}>
        <Button title={rememberDevice ? 'Remember device: ON' : 'Remember device: OFF'} onPress={() => setRememberDevice(v => !v)} />
      </RNView>
      <Button title={verify.isPending ? 'Verifying…' : 'Verify'} onPress={onSubmit} disabled={!canSubmit || verify.isPending} />
      <RNView style={{ marginTop: 8, gap: 8 }}>
        <Button
          title={
            resend.isPending
              ? 'Sending…'
              : cooldownLeft > 0
              ? `Resend (${cooldownLeft}s)`
              : 'Resend code'
          }
          onPress={onResend}
          disabled={resend.isPending || !username || cooldownLeft > 0}
        />
        <Button title="Back to Sign in" onPress={() => router.replace('/(auth)/login' as any)} />
      </RNView>
    </View>
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
});
