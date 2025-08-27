import React, { useMemo, useState } from 'react';
import { Button, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useToast } from '@/src/components/ToastProvider';
import { changeEmail } from '@/src/features/user/api';

export default function ChangeEmailScreen() {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const router = useRouter();

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
        <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
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
