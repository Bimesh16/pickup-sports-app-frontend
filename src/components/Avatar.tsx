import React, { useMemo } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

type Props = {
  name: string;
  uri?: string | null;
  size?: number;
};

export default function Avatar({ name, uri, size = 36 }: Props) {
  const initials = useMemo(() => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    const a = (parts[0]?.[0] ?? '').toUpperCase();
    const b = (parts[1]?.[0] ?? '').toUpperCase();
    return (a + b) || (a || '?');
  }, [name]);

  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.text}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff', fontWeight: '600' },
});
