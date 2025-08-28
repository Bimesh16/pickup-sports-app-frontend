import React, { useMemo, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View as RNView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { useOnboardingStore } from '@/src/stores/onboarding';

export default function OnboardingLocation() {
  const router = useRouter();
  const setCity = useOnboardingStore((s) => s.setCity);
  const storedCity = useOnboardingStore((s) => s.city);
  const [city, setCityInput] = useState(storedCity ?? '');
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');
  const [locPending, setLocPending] = useState(false);

  const error = useMemo(() => (!city.trim() ? 'City is required' : null), [city]);

  const onNext = () => {
    const latNum = lat.trim() ? Number(lat) : undefined;
    const lonNum = lon.trim() ? Number(lon) : undefined;
    setCity(city.trim(), Number.isFinite(latNum as number) ? (latNum as number) : null, Number.isFinite(lonNum as number) ? (lonNum as number) : null);
    router.push('/(onboarding)/sports' as any);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', default: undefined })} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Choose city' }} />
        <Text style={styles.title}>Where do you play?</Text>
        <RNView style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="City (e.g., San Francisco)"
            autoCapitalize="words"
            value={city}
            onChangeText={setCityInput}
          />
        </RNView>
        <RNView style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Latitude (optional)"
            keyboardType="numbers-and-punctuation"
            value={lat}
            onChangeText={setLat}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Longitude (optional)"
            keyboardType="numbers-and-punctuation"
            value={lon}
            onChangeText={setLon}
          />
        </RNView>
        {error ? <Text style={{ color: '#ef4444' }}>{error}</Text> : null}
        <RNView style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
          <Button title={locPending ? 'Detecting…' : 'Use my location'} onPress={async () => {
            if (locPending) return;
            let Location: any = null;
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              Location = require('expo-location');
            } catch {
              // Module not available; silently ignore
            }
            if (!Location) return;
            try {
              setLocPending(true);
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                setLocPending(false);
                return;
              }
              const { coords } = await Location.getCurrentPositionAsync({});
              if (coords?.latitude && coords?.longitude) {
                setLat(String(coords.latitude));
                setLon(String(coords.longitude));
                // Best effort reverse geocode to suggest city
                try {
                  const places = await Location.reverseGeocodeAsync({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                  });
                  const suggestion = places?.[0]?.city || places?.[0]?.region || places?.[0]?.name;
                  if (suggestion && !city) setCityInput(suggestion);
                } catch {
                  // ignore reverse geocode errors
                }
              }
            } finally {
              setLocPending(false);
            }
          }} />
          <Button title="Next" onPress={onNext} disabled={!!error} />
        </RNView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
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
