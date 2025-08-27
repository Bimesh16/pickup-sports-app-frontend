import React, { useCallback, useState } from 'react';
import { ActionSheetIOS, Button, Platform, StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

type Props = {
  onPicked: (uri: string) => void;
};

export default function AvatarPicker({ onPicked }: Props) {
  const [pending, setPending] = useState(false);
  const [supported, setSupported] = useState(true);

  const ensurePicker = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('expo-image-picker');
    } catch {
      setSupported(false);
      return null;
    }
  };

  const pickFromLibrary = useCallback(async () => {
    const ImagePicker: any = ensurePicker();
    if (!ImagePicker) return;

    try {
      setPending(true);
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        onPicked(result.assets[0].uri);
      }
    } finally {
      setPending(false);
    }
  }, [onPicked]);

  const takePhoto = useCallback(async () => {
    const ImagePicker: any = ensurePicker();
    if (!ImagePicker) return;

    try {
      setPending(true);
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        onPicked(result.assets[0].uri);
      }
    } finally {
      setPending(false);
    }
  }, [onPicked]);

  if (!supported) {
    return (
      <View style={styles.container}>
        <Text style={{ opacity: 0.8 }}>Image picker not available.</Text>
      </View>
    );
  }

  const openSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Choose from library', 'Take photo'],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) pickFromLibrary();
          if (idx === 2) takePhoto();
        }
      );
    } else {
      // Simple two buttons for Android/web
      pickFromLibrary();
      // Optionally, you could render two buttons instead of a sheet
    }
  };

  return (
    <View style={styles.container}>
      <Button title={pending ? 'Opening…' : 'Choose photo'} onPress={openSheet} disabled={pending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
