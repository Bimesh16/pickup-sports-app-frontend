import React, { useMemo, useState } from 'react';
import { Button, StyleSheet, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import PasswordField from '@/src/components/PasswordField';
import { useToast } from '@/src/components/ToastProvider';
import { validatePassword } from '@/src/utils/validation';
import { changePassword } from '@/src/features/user/api';

export default function ChangePasswordScreen() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const currentErr = useMemo(() => (current.length === 0 ? 'Current password is required' : null), [current]);
  const nextErr = useMemo(() => validatePassword(next), [next]);
  const confirmErr = useMemo(() => (confirm !== next ? 'Passwords do not match' : null), [confirm, next]);

  const canSubmit = !currentErr && !nextErr && !confirmErr;

  const onSubmit = async () => {
    try {
      setPending(true);
      await changePassword(current, next);
      toast.success('Password changed');
      router.back();
    } catch (e: any) {
      toast.error(e?.message ?? 'Change failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Change password' }} />
      <RNView style={styles.row}>
        <PasswordField label="Current password" value={current} onChangeText={setCurrent} error={currentErr || undefined} />
      </RNView>
      <RNView style={styles.row}>
        <PasswordField label="New password" value={next} onChangeText={setNext} error={nextErr || undefined} />
        <Text style={{ opacity: 0.7 }}>At least 8 chars, letters and numbers.</Text>
      </RNView>
      <RNView style={styles.row}>
        <PasswordField label="Confirm new password" value={confirm} onChangeText={setConfirm} error={confirmErr || undefined} />
      </RNView>
      <Button title={pending ? 'Saving...' : 'Save'} onPress={onSubmit} disabled={!canSubmit || pending} />
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
