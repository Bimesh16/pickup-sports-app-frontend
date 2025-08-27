import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { createInvite } from '@/src/features/games/api';

export default function GameInviteQRScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [url, setUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [QRCodeComp, setQRCodeComp] = useState<any>(null);

  useEffect(() => {
    try {
      // Dynamically require to avoid hard dependency
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('react-native-qrcode-svg');
      setQRCodeComp(mod.default ?? mod);
    } catch {
      setQRCodeComp(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setPending(true);
        const { url } = await createInvite(id);
        setUrl(url);
      } finally {
        setPending(false);
      }
    })();
  }, [id]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Invite via QR' }} />
      {pending ? (
        <ActivityIndicator />
      ) : url ? (
        <>
          {QRCodeComp ? <QRCodeComp value={url} size={240} /> : <Text style={styles.url}>{url}</Text>}
          <Text style={{ opacity: 0.7, marginTop: 12, textAlign: 'center' }}>
            Scan this code or share the link from the Game screen.
          </Text>
        </>
      ) : (
        <Text>Unable to create invite.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  url: { textAlign: 'center' },
});
