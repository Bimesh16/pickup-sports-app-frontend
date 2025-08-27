import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput, View as RNView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { api } from '@/src/api/client';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);

  const onSubmit = async () => {
    if (!token) {
      Alert.alert('Invalid link', 'Reset token is missing.');
      return;
    }
    if (!password || password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    try {
      setPending(true);
      await api.post('/auth/reset', { token, password }, { headers: { 'Cache-Control': 'no-store' } });
      Alert.alert('Success', 'Your password has been reset. You can now sign in.');
    } catch (e: any) {
      Alert.alert('Reset failed', e?.message ?? 'Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>
      <RNView style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="New password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </RNView>
      <RNView style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />
      </RNView>
      <Button
        title={pending ? 'Resetting...' : 'Reset password'}
        onPress={onSubmit}
        disabled={!password || !confirm || pending}
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
