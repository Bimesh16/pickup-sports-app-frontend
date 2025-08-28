import React, { useMemo, useState } from 'react';
import { Button, Modal, Platform, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';

type Props = {
  visible: boolean;
  initialCity?: string;
  initialRadiusKm?: number | null | undefined;
  onApply: (v: { city: string; radiusKm: number | null }) => void;
  onClose: () => void;
};

export default function CitySwitcher({ visible, initialCity, initialRadiusKm, onApply, onClose }: Props) {
  const [city, setCity] = useState(initialCity ?? '');
  const [radius, setRadius] = useState<string>(initialRadiusKm != null ? String(initialRadiusKm) : '');
  const error = useMemo(() => (!city.trim() ? 'City is required' : null), [city]);

  const apply = () => {
    const km = radius.trim() ? Number(radius) : null;
    if (radius.trim() && (!Number.isFinite(km as number) || (km as number) <= 0)) return;
    onApply({ city: city.trim(), radiusKm: km });
  };

  // Reset when becoming visible
  React.useEffect(() => {
    if (visible) {
      setCity(initialCity ?? '');
      setRadius(initialRadiusKm != null ? String(initialRadiusKm) : '');
    }
  }, [visible, initialCity, initialRadiusKm]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Set city</Text>
          <RNView style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="City (e.g., San Francisco)"
              autoCapitalize="words"
              value={city}
              onChangeText={setCity}
            />
          </RNView>
          <RNView style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Radius km (optional)"
              keyboardType="number-pad"
              value={radius}
              onChangeText={setRadius}
            />
          </RNView>
          {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
          <RNView style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Apply" onPress={apply} disabled={!!error} />
          </RNView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  row: { marginBottom: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
});
