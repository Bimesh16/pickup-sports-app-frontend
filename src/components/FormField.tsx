import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  rightElement?: React.ReactNode;
};

export default function FormField({ label, error, style, rightElement, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <RNView style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : null,
            rightElement ? styles.inputWithAddon : null,
            style,
          ]}
          placeholderTextColor="#9ca3af"
          {...rest}
        />
        {rightElement ? <RNView style={styles.rightElement}>{rightElement}</RNView> : null}
      </RNView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  label: { marginBottom: 6, fontWeight: '500' },
  inputWrapper: { position: 'relative' },
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
  inputWithAddon: { paddingRight: 28 },
  rightElement: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: { color: '#ef4444', marginTop: 4 },
});
