import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Link } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useLogin } from '@/src/features/auth/hooks/useLogin';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  const login = useLogin();

  const canSubmit = useMemo(() => {
    if (!username || !password) return false;
    if (mfaRequired && !mfaCode) return false;
    return true;
  }, [username, password, mfaRequired, mfaCode]);
  const onSubmit = async () => {
    try {
      const res: any = await login.mutateAsync({
        username,
        password,
        mfaCode: mfaRequired ? mfaCode : undefined,
        rememberDevice: mfaRequired ? rememberDevice : undefined,
      });
      if (res?.mfaRequired) {
        setMfaRequired(true);
      }
    } catch (e: any) {
      if (e?.error === 'email_unverified') {
        Alert.alert('Email not verified', 'Please verify your email and try again.');
      } else if (e?.error === 'too_many_requests') {
        Alert.alert('Too many requests', 'Please wait a moment before trying again.');
      } else if (e?.message) {
        Alert.alert('Login failed', e.message);
      } else {
        Alert.alert('Login failed', 'Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <RNView style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          autoComplete="username"
        />
      </RNView>
      <RNView style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoComplete="password"
        />
      </RNView>

      {mfaRequired && (
        <>
          <RNView style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="MFA code"
              keyboardType="number-pad"
              value={mfaCode}
              onChangeText={setMfaCode}
            />
          </RNView>
          <RNView style={styles.formRow}>
            <Text onPress={() => setRememberDevice((v) => !v)} style={styles.checkbox}>
              {rememberDevice ? '☑' : '☐'} Remember this device
            </Text>
          </RNView>
        </>
      )}

      <RNView style={styles.formRow}>
        {login.isPending ? (
          <ActivityIndicator />
        ) : (
          <Button title={mfaRequired ? 'Verify & Sign in' : 'Sign in'} onPress={onSubmit} disabled={!canSubmit} />
        )}
      </RNView>

      <RNView style={styles.links}>
        <Link href="/(auth)/forgot">Forgot password?</Link>
      </RNView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'stretch', justifyContent: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  formRow: { marginBottom: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  links: { marginTop: 16, alignItems: 'center' },
  checkbox: { fontSize: 16 },
});
