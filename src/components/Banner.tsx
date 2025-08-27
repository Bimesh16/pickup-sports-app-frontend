import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function Banner({ text, backgroundColor = '#dc2626', top = 50 }: { text: string; backgroundColor?: string; top?: number }) {
  return (
    <View style={[styles.bar, { backgroundColor, top }]}> 
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1000,
  },
  text: { color: '#fff' },
});
