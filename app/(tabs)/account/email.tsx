import React, { useEffect, useMemo, useState } from 'react';
import { Button, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useToast } from '@/src/components/ToastProvider';
import { changeEmail, getEmailVerificationStatus, resendVerificationEmail } from '@/src/features/user/api';
import { useAuthStore } from '@/src/stores/auth';

export default function ChangeEmailScreen() {
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState(user?.username ?? '');
  const [pending, setPending] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [resending, setResending] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const v = await getEmailVerificationStatus();
        setVerified(v);
      } catch {
        // ignore if not supported
      }
    })();
  }, []);

  const error = useMemo(() => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'Enter a valid email';
    return null;
  }, [email]);

  const onSubmit = async () => {
    if (error) return;
    try {
      setPending(true);
      await changeEmail(email.trim());
      toast.success('Email change requested. Check your inbox.');
      router.back();
    } catch (e: any) {
      toast.error(e?.message ?? 'Change failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Change email' }} />
      <RNView style={styles.row}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
        {verified !== null ? (
          <Text style={{ color: verified ? '#16a34a' : '#f59e0b' }}>
            {verified ? 'Verified' : 'Verification pending'}
          </Text>
        ) : null}
        {verified === false ? (
          <Button
            title={resending ? 'Resending...' : 'Resend verification'}
            onPress={async () => {
              try {
                setResending(true);
                await resendVerificationEmail();
                toast.success('Verification email sent');
              } catch (e: any) {
                toast.error(e?.message ?? 'Resend failed');
              } finally {
                setResending(false);
              }
            }}
            disabled={resending}
          />
        ) : null}
      </RNView>
      <Button title={pending ? 'Saving...' : 'Save'} onPress={onSubmit} disabled={!!error || pending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { gap: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
