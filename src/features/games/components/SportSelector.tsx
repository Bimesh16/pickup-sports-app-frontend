import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';

const SPORTS = ['Soccer', 'Basketball', 'Tennis', 'Volleyball', 'Baseball'];

type Props = {
  value?: string;
  onChange: (sport?: string) => void;
};

export default function SportSelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {SPORTS.map((s) => {
        const selected = s === value;
        return (
          <Pressable
            key={s}
            onPress={() => onChange(selected ? undefined : s)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{s}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#bfdbfe',
    borderColor: '#2563eb',
  },
  chipText: {
    color: '#374151',
  },
  chipTextSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
});
