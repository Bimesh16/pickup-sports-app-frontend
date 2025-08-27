import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { Text, View } from '@/components/Themed';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
};

export default function FormField({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#9ca3af"
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  label: { marginBottom: 6, fontWeight: '500' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: { color: '#ef4444', marginTop: 4 },
});
