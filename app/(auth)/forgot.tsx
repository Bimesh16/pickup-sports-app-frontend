import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useToast } from '@/src/components/ToastProvider';
import { api } from '@/src/api/client';

export default function ForgotPasswordScreen() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const onSubmit = async () => {
    try {
      setPending(true);
      await api.post('/auth/forgot', { usernameOrEmail }, { headers: { 'Cache-Control': 'no-store' } });
      toast.info('If an account exists, password reset instructions have been sent.');
    } catch (e: any) {
      toast.error(e?.message ?? 'Please try again later.');
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot password</Text>
      <RNView style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Email or username"
          autoCapitalize="none"
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          autoComplete="email"
        />
      </RNView>
      <Button
        title={pending ? 'Sending...' : 'Send reset link'}
        onPress={onSubmit}
        disabled={!usernameOrEmail || pending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'stretch', justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  formRow: { marginBottom: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
});
